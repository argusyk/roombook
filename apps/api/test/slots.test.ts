import { describe, it, expect } from "vitest";
import { PAIRS, isClockTime } from "../src/booking/slots";
import { seatsLeft } from "../src/slots/service";

describe("слоти консультацій", () => {
  it("seatsLeft рахує вільні місця", () => {
    expect(seatsLeft(3, 0)).toBe(3);
    expect(seatsLeft(3, 2)).toBe(1);
  });

  it("seatsLeft не буває від'ємним", () => {
    expect(seatsLeft(1, 2)).toBe(0);
  });

  it("weekly slots: вісім пар на день, сорок на тиждень", () => {
    expect(PAIRS).toHaveLength(8);
    expect(PAIRS.length * 5).toBe(40);
  });

  it("isClockTime приймає HH:mm", () => {
    expect(isClockTime("08:00")).toBe(true);
    expect(isClockTime("23:59")).toBe(true);
  });

  it("isClockTime відхиляє інші формати", () => {
    expect(isClockTime("8:00")).toBe(false);
    expect(isClockTime("24:00")).toBe(false);
    expect(isClockTime("08:60")).toBe(false);
  });
});
