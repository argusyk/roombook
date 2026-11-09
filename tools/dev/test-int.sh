#!/usr/bin/env bash
# tools/dev/test-int.sh – інтеграційні тести API з PostgreSQL.
# Запускає ЛЮДИНА в окремому терміналі (або агент після погодження «Yes, once»
# поза пісочницею): у workspace-write з вимкненою мережею підключення до
# localhost:5432 заблоковане.
set -euo pipefail
root="$(git rev-parse --show-toplevel)"
cd "$root"

docker compose up -d db
for _ in $(seq 1 30); do
  docker compose exec -T db pg_isready -U roombook -q && break
  sleep 1
done
docker compose exec -T db pg_isready -U roombook

# робоча база розробника (apps/api/.env) – до актуальної схеми
pnpm --filter @roombook/api exec prisma migrate deploy
# тестова база <ім'я>_test: міграції застосовує globalSetup проєкту int
pnpm --filter @roombook/api test:int "$@"
