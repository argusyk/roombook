import { defineConfig } from "vitest/config";

// Два проєкти Vitest:
//  unit – *.test.ts без бази даних (можна запускати в пісочниці агента);
//  int  – *.int.test.ts, потребують PostgreSQL; globalSetup сам застосовує
//         міграції до тестової бази (<база з DATABASE_URL>_test, див. test/helpers/test-db.ts).
export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: "unit",
          environment: "node",
          include: ["test/**/*.test.ts"],
          exclude: ["test/**/*.int.test.ts", "**/node_modules/**"],
        },
      },
      {
        test: {
          name: "int",
          environment: "node",
          include: ["test/**/*.int.test.ts"],
          globalSetup: ["test/helpers/int-global-setup.ts"],
          setupFiles: ["test/helpers/int-setup.ts"],
          // одна база на весь набір: файли виконуються послідовно в одному процесі
          pool: "forks",
          poolOptions: { forks: { singleFork: true } },
          testTimeout: 60_000,
          hookTimeout: 60_000,
        },
      },
    ],
  },
});
