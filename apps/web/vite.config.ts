/// <reference types="vitest/config" />
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  // apps/web/.env (worktree агента: tools/agents/wt-new.sh задає порти 3000+n / 5173+n)
  const env = { ...loadEnv(mode, process.cwd(), ""), ...process.env };
  const apiPort = Number(env.API_PORT ?? 3000);
  const webPort = Number(env.WEB_PORT ?? 5173);
  return {
  plugins: [react()],
  server: {
    port: webPort,
    strictPort: true,
    // /api/* → Fastify (apps/api), щоб фронтенд і API мали одне джерело
    proxy: {
      "/api": {
        target: `http://localhost:${apiPort}`,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["src/test-setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    // жорсткий часовий пояс середовища тестів не потрібен:
    // компоненти показують час явно в Europe/Kyiv
  },
};
});
