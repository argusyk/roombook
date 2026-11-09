# RoomBook commit history in English

For readers of the English edition of *Developing with Codex*. The commit
messages and tag annotations of RoomBook are in Ukrainian. This file gives an
English translation of every commit from `ch02-start` to `ch18-end`, i.e. the
output of

```bash
git log --reverse --oneline ch02-start^..ch18-end
```

Hashes are the real short hashes of the repository, so you can use them with
`git show <hash>`. To see only a part of the history, for example the range
quoted in Chapter 10 (`git log --oneline ch02-start..ch12-end`), read the rows
from `ch02-start` (exclusive) down to `ch12-end` (inclusive). Rows whose
subject is already in English are marked "(English in the repository)".

The narrative of the book (people, issues, PR numbers, dates) is fictional;
issue and PR numbers mentioned in tag annotations belong to the story and do
not exist in the repository.

## Commits

| Hash | Tag | Subject (UA, as in the repository) | Subject (EN) |
|---|---|---|---|
| `cfb1e53` | `ch02-start` | chore(dev): docker-compose і pnpm db:up; test:int сам застосовує міграції | chore(dev): docker-compose and pnpm db:up; test:int applies migrations itself |
| `3ae677e` | `ch03-end` | fix(api): часовий пояс у slotStartUtc через fromZonedTime | fix(api): time zone in slotStartUtc via fromZonedTime |
| `2441efb` |  | docs: специфікація і план повторюваних бронювань, backlog | docs: spec and plan for recurring bookings, backlog |
| `2b963bd` |  | feat(shared): WeeklyRecurrence і BookingSeriesCreate | feat(shared): WeeklyRecurrence and BookingSeriesCreate |
| `8894270` |  | feat(api): генератор дат expandWeekly з урахуванням DST | feat(api): expandWeekly date generator with DST handling |
| `cac74b8` |  | feat(api): модель BookingSeries і Booking.seriesId | feat(api): BookingSeries model and Booking.seriesId |
| `4934dcc` |  | feat(api): POST /booking-series і DELETE /booking-series/:id | feat(api): POST /booking-series and DELETE /booking-series/:id |
| `f8dc2e2` |  | feat(series): include series bookings in availability | feat(series): include series bookings in availability (English in the repository) |
| `7ff4175` | `ch04-end` | feat(web): форма щотижневої серії і e2e recurring.spec.ts | feat(web): weekly series form and e2e recurring.spec.ts |
| `9a7ca21` | `ch05-end` | docs: AGENTS.md для кореня, apps/api і legacy-php | docs: AGENTS.md for the root, apps/api and legacy-php |
| `32c5941` | `ch06-end` | chore(codex): командні профілі safe/work/ci і install-profiles.sh | chore(codex): team profiles safe/work/ci and install-profiles.sh |
| `d0e8eab` | `ch07-end` | chore(codex): правила команд, чекпойнт, профіль deps, test-int.sh | chore(codex): command rules, checkpoint, deps profile, test-int.sh |
| `09186aa` |  | feat(mcp-db): MCP-сервер roombook_db лише для читання | feat(mcp-db): read-only MCP server roombook_db |
| `357f9ff` |  | feat(skills): скіл db-report і scripts/check-report.mjs | feat(skills): db-report skill and scripts/check-report.mjs |
| `c1106de` | `ch08-end` | feat: сторінка «Мої консультації» і GET /me/bookings | feat: "My Consultations" page and GET /me/bookings |
| `111fe6f` |  | fix(web): validate booking form via shared schema, a11y field errors | fix(web): validate booking form via shared schema, a11y field errors (English in the repository) |
| `fddf303` |  | docs(web): apps/web/AGENTS.md – правила форм і доступності | docs(web): apps/web/AGENTS.md - form and accessibility rules |
| `9f14bd6` | `ch09-end` | refactor(web): shared field error helper, accessible SlotForm | refactor(web): shared field error helper, accessible SlotForm (English in the repository) |
| `964d073` |  | docs: правила тестів в AGENTS.md | docs: test rules in AGENTS.md |
| `61db0b5` |  | test: test-guard.sh і мутаційне тестування StrykerJS | test: test-guard.sh and StrykerJS mutation testing |
| `074c9c3` |  | test: P1, P2 і регресійний приклад суміжних пар | test: P1, P2 and a regression example of adjacent periods |
| `19d45bc` |  | fix(api): напіввідкриті інтервали у findConflicts | fix(api): half-open intervals in findConflicts |
| `2fba0f8` | `ch10-end` | test(web): e2e booking-flow.spec.ts; CI перевіряє test-guard у PR | test(web): e2e booking-flow.spec.ts; CI runs test-guard on PRs |
| `c583e9a` |  | docs(migration): інвентаризація legacy-звітів і правила міграції | docs(migration): inventory of legacy reports and migration rules |
| `9bb41d3` |  | test(api): еталони тижневого звіту (96 тижнів) і стенд capture-golden.sh | test(api): golden files of the weekly report (96 weeks) and the capture-golden.sh rig |
| `c813b83` |  | feat(shared): percentOf() з округленням як у PHP round() | feat(shared): percentOf() with rounding as in PHP round() |
| `a888b59` |  | feat(api): тижневий звіт room-week, представлення room_slot і фасад legacy | feat(api): room-week weekly report, room_slot view and legacy facade |
| `9afa849` |  | chore(codemods): кодмод percent-of (ts-morph, пробний режим за замовчуванням) | chore(codemods): percent-of codemod (ts-morph, dry run by default) |
| `506819c` | `legacy-room-week-final` | refactor(web): відсотки завантаженості через percentOf (кодмод) | refactor(web): occupancy percentages via percentOf (codemod) |
| `eef4a10` | `ch11-end` | chore(legacy): вимкнено room_week.php після тіньового прогону | chore(legacy): room_week.php switched off after the shadow run |
| `818d480` |  | docs(debugging): журнали справ і скрипти відтворення | docs(debugging): case logs and reproduction scripts |
| `810119a` |  | test(api): регресійний тест гонки двох бронювань | test(api): regression test for the race of two bookings |
| `a662799` |  | fix(api): booking_no_overlap (EXCLUDE USING gist), 23P01 → 409 | fix(api): booking_no_overlap (EXCLUDE USING gist), 23P01 -> 409 |
| `24036cb` | `ch12-end` | perf(api): /rooms/availability без N+1 | perf(api): /rooms/availability without N+1 |
| `009d6b8` |  | chore(cloud): середовище Codex Cloud – install.sh, start.sh, скіл cloud-start | chore(cloud): Codex Cloud environment - install.sh, start.sh, cloud-start skill |
| `cdfa4f1` |  | feat(api): нагадування про консультації за 1 год (ReminderLog, reminders:run) | feat(api): consultation reminders 1 h ahead (ReminderLog, reminders:run) |
| `b9aa9d8` |  | feat(api): експорт розкладу аудиторії в iCal (GET /rooms/:id/calendar.ics) | feat(api): room schedule export to iCal (GET /rooms/:id/calendar.ics) |
| `f4c772a` |  | fix(api): взаємоблокування одночасних вставок (40P01) теж означає конфлікт | fix(api): a deadlock of concurrent inserts (40P01) also means a conflict |
| `205728e` | `ch13-end` | feat: статистика завантаженості аудиторій (GET /stats/rooms, сторінка /stats) | feat: room utilization statistics (GET /stats/rooms, /stats page) |
| `94926b1` |  | feat(shared): контракт листа очікування (waitlist.ts) | feat(shared): waitlist contract (waitlist.ts) |
| `76ef1dc` |  | chore(agents): wt-new.sh і wt-rm.sh – робоче дерево на агента | chore(agents): wt-new.sh and wt-rm.sh - one worktree per agent |
| `b0c1158` |  | feat(api): лист очікування (WaitlistEntry, три маршрути, промоція в транзакції скасування) | feat(api): waitlist (WaitlistEntry, three routes, promotion inside the cancellation transaction) |
| `2f56eae` |  | feat(web): кнопка листа очікування для слотів без місць | feat(web): waitlist button for slots without free seats |
| `6e2d23d` | `ch14-end` | docs(api): лист очікування | docs(api): waitlist |
| `da12eae` |  | feat: сповіщення про промоцію з листа очікування і закриття запису за 2 год | feat: notification of promotion from the waitlist and sign-up closing 2 h before the start |
| `5b3b7c8` | `ch15-end` | docs: політика рев'ю, доменні правила, CODEOWNERS | docs: review policy, domain rules, CODEOWNERS |
| `37af369` |  | ci: job lint, test (з PostgreSQL) і e2e (Playwright); ready_for_review | ci: lint, test (with PostgreSQL) and e2e (Playwright) jobs; ready_for_review |
| `06462ff` |  | feat(ci): fix-loop.sh, summarize-run.sh, nightly-triage.mts, промпт і схема автофіксу | feat(ci): fix-loop.sh, summarize-run.sh, nightly-triage.mts, autofix prompt and schema |
| `81e45da` | `ch16-end` | ci: codex-autofix, codex-review і codex-nightly | ci: codex-autofix, codex-review and codex-nightly |
| `a415f0e` |  | docs(security): модель загроз RoomBook і чекліст команди | docs(security): RoomBook threat model and team checklist |
| `b2b97b5` |  | chore(codex): профіль report і requirements.toml для машин кафедри | chore(codex): report profile and requirements.toml for department machines |
| `d17a5f0` |  | test(security): канарка для перевірки ін'єкції через purpose | test(security): canary for checking injection through purpose |
| `e2ada63` | `ch17-end` | ci: сканування секретів gitleaks у job lint | ci: gitleaks secret scanning in the lint job |
| `f8e5629` |  | feat(metrics): скрипти метрик впровадження і схема CSV (додаток К) | feat(metrics): adoption metrics scripts and CSV schema (Appendix K) |
| `a17d251` | `ch18-end` | docs: README – репозиторій, теги розділів, запуск, тести і пісочниця | docs: README - repository, chapter tags, setup, tests and the sandbox |

