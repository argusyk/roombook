import { describe, it, expect } from "vitest";
import { StatsQuery } from "@roombook/shared";
import { weekdaysBetween } from "../src/stats/service";

describe("статистика аудиторій", () => {
  it("тиждень пн–пн має 5 робочих днів (40 пар, як у тижневому звіті)", () => {
    expect(weekdaysBetween("2026-11-02", "2026-11-09")).toBe(5);
  });

  it("місяць листопад 2026 – 21 робочий день", () => {
    expect(weekdaysBetween("2026-11-01", "2026-12-01")).toBe(21);
  });

  it("порожній період – 0", () => {
    expect(weekdaysBetween("2026-11-09", "2026-11-09")).toBe(0);
  });

  it("StatsQuery вимагає from < to", () => {
    expect(StatsQuery.safeParse({ from: "2026-11-02", to: "2026-11-09" }).success).toBe(true);
    expect(StatsQuery.safeParse({ from: "2026-11-09", to: "2026-11-02" }).success).toBe(false);
  });
});
