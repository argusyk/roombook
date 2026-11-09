#!/usr/bin/env bash
# tools/codex/checkpoint.sh – знімок робочої копії перед сесією агента
set -euo pipefail
git status --short
if [ -n "$(git status --porcelain)" ]; then
  git stash push --include-untracked -m "checkpoint $(date +%F-%H%M)"
  git stash apply --quiet
  echo "checkpoint: збережено в git stash"
fi
echo "ignored (не захищено git):"
git status --short --ignored | grep '^!!' || echo "  немає"
