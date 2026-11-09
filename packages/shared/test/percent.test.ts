import { describe, it, expect } from "vitest";
import { percentOf } from "../src/percent";

describe("percentOf – як PHP round(a / b * 100)", () => {
  it("23 пари з 40 – 58 (Math.round дав би 57)", () => {
    expect(percentOf(23, 40)).toBe(58);
    expect(Math.round((23 / 40) * 100)).toBe(57); // мотивація: 57.49999999999999
  });

  it("22 і 24 пари з 40 – 55 і 60", () => {
    expect(percentOf(22, 40)).toBe(55);
    expect(percentOf(24, 40)).toBe(60);
  });

  it("половини округлюються від нуля: 1 з 40 = 2,5 % → 3", () => {
    expect(percentOf(1, 40)).toBe(3);
  });

  it("нуль і повна завантаженість", () => {
    expect(percentOf(0, 40)).toBe(0);
    expect(percentOf(40, 40)).toBe(100);
  });

  it("1 з 3 – 33, 2 з 3 – 67", () => {
    expect(percentOf(1, 3)).toBe(33);
    expect(percentOf(2, 3)).toBe(67);
  });

  it("для всіх 0..40 пар збігається з округленням половин угору точного 2,5·p", () => {
    for (let p = 0; p <= 40; p++) {
      expect(percentOf(p, 40)).toBe(Math.floor((p * 5 + 1) / 2));
    }
  });
});
