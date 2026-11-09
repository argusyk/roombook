// Адреса тестової бази для проєкту int.
// Інтеграційні тести ніколи не працюють з робочою базою розробника:
// з DATABASE_URL (оточення або apps/api/.env) беремо сервер і облікові дані,
// а до імені бази додаємо суфікс _test (roombook → roombook_test,
// roombook_wt_api → roombook_wt_api_test). Якщо DATABASE_URL не задано –
// база з docker-compose.yml (pnpm db:up).
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

export const DEFAULT_TEST_DATABASE_URL =
  "postgresql://roombook:roombook@localhost:5432/roombook_test";

const envFile = fileURLToPath(new URL("../../.env", import.meta.url));

function fromEnvFile(): string | undefined {
  if (!existsSync(envFile)) return undefined;
  const line = readFileSync(envFile, "utf8")
    .split(/\r?\n/)
    .find((l) => /^\s*DATABASE_URL\s*=/.test(l));
  return line?.replace(/^\s*DATABASE_URL\s*=\s*/, "").replace(/^["']|["']$/g, "").trim();
}

/** Ім'я бази з суфіксом _test (якщо його ще немає). */
export function toTestDatabaseUrl(url: string): string {
  const u = new URL(url);
  const name = u.pathname.replace(/^\//, "") || "roombook";
  if (!name.endsWith("_test")) u.pathname = `/${name}_test`;
  return u.toString();
}

export function testDatabaseUrl(env: NodeJS.ProcessEnv = process.env): string {
  const base = env.DATABASE_URL || fromEnvFile();
  return base ? toTestDatabaseUrl(base) : DEFAULT_TEST_DATABASE_URL;
}
