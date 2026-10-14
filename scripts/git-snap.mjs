#!/usr/bin/env node
// git-snap — zero-disturbance WIP snapshot.
//
// Captures index + worktree (including untracked files) into a commit stored
// under refs/snapshots/<branch>/<timestamp>. Nothing about the working tree,
// the real index, HEAD, or any branch changes. Safe mid-merge, mid-rebase,
// detached HEAD, dirty, whatever. This is the "my ideas were LOST in GIT
// HURRICANES" antidote: thrash all you want, the snapshot ref survives.
//
// Usage:  node scripts/git-snap.mjs [--quiet] [--force]
// Recovery:  git lost   (lists snapshots + tells you how to resurrect one)

import { execFileSync } from "node:child_process";
import { copyFileSync, rmSync } from "node:fs";
import { join } from "node:path";

const quiet = process.argv.includes("--quiet");
const force = process.argv.includes("--force");
const say = (msg) => { if (!quiet) console.log(msg); };
const die = (msg, code = 1) => { console.error(`git-snap: ${msg}`); process.exit(code); };

const run = (args, env = {}) =>
  execFileSync("git", args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, ...env },
  }).trim();

let root;
try {
  root = run(["rev-parse", "--show-toplevel"]);
} catch {
  die("not inside a git repo");
}
process.chdir(root);

const gitDir = run(["rev-parse", "--absolute-git-dir"]);
const head = (() => { try { return run(["rev-parse", "HEAD"]); } catch { return null; } })();
const branch = (() => { try { return run(["symbolic-ref", "--short", "-q", "HEAD"]); } catch { return "detached"; } })();

// Nothing dirty -> nothing to save. --force snapshots anyway (rarely wanted).
const dirty = run(["status", "--porcelain"]).length > 0;
if (!dirty && !force) {
  say("git-snap: tree is clean, nothing to snapshot");
  process.exit(0);
}

const stamp = new Date()
  .toISOString()
  .replace(/[-:]/g, "")
  .replace("T", "-")
  .slice(0, 15); // YYYYMMDD-HHMMSS (utc)
const ref = `refs/snapshots/${branch}/${stamp}`;
const message = `wip snapshot ${branch} @ ${new Date().toISOString()}`;

// Stage the world into a THROWAWAY index. The real index is untouched,
// so this never interferes with an in-flight merge/rebase/cherry-pick.
// The temp index is SEEDED FROM THE REAL INDEX first: this repo commits
// gitignored files (.agents/skills, 148 of them), and an empty temp index
// would treat those as ignored-untracked and silently drop them from the
// snapshot. Seeding preserves exactly what git considers tracked.
const tmpIndex = join(gitDir, `index.snap-${process.pid}`);
try {
  try {
    copyFileSync(join(gitDir, "index"), tmpIndex);
  } catch {
    // repo without an index yet (nothing committed) — empty temp index is fine
  }
  run(["add", "-A", "--ignore-errors"], { GIT_INDEX_FILE: tmpIndex });
  const tree = run(["write-tree"], { GIT_INDEX_FILE: tmpIndex });
  const sha = run(
    ["commit-tree", tree, ...(head ? ["-p", head] : []), "-m", message],
  );
  run(["update-ref", ref, sha]);
  say(`git-snap: ${sha.slice(0, 10)} saved (${branch})`);
  say(`git-snap: recover with →  git diff ${sha.slice(0, 10)}   or   git branch rescue ${sha.slice(0, 10)}`);
} catch (err) {
  die(`snapshot failed: ${err.message}`);
} finally {
  rmSync(tmpIndex, { force: true });
}

// Prune ancient snapshots beyond the newest 200 so refs stay cheap.
try {
  const refs = run(["for-each-ref", "--format=%(refname)", "refs/snapshots"])
    .split("\n").filter(Boolean).sort();
  for (const old of refs.slice(0, Math.max(0, refs.length - 200))) {
    run(["update-ref", "-d", old]);
  }
} catch {
  // pruning is best-effort; never fail the snap over it
}
