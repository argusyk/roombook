#!/usr/bin/env bash
# tools/codex/summarize-run.sh – один рядок метрик із журналу і звіту
# Використання:
#   summarize-run.sh events.jsonl report.json <вид> <тривалість_с>
# Вивід – один рядок JSON (у CI його зберігають як metrics.jsonl,
# який зводить tools/metrics/runs-to-csv.sh, додаток К).
set -uo pipefail
EVENTS="$1"; REPORT="$2"; KIND="$3"; DUR="${4:-0}"
count() { jq -r "select($1) | .type" "$EVENTS" 2>/dev/null | wc -l; }
items=$(count '.type | startswith("item.")')
errors=$(count '.type == "error"')
turns=$(count '.type == "turn.completed"')
status=$(jq -r '.status // "no-report"' "$REPORT" 2>/dev/null \
           || echo "no-report")
jq -nc --arg kind "$KIND" --arg status "$status" \
  --arg sha "${FAILED_SHA:-local}" \
  --argjson dur "$DUR" --argjson items "$items" --argjson errors "$errors" \
  --argjson turns "$turns" \
  '{ts: (now | todate), kind: $kind, sha: $sha, status: $status,
    duration_s: $dur, items: $items, turns: $turns, errors: $errors}'
