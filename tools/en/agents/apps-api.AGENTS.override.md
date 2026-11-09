<!-- English override of apps/api/AGENTS.md for readers of the English edition
     of "Developing with Codex". Installed as apps/api/AGENTS.override.md by
     tools/en/use-english-agents.sh; mirrors apps/api/AGENTS.md on main (ch18-end).
     Source: tools/en/agents/apps-api.AGENTS.override.md -->
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
- Overlapping bookings are forbidden by the `booking_no_overlap` constraint; do
  not bypass it and do not remove it from the migrations. 23P01 -> ConflictError
  (`isOverlapViolation`).

## Time and dates
- All dates in the code are a Date in UTC. Do not use the process's local time.
- Tests with time zones pin the time with vi.useFakeTimers and explicit
  ISO strings with the Z suffix. Do not rely on the machine clock.

## Tests with a database
- *.int.test.ts tests need PostgreSQL. If there is no database, stop and say
  so: do not disable, skip (describe.skipIf and the like) or rewrite them.
  An environment defect is fixed in the environment (tools/cloud/*), not in
  the code.

## Code Review Rules
- P1: a change to prisma/schema.prisma without a corresponding migration.
- P1: writing a booking while bypassing the conflict check.
- P1: computing or storing dates in a local time zone instead of UTC.
  Formatting for a human through formatInTimeZone with CAMPUS_TZ is not
  a violation.
- P1: an endpoint that changes a booking or the waitlist does not check the
  state of the slot (taken, already past, closed for sign-up).
- P1: a violation of the rules in docs/domain-rules.md (sign-up closes
  2 hours before the start, sign-up limits per student).
- P1: an external side effect (email, webhook) inside a DB transaction:
  send only after COMMIT.
