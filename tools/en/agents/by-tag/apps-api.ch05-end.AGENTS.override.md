<!-- English override of apps/api/AGENTS.md for readers of the English edition
     of "Developing with Codex". Installed as apps/api/AGENTS.override.md by
     tools/en/use-english-agents.sh; mirrors apps/api/AGENTS.md at ch05-end..ch11-end.
     Source: tools/en/agents/by-tag/apps-api.ch05-end.AGENTS.override.md -->
# apps/api: backend rules

Reply to the user in English. Error messages and test names in apps/api are
in Ukrainian; keep new ones in Ukrainian too (see the root instructions).

## Package commands
- Tests: `pnpm --filter @roombook/api test:unit` - Vitest, no DB;
  `test`/`test:int` need PostgreSQL with `DATABASE_URL`
  (see `apps/api/.env.example`).
- After changing schema.prisma:
  `pnpm --filter @roombook/api exec prisma generate`.
- New migration: `pnpm --filter @roombook/api exec prisma migrate dev
  --name <short_name>`.
  Include the SQL of the generated migration in the report.

## Architecture
- Fastify route -> service -> Prisma. A route only validates input with a zod
  schema from packages/shared and calls a service. Business rules live in services.
- Take domain errors from packages/shared/src/errors.ts. Do not throw strings.
- Booking conflict check: apps/api/src/booking/conflicts.ts.
  The check and the write are not atomic yet (docs/backlog.md). Do not fix
  this in passing; there is a separate task for it.

## Time and dates
- All dates in the code are a Date in UTC. Do not use the process's local time.
- Tests with time zones pin the time with vi.useFakeTimers and explicit
  ISO strings with the Z suffix. Do not rely on the machine clock.

## Code Review Rules
- P1: a change to prisma/schema.prisma without a corresponding migration.
- P1: writing a booking while bypassing the conflict check.
- P1: computing in a local time zone instead of UTC.
