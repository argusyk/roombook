# RoomBook

Сервіс бронювання аудиторій і консультацій кафедри: студенти й викладачі
бронюють аудиторії на пари, викладачі відкривають слоти консультацій,
студенти на них записуються. Навчальний проєкт – наскрізний приклад
посібника «Розробка з Codex».

## Склад

| Каталог | Що це |
|---|---|
| `apps/api` | `@roombook/api` – Node 22, TypeScript, Fastify 5, Prisma 6, PostgreSQL 16 |
| `apps/web` | `@roombook/web` – React 19 + Vite |
| `packages/shared` | `@roombook/shared` – zod-схеми і доменні помилки для api і web |
| `legacy-php/` | старі звіти завантаженості аудиторій (PHP 5-стиль, mysqli, без тестів) |

## Запуск

```bash
corepack enable
pnpm install --frozen-lockfile
cp apps/api/.env.example apps/api/.env      # DATABASE_URL до PostgreSQL 16
pnpm --filter @roombook/api exec prisma migrate deploy
pnpm --filter @roombook/api exec prisma db seed
pnpm --filter @roombook/api dev             # API на :3000
pnpm --filter @roombook/web dev             # web на :5173
```

## Перевірки

```bash
pnpm -r typecheck
pnpm -r lint
pnpm --filter @roombook/api test:unit       # без бази даних
pnpm --filter @roombook/api test:int        # потрібна PostgreSQL (DATABASE_URL)
pnpm --filter @roombook/web test
pnpm --filter @roombook/shared test
```

Ліцензія – MIT (див. `LICENSE`).
