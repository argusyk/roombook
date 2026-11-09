import { z } from "zod";

const Env = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  API_PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().optional(),
});

export type Config = z.infer<typeof Env>;

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  return Env.parse(env);
}

export const config = loadConfig();

/** Вхід без пароля (dev-login, x-test-user) – лише для розробки й тестів. */
export const devAuthEnabled = () => config.NODE_ENV !== "production";
