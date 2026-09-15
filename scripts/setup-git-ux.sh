#!/bin/sh
# One-shot per clone. Wires the git UX aliases into LOCAL config.
# Run from anywhere inside the repo:  sh scripts/setup-git-ux.sh
set -e
cd "$(git rev-parse --show-toplevel)"

git config alias.snap '!node scripts/git-snap.mjs'
git config alias.lost '!node scripts/git-lost.mjs'

echo "wired into local git config:"
echo "  git snap   — save WIP to refs/snapshots (zero disturbance, run before any thrash)"
echo "  git lost   — recovery desk: snapshots + reflog + resurrect commands"
