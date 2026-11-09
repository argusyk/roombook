#!/usr/bin/env bash
# tools/codex/fix-loop.sh – зовнішній цикл «тести → виправлення»
# з межами ітерацій і часу
set -euo pipefail
MAX_ITER=${MAX_ITER:-3}
# без БД: агент у пісочниці не має сокетів (розд. 7)
TEST_CMD=${TEST_CMD:-"pnpm --filter @roombook/api test:unit"}
LOG=$(mktemp)

for i in $(seq 0 "$MAX_ITER"); do
  if $TEST_CMD >"$LOG" 2>&1; then
    echo "fix-loop: зелено після $i ітерацій"
    bash tools/ci/test-guard.sh origin/main      # тести не послаблено?
    exit 0
  fi
  [ "$i" -eq "$MAX_ITER" ] && break
  msg="Тести падають. Останні рядки виводу:
$(tail -n 80 "$LOG")
Виправ код. Тестові файли, міграції і .github/ не змінюй."
  if [ "$i" -eq 0 ]; then
    timeout 15m codex exec -p ci "$msg" >/dev/null
  else
    # профіль – перед resume: пісочниця не зберігається в сесії
    timeout 15m codex exec -p ci resume --last "$msg" >/dev/null
  fi || {
    rc=$?; echo "fix-loop: codex завершився з кодом $rc"; exit "$rc"
  }
done
echo "fix-loop: ліміт $MAX_ITER ітерацій вичерпано, потрібна людина"; exit 1
