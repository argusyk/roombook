#!/usr/bin/env bash
# tools/review/precision.sh <номер PR>
# Точність коментарів агента в одному PR.
BOT="[логін бота Codex]"
gh api "repos/{owner}/{repo}/pulls/$1/comments" --paginate |
  jq --arg bot "$BOT" '[.[] | select(.user.login == $bot)]
      | {comments: length,
         tp: (map(select(.reactions["+1"] > 0)) | length),
         fp: (map(select(.reactions["-1"] > 0)) | length)}'
