// globalSetup проєкту int: один раз перед інтеграційними тестами
// застосовує міграції до тестової бази (prisma migrate deploy).
// Сама база має існувати: її створює docker-compose (pnpm db:up) або сервіс
// postgres у CI.
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { testDatabaseUrl } from "./test-db";

export default function setup() {
  const url = testDatabaseUrl();
  process.env.DATABASE_URL = url; // успадкують процеси з тестами
  const prismaCli = createRequire(import.meta.url).resolve("prisma/build/index.js");
  const cwd = fileURLToPath(new URL("../..", import.meta.url)); // apps/api
  const safe = url.replace(/\/\/([^:@/]+):[^@/]*@/, "//$1:***@");
  console.log(`[int] prisma migrate deploy → ${safe}`);
  try {
    execFileSync(process.execPath, [prismaCli, "migrate", "deploy"], {
      cwd,
      env: { ...process.env, DATABASE_URL: url },
      stdio: ["ignore", "inherit", "inherit"],
    });
  } catch {
    throw new Error(
      `Не вдалося застосувати міграції до ${safe}. Чи запущено PostgreSQL ` +
        "(pnpm db:up)? Пісочниця агента з вимкненою мережею не дає підключитися " +
        "навіть до localhost:5432 – запускайте test:int поза нею.",
    );
  }
}
