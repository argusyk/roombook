# RoomBook: інструкції для агентів

Сервіс бронювання аудиторій і консультацій кафедри. Монорепозиторій pnpm:
apps/api (Fastify, Prisma, PostgreSQL 16), apps/web (React 19, Vite),
packages/shared (zod-схеми для API і web), legacy-php (старі звіти).

## Команди
- Залежності вже встановлено. Не запускай `pnpm install` без потреби
  і не додавай нових залежностей, якщо задача прямо цього не просить.
- Перевірка типів: `pnpm -r typecheck`
- Лінтер: `pnpm -r lint`
- Тести API без БД: `pnpm --filter @roombook/api test:unit`
- Тести API з БД (потрібна PostgreSQL за `DATABASE_URL`):
  `pnpm --filter @roombook/api test` або `test:int`
- Один файл тестів: `pnpm --filter @roombook/api exec vitest run <шлях>`
- E2E (Playwright, потрібна запущена БД): `pnpm test:e2e`. Запускай лише
  тоді, коли зміна зачіпає UI або маршрути API.
- Повний `pnpm test` у корені дає дуже великий вивід. Спершу запускай
  тести пакета, який змінюєш.

## Конвенції
- TypeScript strict, без `any` у нових файлах.
- Спільні типи і валідація живуть лише в zod-схемах packages/shared.
  Не дублюй схеми в apps/api чи apps/web.
- Час у БД і API зберігається тільки в UTC (timestamptz). Перетворення
  в Europe/Kyiv відбувається лише в apps/api/src/time.ts і на клієнті
  під час відображення.
- Коміти за Conventional Commits (`feat(api): ...`, `fix(web): ...`),
  один логічний крок на коміт. Зміна логіки йде разом із тестом.

## Межі
- Не змінюй .github/workflows/, pnpm-lock.yaml (крім задач на залежності)
  і вже застосовані міграції в apps/api/prisma/migrations/.
- Не редагуй тести, щоб вони пройшли. Якщо тест здається хибним,
  зупинись і поясни чому.
- legacy-php/ має власні суворіші правила: legacy-php/AGENTS.md.
- Секрети не потрапляють ні в код, ні в цей файл. Конфігурація
  через .env за шаблоном .env.example.

## Докази завершення
Фінальний звіт містить:
1. вивід `pnpm -r typecheck` і тестів змінених пакетів;
2. `git diff --stat` відносно базової гілки;
3. перелік змін поза планом або слово «нічого».

## Плани і специфікації
Специфікації лежать у docs/specs/, плани з чекпойнтами в docs/plans/,
відкладене в docs/backlog.md. Читай їх, коли задача на них посилається.
