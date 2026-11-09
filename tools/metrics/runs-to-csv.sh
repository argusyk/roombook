#!/usr/bin/env bash
# tools/metrics/runs-to-csv.sh <каталог з артефактами gh run download>
# Рядки метрик запусків (JSON, по одному на рядок) -> CSV у stdout.
set -euo pipefail
dir="$1"

echo "ts,kind,sha,status,duration_s,items,turns,errors"
find "$dir" -type f -name '*.jsonl' -print0 \
  | xargs -0 cat \
  | jq -r 'select(has("kind") and has("status"))
      | [.ts, .kind, .sha, .status, .duration_s, .items, .turns, .errors]
      | @csv'
