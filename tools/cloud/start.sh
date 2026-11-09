#!/usr/bin/env bash
# tools/cloud/start.sh – старт кожної хмарної задачі
set -euo pipefail
sudo service postgresql start
for i in $(seq 1 30); do pg_isready -q -h localhost && break; sleep 1; done
pg_isready -h localhost   # впасти явно, якщо база не піднялася
# нові коміти після публікації середовища
pnpm --filter @roombook/api exec prisma migrate deploy
# сід через upsert, повторний запуск безпечний
pnpm --filter @roombook/api exec prisma db seed
