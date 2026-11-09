import { describe, it, expect } from "vitest";
import { DEFAULT_TEST_DATABASE_URL, toTestDatabaseUrl, testDatabaseUrl } from "./helpers/test-db";

describe("тестова база інтеграційних тестів", () => {
  it("додає суфікс _test до імені бази", () => {
    expect(toTestDatabaseUrl("postgresql://roombook:roombook@localhost:5432/roombook")).toBe(
      "postgresql://roombook:roombook@localhost:5432/roombook_test",
    );
  });

  it("не дублює суфікс", () => {
    const url = "postgresql://roombook:roombook@localhost:5432/roombook_test";
    expect(toTestDatabaseUrl(url)).toBe(url);
  });

  it("база worktree отримує власну тестову базу", () => {
    expect(toTestDatabaseUrl("postgresql://u:p@localhost:5432/roombook_wt_api")).toMatch(
      /\/roombook_wt_api_test$/,
    );
  });

  it("DATABASE_URL з оточення має пріоритет", () => {
    expect(testDatabaseUrl({ DATABASE_URL: "postgresql://u:p@db:5432/x" })).toBe(
      "postgresql://u:p@db:5432/x_test",
    );
  });

  it("за замовчуванням – база з docker-compose", () => {
    expect(DEFAULT_TEST_DATABASE_URL).toMatch(/localhost:5432\/roombook_test$/);
  });
});
