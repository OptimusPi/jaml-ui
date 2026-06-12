#!/usr/bin/env node
// Stop hook — refuse to "finish" while the current change contains soft code.
//
// Diff-scoped: only ADDED lines in the working-tree diff (vs HEAD) are scanned,
// so pre-existing legacy markers (e.g. the tracked TODO(jimbo-primitives)) never
// trip it. Pure git + regex, so it runs even on a fresh clone with no node_modules.
//
// Two gates:
//   1. soft code   — LLM placeholders, stub bodies, untagged TODO/FIXME
//   2. NO FLEX      — display:flex et al in *.css (hard rule #4; eslint can't see css)
// Plus an opportunistic lint gate on changed files when eslint is installed.

import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';

const root = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const EXTS = /\.(tsx?|jsx?|mjs|css)$/;
const IGNORE = /^\.claude\//; // the gate's own tooling is not subject to content scanning

const sh = (cmd) => {
  try {
    return execSync(cmd, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  } catch {
    return '';
  }
};

const block = (reason) => {
  process.stdout.write(JSON.stringify({ decision: 'block', reason }));
  process.exit(0);
};

if (!sh('git rev-parse --is-inside-work-tree').trim()) process.exit(0);

const diff = sh("git diff HEAD --unified=0 -- '*.ts' '*.tsx' '*.js' '*.jsx' '*.mjs' '*.css'");
// Untracked files are invisible to `git diff`; scan their full content as added lines.
const untracked = sh('git ls-files --others --exclude-standard')
  .split('\n')
  .filter((f) => f && EXTS.test(f) && !IGNORE.test(f));
if (!diff.trim() && untracked.length === 0) process.exit(0);

const SOFT = [
  /\.\.\.\s*existing code/i,
  /rest of (the )?(code|function|file|implementation)/i,
  /\b(your code|implementation|code)\s+(goes\s+)?here\b/i,
  /omitted for brevity|abbreviated for brevity/i,
  /\bsimilar to above\b|\bsee (implementation )?above\b/i,
  /continue (from|implementation) here/i,
  /TODO:?\s*implement\b/i,
  /NotImplementedException/,
  /throw new Error\(\s*['"`][^'"`]*not[ _-]?implemented/i,
];
const BARE_TODO = /\b(TODO|FIXME)\b/;
const TAGGED_TODO = /\b(TODO|FIXME)\((#?[\w-]+)\)/; // TODO(#12) / TODO(jimbo-primitives) — allowed
const CSS_FLEX = /display:\s*(inline-)?flex\b|flex-direction|flex-wrap|(^|[;{\s])flex:\s/i;

const hits = [];
const scan = (path, lineno, c) => {
  if (IGNORE.test(path)) return;
  let why = '';
  if (SOFT.some((re) => re.test(c))) why = 'placeholder / stub';
  else if (BARE_TODO.test(c) && !TAGGED_TODO.test(c)) why = 'bare TODO/FIXME — tag it: TODO(#123)';
  else if (path.endsWith('.css') && CSS_FLEX.test(c)) why = 'NO FLEX (hard rule #4) — use grid / margin:auto';
  if (why) hits.push(`${path}:${lineno}  [${why}]  ${c.trim().slice(0, 90)}`);
};

// 1. added lines in the tracked diff
let file = '';
let lineno = 0;
for (const ln of diff.split('\n')) {
  if (ln.startsWith('+++ b/')) { file = ln.slice(6); continue; }
  if (ln.startsWith('@@')) {
    const m = ln.match(/\+(\d+)/);
    lineno = m ? parseInt(m[1], 10) : 0;
    continue;
  }
  if (ln.startsWith('+')) { scan(file, lineno, ln.slice(1)); lineno++; }
  // context / removed lines: ignore
}

// 2. whole content of untracked (brand-new) files
for (const path of untracked) {
  let content = '';
  try { content = readFileSync(`${root}/${path}`, 'utf8'); } catch { continue; }
  content.split('\n').forEach((c, i) => scan(path, i + 1, c));
}

if (hits.length) {
  block(
    'Soft code in this change — resolve before finishing:\n' +
      hits.map((h) => '  - ' + h).join('\n') +
      '\n\nReplace placeholders with real implementation; swap any css flex for grid / margin:auto.' +
      '\nDeferrals must be tagged: TODO(#issue) or TODO(jimbo-primitives).'
  );
}

// Opportunistic lint gate — only when eslint is actually installed (graceful on fresh clones).
const eslintBin = `${root}/node_modules/.bin/eslint`;
if (existsSync(eslintBin)) {
  const changed = [
    ...sh("git diff HEAD --name-only --diff-filter=ACM -- '*.ts' '*.tsx' '*.js' '*.jsx' '*.mjs'").split('\n'),
    ...untracked.filter((f) => !f.endsWith('.css')),
  ].filter(Boolean);
  if (changed.length) {
    let out = '';
    try {
      execSync(`${JSON.stringify(eslintBin)} ${changed.map((f) => JSON.stringify(f)).join(' ')}`, {
        cwd: root,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
      });
    } catch (e) {
      out = ((e.stdout || '') + (e.stderr || '')).trim();
    }
    if (out) block('Lint failed on changed files — fix before finishing:\n' + out.slice(0, 4000));
  }
}

process.exit(0);
