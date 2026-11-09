<!-- English override of AGENTS.md (repository root) for readers of the English
     edition of "Developing with Codex". Installed as AGENTS.override.md by
     tools/en/use-english-agents.sh; mirrors AGENTS.md on main (ch18-end).
     Source: tools/en/agents/root.AGENTS.override.md -->
# RoomBook: instructions for agents

A service for booking classrooms and consultations at the department. A pnpm
monorepo: apps/api (Fastify, Prisma, PostgreSQL 16), apps/web (React 19, Vite),
packages/shared (zod schemas for the API and web), legacy-php (old reports).

## Language
- Reply to the user in English: plans, questions, reports and summaries.
- The repository itself is in Ukrainian: UI labels, error messages, seed
  data, test names, code comments, docs/ and the commit history. Do not
  translate or rename existing strings, test names or files unless the task
  explicitly asks for it. E2E tests find elements by their Ukrainian
  accessible names.
- New user-facing texts (UI labels, error messages) are written in Ukrainian
  (the RoomBook UI language), in the style of the existing ones. In the report,
  give the English meaning of every new Ukrainian string.
- New code comments and commit messages may be in English.
- English translations of UI strings: docs/en/ui-strings.md.

## Commands
- Dependencies are already installed. Do not run `pnpm install` unless
  necessary, and do not add new dependencies unless the task explicitly asks.
- Type check: `pnpm -r typecheck`
- Linter: `pnpm -r lint`
- API tests without a DB: `pnpm --filter @roombook/api test:unit`
- API tests with a DB (need PostgreSQL at `DATABASE_URL`):
  `pnpm --filter @roombook/api test` or `test:int`
- A single test file: `pnpm --filter @roombook/api exec vitest run <path>`
- E2E (Playwright, needs a running DB): `pnpm test:e2e`. Run it only
  when a change touches the UI or API routes.
- A full `pnpm test` in the root produces a very large output. Run the tests
  of the package you are changing first.

## Conventions
- TypeScript strict, no `any` in new files.
- Shared types and validation live only in the zod schemas of packages/shared.
  Do not duplicate schemas in apps/api or apps/web.
- Time in the DB and API is stored only in UTC (timestamptz). Conversion
  to Europe/Kyiv happens only in apps/api/src/time.ts and on the client
  when displaying.
- Commits follow Conventional Commits (`feat(api): ...`, `fix(web): ...`),
  one logical step per commit. A logic change goes together with a test.

## Boundaries
- Do not change .github/workflows/, pnpm-lock.yaml (except for dependency
  tasks) or migrations already applied in apps/api/prisma/migrations/.
- Do not edit tests to make them pass. If a test seems wrong,
  stop and explain why.
- legacy-php/ has its own stricter rules: legacy-php/AGENTS.md (English:
  legacy-php/AGENTS.override.md, if installed). Report migration tasks read
  it explicitly first: from the root or apps/api this file does not get
  into the instruction chain.
- Secrets never go into the code or into this file. Configuration
  goes through .env following the .env.example template.

## Tests
- Tests are the specification. Do not change, delete or disable
  (skip, only, todo) existing tests without explicit permission in the task.
- Do not weaken checks: do not replace an exact expectation with a broader
  one, do not wrap expect in try/catch, do not mock the module under test.
- The test oracle does not import the code under test: the expected value
  is derived from the requirement, not from a call to the same function.
- A new test must fail first. In the report, give the failure output before
  the implementation and the passing output after it.
- If a test seems wrong, stop and explain why, with a reference to the
  requirement. A test change goes in a separate `test: ...` commit.
- A bug that was found but not fixed is recorded with an it.fails test and
  a description in docs/backlog.md.
- Before the report, run tools/ci/test-guard.sh and include its output.

## Evidence of completion
The final report contains:
1. the output of `pnpm -r typecheck` and of the tests of the changed packages;
2. `git diff --stat` relative to the base branch;
3. a list of changes outside the plan, or the word "none".

## Plans and specifications
Specifications are in docs/specs/, plans with checkpoints in docs/plans/,
deferred items in docs/backlog.md. Read them when a task refers to them.
