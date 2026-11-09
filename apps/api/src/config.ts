import { z } from "zod";

const Env = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  API_PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().optional(),
  // розд. 11: фасад тижневого звіту – legacy | shadow | new
  REPORTS_ROOM_WEEK_MODE: z.enum(["legacy", "shadow", "new"]).default("new"),
  LEGACY_REPORTS_URL: z.string().url().optional(), // адреса старих PHP-звітів (legacy, shadow)
  REPORTS_DIFF_DIR: z.string().default("reports/diffs"),
  // розд. 13: пошта – log (dev/test, лист у журнал) або smtp (продакшн)
  MAIL_TRANSPORT: z.enum(["log", "smtp"]).default("log"),
  SMTP_URL: z.string().optional(),
  MAIL_FROM: z.string().default("RoomBook <noreply@roombook.test>"),
});

export type Config = z.infer<typeof Env>;

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  return Env.parse(env);
}

export const config = loadConfig();

/** Вхід без пароля (dev-login, x-test-user) – лише для розробки й тестів. */
export const devAuthEnabled = () => config.NODE_ENV !== "production";
