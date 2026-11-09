// Хелпери інтеграційних тестів (*.int.test.ts): потрібна PostgreSQL за DATABASE_URL.
import { prisma } from "../../src/db";
import { devToken } from "../../src/auth/token";
import { seedBase, seedIds } from "../../prisma/seed-data";

export { prisma, seedIds };

/** Очищає всі таблиці (крім журналу міграцій) і повертає базові сід-дані. */
export async function resetDb(): Promise<void> {
  const tables = await prisma.$queryRaw<{ tablename: string }[]>`
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public' AND tablename <> '_prisma_migrations'`;
  if (tables.length) {
    const list = tables.map((t) => `"${t.tablename}"`).join(", ");
    await prisma.$executeRawUnsafe(`TRUNCATE ${list} RESTART IDENTITY CASCADE`);
  }
  await seedBase(prisma);
}

/** Лише бронювання (і серії) – швидше за resetDb для тестів властивостей. */
export async function resetBookings(): Promise<void> {
  await prisma.$executeRawUnsafe(`TRUNCATE "Booking", "BookingSeries" RESTART IDENTITY CASCADE`);
}

/** Інтервал бронювання аудиторії: початок у UTC і тривалість у хвилинах. */
export function slot(roomId: number, startIso: string, minutes: number) {
  const startsAt = new Date(startIso);
  const endsAt = new Date(startsAt.getTime() + minutes * 60_000);
  return { roomId, startsAt, endsAt, purpose: "integration test" };
}

/** Заголовки запиту від імені користувача (dev-токен, лише NODE_ENV=test). */
export function asUser(id: number) {
  return { authorization: `Bearer ${devToken(id)}` };
}