Commits on `main` after `ch18-end` add the English-edition files
(`README.en.md`, `tools/en/`, `docs/en/`, `docs/mockups/my-consultations.en.png`);
their messages are in English.

## Tag annotations

`git tag -n1 'ch*'` prints these annotations. Each tag points to the last
commit of its chapter.

| Tag | Commit | Annotation (UA) | Annotation (EN) |
|---|---|---|---|
| `ch02-start` | `cfb1e53` | Стан, описаний у розд. 1: тест winter schedule червоний, AGENTS.md і профілів немає | State described in Ch. 1: the winter schedule test is red, no AGENTS.md or profiles |
| `ch03-end` | `3ae677e` | Розд. 3: виправлено часовий пояс у slots.ts, +3 DST-тести | Ch. 3: time zone fixed in slots.ts, +3 DST tests |
| `ch04-end` | `7ff4175` | Розд. 4: серії бронювань (BookingSeries, POST /booking-series), docs/plans, docs/backlog | Ch. 4: booking series (BookingSeries, POST /booking-series), docs/plans, docs/backlog |
| `ch05-end` | `9a7ca21` | Розд. 5: три AGENTS.md, AGENTS.override.md у .gitignore | Ch. 5: three AGENTS.md files, AGENTS.override.md in .gitignore |
| `ch06-end` | `32c5941` | Розд. 6: tools/codex/profiles/{safe,work,ci}.config.toml, install-profiles.sh, .codex/config.toml | Ch. 6: tools/codex/profiles/{safe,work,ci}.config.toml, install-profiles.sh, .codex/config.toml |
| `ch07-end` | `d0e8eab` | Розд. 7: tools/codex/rules/roombook.rules, checkpoint.sh, профіль deps, tools/dev/test-int.sh (docker-compose.yml – з ch02-start) | Ch. 7: tools/codex/rules/roombook.rules, checkpoint.sh, deps profile, tools/dev/test-int.sh (docker-compose.yml since ch02-start) |
| `ch08-end` | `c1106de` | Розд. 8: packages/mcp-db, MCP у .codex/config.toml, скіл db-report, MyConsultations.tsx, GET /me/bookings | Ch. 8: packages/mcp-db, MCP in .codex/config.toml, db-report skill, MyConsultations.tsx, GET /me/bookings |
| `ch09-end` | `9f14bd6` | Розд. 9: SlotForm.tsx, lib/forms/fieldErrors.ts, apps/web/AGENTS.md | Ch. 9: SlotForm.tsx, lib/forms/fieldErrors.ts, apps/web/AGENTS.md |
| `ch10-end` | `2fba0f8` | Розд. 10: P1/P2 (fast-check), виправлення lt/gt, e2e booking-flow.spec.ts, Stryker, test-guard.sh | Ch. 10: P1/P2 (fast-check), lt/gt fix, e2e booking-flow.spec.ts, Stryker, test-guard.sh |
| `legacy-room-week-final` | `506819c` | Розд. 11 (тег оповіді): остання версія room_week.php перед вимкненням | Ch. 11 (story tag): last version of room_week.php before it was switched off |
| `ch11-end` | `eef4a10` | Розд. 11: тижневий звіт у apps/api, percentOf(), еталони, кодмод | Ch. 11: weekly report in apps/api, percentOf(), golden files, codemod |
| `ch12-end` | `24036cb` | Розд. 12: booking_no_overlap, 23P01 → 409, атомарні серії, N+1, docs/debugging/ | Ch. 12: booking_no_overlap, 23P01 -> 409, atomic series, N+1, docs/debugging/ |
| `ch13-end` | `205728e` | Розд. 13: tools/cloud/*, PR оповіді #206–#208 (iCal, нагадування, статистика) | Ch. 13: tools/cloud/*, story PRs #206-#208 (iCal, reminders, statistics) |
| `ch14-end` | `6e2d23d` | Розд. 14: лист очікування (WaitlistEntry, три маршрути), wt-new.sh/wt-rm.sh | Ch. 14: waitlist (WaitlistEntry, three routes), wt-new.sh/wt-rm.sh |
| `ch15-end` | `5b3b7c8` | Розд. 15: PR оповіді #236 (сповіщення про промоцію, закриття запису за 2 год), docs/review-policy.md, CODEOWNERS | Ch. 15: story PR #236 (promotion notification, sign-up closing 2 h before), docs/review-policy.md, CODEOWNERS |
| `ch16-end` | `81e45da` | Розд. 16: workflows ci.yml (lint/test/e2e), codex-autofix.yml, codex-review.yml, codex-nightly.yml; fix-loop.sh, summarize-run.sh, nightly-triage.mts | Ch. 16: workflows ci.yml (lint/test/e2e), codex-autofix.yml, codex-review.yml, codex-nightly.yml; fix-loop.sh, summarize-run.sh, nightly-triage.mts |
| `ch17-end` | `e2ada63` | Розд. 17: docs/security/threat-model.md, профіль report, канарка (seed 9001), сканування секретів у CI, явні permissions | Ch. 17: docs/security/threat-model.md, report profile, canary (seed 9001), secret scanning in CI, explicit permissions |
| `ch18-end` | `a17d251` | Розд. 18: tools/metrics/* (скрипти метрик, схема CSV); main = ch18-end | Ch. 18: tools/metrics/* (metrics scripts, CSV schema); main = ch18-end |

## Conventional Commits types used

`feat` new feature, `fix` bug fix, `perf` performance, `refactor` code change
without a behavior change, `test` tests only, `docs` documentation, `chore`
tooling and housekeeping, `ci` CI configuration. The scope in parentheses
(`api`, `web`, `shared`, `codex`, `legacy`, ...) names the package or area.
