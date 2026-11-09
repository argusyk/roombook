// Підготовка проєкту int: ці тести ходять у справжню PostgreSQL.
// Пісочниця агента з вимкненою мережею не дає підключитися навіть до
// localhost:5432 – такі тести запускає людина або крок verify у CI.
import { afterAll } from "vitest";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL не задано: інтеграційним тестам потрібна PostgreSQL " +
      "(див. apps/api/.env.example). Модульні тести: pnpm --filter @roombook/api test:unit",
  );
}

afterAll(async () => {
  const { prisma } = await import("../../src/db");
  await prisma.$disconnect();
});
