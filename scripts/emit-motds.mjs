// Emit src/motd/motdData.generated.ts from the JAML.motds corpus.
//
// The corpus lives in its own repo (JAML.motds) so anyone can open a PR full of
// backronyms without touching library source. This pulls the current MOTD.md,
// drops blank lines, dedupes case-insensitively (keeping first spelling), and
// writes a frozen array. Never hand-edit the generated file.
//
// Usage: node scripts/emit-motds.mjs [path/to/MOTD.md]

import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const source = resolve(process.argv[2] ?? "../JAML.motds/MOTD.md");
const out = resolve("src/motd/motdData.generated.ts");

const raw = await readFile(source, "utf8");
const seen = new Set();
const motds = [];
for (const line of raw.split(/\r?\n/)) {
  const entry = line.trim();
  if (!entry) continue;
  const key = entry.toLowerCase();
  if (seen.has(key)) continue;
  seen.add(key);
  motds.push(entry);
}

const body = motds.map((m) => `  ${JSON.stringify(m)},`).join("\n");

await writeFile(
  out,
  `// AUTO-GENERATED — do not hand-edit.
//
// ${motds.length} alternate meanings of JAML, generated from the JAML.motds
// corpus (MOTD.md). Add new ones there and re-run \`pnpm motd:emit\`.

export const JAML_MOTDS: readonly string[] = Object.freeze([
${body}
]);
`,
  "utf8",
);

console.log(`emit-motds: ${motds.length} entries -> ${out}`);
