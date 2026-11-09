import { describe, it, expect } from "vitest";
import { isOverlapViolation } from "../src/booking/service";

describe("isOverlapViolation", () => {
  it("розпізнає SQLSTATE 23P01 у тексті помилки", () => {
    expect(isOverlapViolation(new Error("Raw query failed. Code: `23P01`."))).toBe(true);
  });

  it("розпізнає назву обмеження в meta", () => {
    const e = Object.assign(new Error("Unique constraint failed"), {
      meta: { target: "booking_no_overlap" },
    });
    expect(isOverlapViolation(e)).toBe(true);
  });

  it("інші помилки бази – не конфлікт", () => {
    expect(isOverlapViolation(new Error("23505 duplicate key"))).toBe(false);
    expect(isOverlapViolation(undefined)).toBe(false);
  });
});
