#!/usr/bin/env bash
# tools/agents/wt-rm.sh <роль> [--delete-branch]
# Прибирає робоче дерево агента: worktree, бази roombook_wt_<роль>[_test],
# гілку agent/<роль>/* (лише з --delete-branch і лише злиту в main).
set -euo pipefail
role="$1"; delete_branch="${2:-}"
root="$(git rev-parse --show-toplevel)"
wt="$root/../roombook-wt/$role"
db="roombook_wt_${role}"

branch="$(git -C "$wt" branch --show-current 2>/dev/null || true)"
git -C "$root" worktree remove "$wt"          # відмовиться, якщо є незакомічені зміни
dropdb -h localhost -U roombook --if-exists "$db"
dropdb -h localhost -U roombook --if-exists "${db}_test"
if [ "$delete_branch" = "--delete-branch" ] && [ -n "$branch" ]; then
  git -C "$root" branch -d "$branch"          # -d: лише якщо гілку злито
fi
git -C "$root" worktree prune
echo "прибрано: $wt, бази $db і ${db}_test${branch:+, гілка $branch}"
