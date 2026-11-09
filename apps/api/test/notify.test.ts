import { describe, it, expect } from "vitest";
import { isClosedForSignup, promotionMessage } from "../src/waitlist/notify";

const now = new Date("2026-11-12T06:00:00Z");

describe("сповіщення і закриття запису (#236)", () => {
  it("рівно за 2 год – ще відкрито, за 1 год 59 хв – закрито", () => {
    expect(isClosedForSignup(new Date("2026-11-12T08:00:00Z"), now)).toBe(false);
    expect(isClosedForSignup(new Date("2026-11-12T07:59:00Z"), now)).toBe(true);
  });

  it("слот у минулому – закрито", () => {
    expect(isClosedForSignup(new Date("2026-11-11T08:00:00Z"), now)).toBe(true);
  });

  it("лист показує київський час, а не UTC", () => {
    const m = promotionMessage("student02@roombook.test", {
      startsAt: new Date("2026-11-12T08:00:00Z"),
      teacher: { name: "Викладач 1" },
    });
    expect(m.text).toContain("12.11.2026 о 10:00");
    expect(m.to).toBe("student02@roombook.test");
  });
});
