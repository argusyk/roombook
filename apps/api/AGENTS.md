# apps/api: правила бекенду

## Команди пакета
- Тести: `pnpm --filter @roombook/api test:unit` – Vitest, без БД;
  `test`/`test:int` потребують PostgreSQL з `DATABASE_URL`
  (див. `apps/api/.env.example`).
- Після зміни schema.prisma:
  `pnpm --filter @roombook/api exec prisma generate`.
- Нова міграція: `pnpm --filter @roombook/api exec prisma migrate dev
  --name <коротка_назва>`.
  У звіті наведи SQL згенерованої міграції.

## Архітектура
- Маршрут Fastify → сервіс → Prisma. Маршрут лише валідує вхід zod-схемою
  з packages/shared і викликає сервіс. Бізнес-правила живуть у сервісах.
- Доменні помилки беремо з packages/shared/src/errors.ts. Не кидай рядки.
- Перевірка конфліктів бронювань: apps/api/src/booking/conflicts.ts.
- Перетин бронювань забороняє обмеження `booking_no_overlap`; не обходь його
  і не прибирай з міграцій. 23P01 → ConflictError (`isOverlapViolation`).

## Час і дати
- Усі дати в коді є Date в UTC. Не використовуй локальний час процесу.
- Тести з часовими поясами фіксують час через vi.useFakeTimers і явні
  ISO-рядки із суфіксом Z. Не покладайся на годинник машини.

## Тести з базою даних
- Тести *.int.test.ts потребують PostgreSQL. Якщо бази немає, зупинись і скажи
  про це: не вимикай, не пропускай (describe.skipIf тощо) і не переписуй їх.
  Дефект середовища виправляють у середовищі (tools/cloud/*), а не в коді.

## Code Review Rules
- P1: зміна prisma/schema.prisma без відповідної міграції.
- P1: запис бронювання в обхід перевірки конфліктів.
- P1: обчислення в локальному часовому поясі замість UTC.
