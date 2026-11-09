import { describe, it, expect } from "vitest";
import { formatKyiv, kyivLocalToIso } from "./time";

describe("час у вебінтерфейсі", () => {
  it("formatKyiv показує київський час", () => {
    expect(formatKyiv("2026-10-26T07:00:00.000Z")).toBe("26.10.2026 09:00");
  });

  it("formatKyiv приймає власний шаблон", () => {
    expect(formatKyiv("2026-10-26T07:00:00.000Z", "HH:mm")).toBe("09:00");
  });

  it("kyivLocalToIso узимку", () => {
    expect(kyivLocalToIso("2026-10-26T09:00")).toBe("2026-10-26T07:00:00.000Z");
  });

  it("kyivLocalToIso відхиляє неповне значення", () => {
    expect(kyivLocalToIso("2026-10-26")).toBe("");
  });
});
