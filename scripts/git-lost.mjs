#!/usr/bin/env node
// git-lost — "where the fuck did my work go" recovery desk.
//
// Lists WIP snapshots (newest first) plus the reflog, and prints the exact
// commands to resurrect anything. Snapshots are made by scripts/git-snap.mjs
// (aka `git snap`), which any destructive op should run first.

import { execFileSync } from "node:child_process";

const run = (args) => {
  try {
    return execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
  } catch {
    return "";
  }
};

let root;
try {
  root = run(["rev-parse", "--show-toplevel"]);
} catch {
  console.error("git-lost: not inside a git repo");
  process.exit(1);
}
process.chdir(root);

const C = { b: "\x1b[1m", d: "\x1b[2m", y: "\x1b[33m", c: "\x1b[36m", x: "\x1b[0m" };

console.log(`${C.b}SNAPSHOTS${C.x}  ${C.d}(wip saves — these never move, thrash all you want)${C.x}`);
const snaps = run([
  "for-each-ref",
  "--sort=-creatordate",
  "--format=%(creatordate:iso-local)|%(objectname:short)|%(refname:strip=2)",
  "refs/snapshots",
]);
if (snaps) {
  for (const line of snaps.split("\n").slice(0, 20)) {
    const [date, sha, ref] = line.split("|");
    console.log(`  ${C.c}${date}${C.x}  ${C.y}${sha}${C.x}  ${ref}`);
  }
  if (snaps.split("\n").length > 20) console.log(`  ${C.d}…older ones: git for-each-ref refs/snapshots${C.x}`);
} else {
  console.log(`  ${C.d}none yet — dirty tree + git snap = one appears${C.x}`);
}

console.log(`\n${C.b}REFLOG${C.x}  ${C.d}(where HEAD has been — reset/rebase/amend all leave tracks)${C.x}`);
const reflog = run(["reflog", "--date=iso", "-n", "15"]);
console.log(reflog ? reflog.split("\n").map((l) => `  ${l}`).join("\n") : `  ${C.d}empty${C.x}`);

console.log(`
${C.b}RESURRECT${C.x}
  look inside a snapshot     git show ${C.y}<sha>${C.x}
  diff it against now        git diff ${C.y}<sha>${C.x}
  grab one commit's worth    git cherry-pick ${C.y}<sha>${C.x}
  full rescue branch         git branch rescue-${new Date().toISOString().slice(0, 10)} ${C.y}<sha>${C.x}
  nuked commits from reflog  git reset --soft ${C.y}<sha>${C.x}
`);
