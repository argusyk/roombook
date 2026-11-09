#!/usr/bin/env bash
# tools/ci/test-guard.sh – ознаки послаблення тестів у гілці
set -euo pipefail
BASE="${1:-origin/main}"
files=$(git diff --name-only "$BASE"...HEAD \
  | grep -E '\.(test|spec)\.ts$' || true)
if [ -z "$files" ]; then echo "test-guard: тести не змінено"; exit 0; fi
d=$(git diff "$BASE"...HEAD -- $files)
removed=$(grep -cE '^-[^-].*expect\(' <<<"$d" || true)
added=$(grep -cE '^\+[^+].*expect\(' <<<"$d" || true)
skips=$(grep -cE '^\+.*\.(skip|only|todo)\(' <<<"$d" || true)
weak='toBeDefined|toBeTruthy|expect\.anything|GreaterThanOrEqual'
loose=$(grep -cE "^\+.*($weak)\(" <<<"$d" || true)
echo "test-guard: files=$(wc -w <<<"$files")" \
     "expect -$removed +$added skip=$skips loose=$loose"
if [ "$skips" -gt 0 ] || [ "$removed" -gt "$added" ]; then
  echo "test-guard: FAIL, потрібне явне схвалення людини"; exit 1
fi
