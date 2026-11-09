#!/usr/bin/env bash
# tools/agents/wt-new.sh <роль> <issue> <слот>
# Створює робоче дерево для одного агента:
# гілка, .env, порти, база, залежності.
set -euo pipefail
role="$1"; issue="$2"; slot="$3"            # слот 1..8 задає зсув портів
root="$(git rev-parse --show-toplevel)"
wt="$root/../roombook-wt/$role"
db="roombook_wt_${role}"

git -C "$root" worktree add "$wt" -b "agent/$role/$issue" main

# .env API (Prisma читає apps/api/.env) і web: власні порти і власна база
grep -vE '^(API_PORT|DATABASE_URL)=' "$root/apps/api/.env.example" \
  > "$wt/apps/api/.env"
cat >> "$wt/apps/api/.env" <<EOF
API_PORT=$((3000 + slot))
DATABASE_URL=postgresql://roombook:roombook@localhost:5432/${db}
EOF
cat > "$wt/apps/web/.env" <<EOF
API_PORT=$((3000 + slot))
WEB_PORT=$((5173 + slot))
EOF

createdb -h localhost -U roombook "$db" 2>/dev/null || echo "база $db вже є"
createdb -h localhost -U roombook "${db}_test" 2>/dev/null || true  # для test:int
cd "$wt"
pnpm install --frozen-lockfile --offline
pnpm --filter @roombook/api exec prisma generate
pnpm --filter @roombook/api exec prisma migrate deploy
echo "$wt  agent/$role/$issue" \
     " api:$((3000 + slot))  web:$((5173 + slot))  db:$db"
