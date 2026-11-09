// pnpm --filter @roombook/api exec prisma db seed
// Повторний запуск безпечний: усі вставки – upsert за фіксованими id.
import { PrismaClient } from "@prisma/client";
import { seedBase } from "./seed-data";

const prisma = new PrismaClient();

try {
  await seedBase(prisma);
  console.log("seed: аудиторії та користувачі на місці");
} finally {
  await prisma.$disconnect();
}
