#!/usr/bin/env node
// PreToolUse guard: snapshot WIP before any destructive git command runs.
//
// Wired into .claude/settings.json (matcher: Bash). Reads the hook JSON on
// stdin; if the bash command smells like tree-destroying git, take a quiet
// snapshot first, then let the command proceed. NEVER blocks — the snapshot
// is the seatbelt, not a stop sign. Regex is intentionally a touch broad:
// snapping a clean tree is a no-op, and snapping costs milliseconds.

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

let input = "";
try {
  input = readFileSync(0, "utf8");
} catch {
  process.exit(0);
}

let payload = {};
try {
  payload = JSON.parse(input);
} catch {
  process.exit(0);
}

const cmd = payload?.tool_input?.command ?? "";
if (typeof cmd !== "string" || !cmd.trim()) process.exit(0);

const DESTRUCTIVE =
  /git\s+(reset\s+--hard|clean\s+-|checkout\s+(-[a-zA-Z]*\bf|--force|--)|restore\s+(\.|--source|--staged|--worktree)|rebase\b|pull\b|merge\s+(--abort|-X)|push\b[^\n]*--force|switch\s+(-[a-zA-Z]*\bf|--force|--discard-changes))/i;

if (!DESTRUCTIVE.test(cmd)) process.exit(0);

try {
  const out = execFileSync("node", ["scripts/git-snap.mjs", "--quiet"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  }).trim();
  if (out) console.log(`[git-snap guard] ${out}`);
} catch {
  // never block the user's command over a failed snapshot
}
process.exit(0);
