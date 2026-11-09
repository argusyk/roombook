// setupFiles проєкту int: виконується в кожному процесі з тестами до імпорту
// тестових файлів. Фіксує DATABASE_URL на тестовій базі (суфікс _test),
// щоб Prisma не взяла робочу базу з apps/api/.env.
// Міграції застосовує globalSetup (test/helpers/int-global-setup.ts).
import { afterAll } from "vitest";
import { testDatabaseUrl } from "./test-db";

process.env.DATABASE_URL = testDatabaseUrl();

afterAll(async () => {
  const { prisma } = await import("../../src/db");
  await prisma.$disconnect();
});
