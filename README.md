# RoomBook

**Українською** · [English](README.en.md) – для англомовного видання посібника / for the English edition of the book

RoomBook – сервіс бронювання аудиторій і консультацій кафедри: студенти й
викладачі бронюють аудиторії на пари, викладачі відкривають слоти консультацій
і щотижневі серії, студенти записуються на консультації та стають у лист
очікування. Це навчальний проєкт – наскрізний приклад посібника
«Developing with Codex: агентна розробка програмного забезпечення»: кожен розділ
посібника змінює код, а стан на кінець розділу зафіксовано анотованим тегом.

Оповідь посібника (люди, issue, PR, інциденти, дати) вигадана; номери issue і PR
належать оповіді й у репозиторії не відтворюються. Усі прогони, тривалості,
бюджети, метрики й лічильники RoomBook у книзі – умовні дані навчального прикладу.
Еталони тижневого звіту (`apps/api/test/golden/room-week/`) синтетичні.

## Склад

| Каталог | Що це |
|---|---|
| `apps/api` | `@roombook/api` – Node 22, TypeScript, Fastify 5, Prisma 6, PostgreSQL 16, zod |
| `apps/web` | `@roombook/web` – React 19 + Vite 7, Vitest + Testing Library, Playwright |
| `packages/shared` | `@roombook/shared` – zod-схеми, доменні помилки, `percentOf`, контракт листа очікування |
| `packages/mcp-db` | `@roombook/mcp-db` – MCP-сервер `roombook_db` лише для читання (розд. 8) |
| `legacy-php/` | старі звіти завантаженості (PHP 5-стиль, mysqli, cp1251, без тестів) |
| `tools/` | профілі й правила Codex, CI-скрипти, хмарне середовище, worktree агентів, метрики |
| `docs/` | специфікації, плани, backlog, журнали налагодження, політика рев'ю, модель загроз |

## Клонування і теги

```bash
git clone https://github.com/argusyk/roombook.git ~/src/roombook
cd ~/src/roombook
git tag -l 'ch*'                                   # перелік тегів розділів
git switch -c ch02-first-session ch02-start        # гілка для вправ розділу 2
```

Кожен анотований тег фіксує стан коду на кінець розділу. Стартовий тег вправ
розділу N – тег кінця найближчого попереднього розділу, що змінював код.
Розділи 1 і 2 код не змінюють; гілка `main` = стан `ch18-end` плюс файли
англомовного видання (`README.en.md`, `tools/en/`, `docs/en/`,
`docs/mockups/my-consultations.en.png`), які код не змінюють.

| Тег | Стан коду | Стартовий для вправ розд. |
|---|---|---|
| `ch02-start` | стан, описаний у розділі 1: тест `winter schedule` червоний, AGENTS.md і профілів немає | 2, 3 |
| `ch03-end` | виправлено часовий пояс у `slots.ts`, три тести переходу на літній/зимовий час | 4 |
| `ch04-end` | серії бронювань (`BookingSeries`, `POST /booking-series`), `docs/plans`, `docs/backlog.md` | 5 |
| `ch05-end` | три AGENTS.md, `AGENTS.override.md` у `.gitignore` | 6 |
| `ch06-end` | `tools/codex/profiles/{safe,work,ci}.config.toml`, `install-profiles.sh`, `.codex/config.toml` | 7 |
| `ch07-end` | `tools/codex/rules/roombook.rules`, `checkpoint.sh`, профіль `deps`, `tools/dev/test-int.sh` | 8 |
| `ch08-end` | `packages/mcp-db`, MCP у `.codex/config.toml`, скіл `db-report`, `MyConsultations.tsx`, `GET /me/bookings` | 9 |
| `ch09-end` | `SlotForm.tsx`, `lib/forms/fieldErrors.ts`, `apps/web/AGENTS.md` | 10 |
| `ch10-end` | властивості P1 і P2 (fast-check), виправлення `lt/gt`, e2e `booking-flow.spec.ts`, Stryker, `test-guard.sh` | 11 |
| `legacy-room-week-final` | тег оповіді розділу 11: остання версія `room_week.php` перед вимкненням | – |
| `ch11-end` | тижневий звіт в `apps/api`, `percentOf()`, еталони, кодмод | 12 |
| `ch12-end` | обмеження `booking_no_overlap`, 23P01 → 409, атомарні серії, без N+1, `docs/debugging/` | 13 |
| `ch13-end` | `tools/cloud/*`, експорт iCal, нагадування, статистика аудиторій | 14 |
| `ch14-end` | лист очікування (`WaitlistEntry`, три маршрути), `wt-new.sh`, `wt-rm.sh` | 15 |
| `ch15-end` | сповіщення про промоцію і закриття запису за 2 год, `docs/review-policy.md`, CODEOWNERS | 16 |
| `ch16-end` | `ci.yml` (job `lint`, `test`, `e2e`), `codex-autofix.yml`, `codex-review.yml`, `codex-nightly.yml`, `fix-loop.sh`, `summarize-run.sh`, `nightly-triage.mts` | 17 |
| `ch17-end` | `docs/security/threat-model.md`, профіль `report`, канарка (користувач 9001 у seed), сканування секретів у CI, явні `permissions` | 18 |
| `ch18-end` | `tools/metrics/*` – скрипти метрик і схема CSV | – |

