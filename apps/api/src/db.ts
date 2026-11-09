import { PrismaClient } from "@prisma/client";

// Один клієнт на процес. Підключення до бази відкривається ліниво,
// під час першого запиту, тож імпорт модуля не потребує PostgreSQL.
export const prisma = new PrismaClient();
