import { defineConfig, devices } from "@playwright/test";

// E2E потребують запущених API (порт API_PORT) і web (WEB_PORT) з базою даних.
// Сервери запускає людина поза пісочницею агента:
//   pnpm --filter @roombook/api dev   і   pnpm --filter @roombook/web dev
const webPort = Number(process.env.WEB_PORT ?? 5173);

export default defineConfig({
  testDir: "e2e",
  timeout: 30_000,
  workers: process.env.CI ? 1 : undefined, // спільна база e2e: у CI – послідовно
  retries: 0,
  use: {
    baseURL: `http://localhost:${webPort}`,
    trace: "retain-on-failure",
    timezoneId: "Europe/Kyiv",
    locale: "uk-UA",
  },
  projects: [
    { name: "setup", testMatch: /auth\.setup\.ts/ },
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      dependencies: ["setup"],
    },
  ],
});
