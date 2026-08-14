#!/usr/bin/env node
// CSS design-rule check — the missing third enforcement layer.
//
// .claude/hooks/check-design.mjs guards Claude's Edit/Write inside a session,
// and eslint-rules/jaml-design.js guards everything else — but ESLint only ever
// looks at **/*.{ts,tsx}. CSS was policed by nothing, which is how 36 flex
// declarations accumulated in jimbo.css, the one file where "most layout
// actually lives" (the hook's own words). This script closes that gap: it is
// the CI mirror of rule #1 for stylesheets.
//
// Scope is deliberately narrow. Rule #1 (no flex) is the only design rule that
// is meaningful in a stylesheet; the rest are about JSX authoring.
//
// Usage: node scripts/check-css-design.mjs   (exit 1 on violation)

import { readFileSync } from "node:fs";
import { readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const SRC = join(ROOT, "src");

/**
 * gap, justify-content, align-items, place-items and the flex-start/flex-end
 * *values* are all valid in grid and are deliberately not flagged — only the
 * flex container declaration and the flex-item properties are.
 */
const FORBIDDEN = [
  [/display\s*:\s*(inline-)?flex\b/, "display: flex / inline-flex"],
  [/(^|[;{\s])flex-(direction|wrap|grow|shrink|basis)\s*:/, "a flex-* property"],
  [/(^|[;{\s])flex\s*:\s*[\d.]/, "the flex shorthand"],
];

function cssFiles(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...cssFiles(full));
    else if (name.endsWith(".css")) out.push(full);
  }
  return out;
}

const violations = [];

for (const file of cssFiles(SRC)) {
  const lines = readFileSync(file, "utf8").split(/\r?\n/);
  lines.forEach((line, i) => {
    // Skip comment-only lines so prose about flex does not trip the check.
    if (/^\s*(\/\*|\*)/.test(line)) return;
    for (const [re, label] of FORBIDDEN) {
      if (re.test(line)) {
        violations.push(
          `${relative(ROOT, file)}:${i + 1}  ${label}\n    ${line.trim()}`,
        );
        break;
      }
    }
  });
}

if (violations.length === 0) {
  console.log("css design rules: ok (no flex in src/**/*.css)");
  process.exit(0);
}

console.error(
  [
    `CSS design rule #1 violated — no flex anywhere in src/ (${violations.length} found):`,
    "",
    ...violations.map((v) => "  " + v),
    "",
    "This UI ships as an MCP app inside host iframes that size flex content",
    "differently per host, so flex reflows differently depending on where it is",
    "embedded. Use display: grid or absolute positioning. gap, justify-content,",
    "align-items and the flex-start/flex-end values are fine inside grid.",
    'See CLAUDE.md "Design rules".',
  ].join("\n"),
);
process.exit(1);
