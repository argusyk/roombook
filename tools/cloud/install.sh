#!/usr/bin/env bash
# tools/cloud/install.sh – фаза встановлення середовища RoomBook
set -euo pipefail

node -v | grep -q '^v22\.' \
  || { echo "Потрібен Node 22, маємо $(node -v)"; exit 1; }
corepack enable        # версія pnpm з packageManager у package.json
pnpm install --frozen-lockfile

# PostgreSQL 16 у VM; назви пакетів залежать від базового образу
sudo apt-get update -qq
sudo apt-get install -y -qq postgresql-16
sudo service postgresql start
sudo -u postgres psql -qc \
  "CREATE ROLE roombook LOGIN PASSWORD 'roombook' CREATEDB"
sudo -u postgres createdb -O roombook roombook_dev
sudo -u postgres createdb -O roombook roombook_dev_test   # для test:int

# DATABASE_URL на localhost (CAMPUS_TZ – константа в коді, не змінна)
cp -n apps/api/.env.example apps/api/.env
sed -i 's#/roombook$#/roombook_dev#' apps/api/.env
pnpm --filter @roombook/api exec prisma migrate deploy
pnpm --filter @roombook/api exec prisma db seed
sudo service postgresql stop  # у знімок потрапляють файли, не процеси