`docker-compose.yml` і `pnpm db:up` є вже в `ch02-start`. Гілки, які згадує
оповідь (`ch05-agents-md`, `ch10-tdd`, `feature/recurring-bookings`,
`agent/<роль>/<issue>`), – локальні гілки читача. У репозиторії є лише `main` і теги.

## Запуск

Потрібні Node 22, pnpm (через corepack) і Docker для PostgreSQL 16.

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm db:up                                   # docker compose up -d db: бази roombook і roombook_test
cp apps/api/.env.example apps/api/.env       # DATABASE_URL до локальної бази
pnpm --filter @roombook/api exec prisma migrate deploy
pnpm --filter @roombook/api exec prisma db seed
pnpm --filter @roombook/api dev              # API на :3000
pnpm --filter @roombook/web dev              # web на :5173 (проксі /api → :3000)
```

Вхід у розробці – `POST /auth/dev-login` з email із seed (`teacher1@roombook.test`,
`student01@roombook.test`, …); паролів немає, у production dev-вхід вимкнено.

## Тести

| Що | Команда | База даних |
|---|---|---|
| перевірка типів, лінтер | `pnpm -r typecheck`, `pnpm -r lint` | ні |
| модульні тести | `pnpm --filter @roombook/api test:unit`, `pnpm --filter @roombook/web test`, `pnpm --filter @roombook/shared test` | ні |
| інтеграційні тести API | `pnpm --filter @roombook/api test:int` або `tools/dev/test-int.sh` | так |
| усі тести API | `pnpm --filter @roombook/api test` | так |
| e2e (Playwright) | `pnpm --filter @roombook/web test:e2e` (API і web запущено) | так |

Інтеграційні тести працюють з окремою базою `<база з DATABASE_URL>_test`
(типово `roombook_test`, її створює `pnpm db:up`) і самі застосовують до неї
міграції (globalSetup виконує `prisma migrate deploy`), тож після `pnpm db:up`
досить `pnpm --filter @roombook/api test`.

### Тести і пісочниця агента

У режимі `workspace-write` з вимкненою мережею команди агента не можуть
підключитися ні до PostgreSQL на `localhost`, ні до dev-сервера. Тому:

| Що | Хто і де |
|---|---|
| typecheck, lint, модульні тести | агент у пісочниці (профілі `work`, `ci`) |
| інтеграційні тести з PostgreSQL | людина в окремому терміналі; агент – лише після погодження конкретної команди поза пісочницею; у CI – окремий крок/job |
| e2e, dev-сервер | людина запускає API і web поза агентом; e2e – людина або CI (job `e2e`) |
| встановлення залежностей | людина до сесії або коротка сесія з профілем `deps` |
| Codex Cloud | контейнер середовища; PostgreSQL піднімають `tools/cloud/install.sh` і `tools/cloud/start.sh` |

Профілі й правила Codex встановлює `tools/codex/install-profiles.sh`
(у `~/.codex/`): `codex -p safe`, `codex -p work`, `codex -p deps`,
`codex exec -p ci …`, `codex exec -p report …`.

## CI і автоматизація Codex

`.github/workflows/ci.yml` – job `lint` (lint, typecheck, сканування секретів),
`test` (модульні + інтеграційні з `postgres:16`), `e2e` (Playwright проти API і web).

Workflow з Codex (`codex-autofix.yml`, `codex-review.yml`, `codex-nightly.yml`)
у публічному репозиторії безпечні за замовчуванням: без секрету `CODEX_API_KEY`
усі їхні job пропускаються, права мінімальні (`permissions: {}` на рівні
workflow), `pull_request_target` не використовується, нічний розбір запускається
лише вручну (`workflow_dispatch`). Щоб увімкнути їх у власному форку, додайте
секрет `CODEX_API_KEY`, мітки (`codex-autofix`, `codex-draft`, `agent-ready`,
`agent-running`, `agent-pr-open`, `agent-needs-info`) і захист гілки `main`.

## Ліцензія

MIT, див. `LICENSE`.
