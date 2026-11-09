import { describe, it, expect } from "vitest";
import { CAMPUS_TZ, fromKyivLocal, kyivDate, kyivDayRange, toKyiv } from "../src/time";

describe("time.ts", () => {
  it("часовий пояс кафедри – Europe/Kyiv", () => {
    expect(CAMPUS_TZ).toBe("Europe/Kyiv");
  });

  it("toKyiv: влітку UTC+3", () => {
    expect(toKyiv(new Date("2026-07-01T06:00:00Z"))).toBe("2026-07-01T09:00");
  });

  it("toKyiv: взимку UTC+2", () => {
    expect(toKyiv(new Date("2026-12-01T07:00:00Z"))).toBe("2026-12-01T09:00");
  });

  it("fromKyivLocal – обернена до toKyiv", () => {
    const local = "2026-11-12T14:00";
    expect(toKyiv(fromKyivLocal(local))).toBe(local);
  });

  it("kyivDate: 23:30 UTC – уже наступна доба в Києві", () => {
    expect(kyivDate(new Date("2026-11-09T23:30:00Z"))).toBe("2026-11-10");
  });

  it("kyivDayRange: доба переходу на зимовий час триває 25 годин", () => {
    const { from, to } = kyivDayRange("2026-10-25");
    expect((to.getTime() - from.getTime()) / 3_600_000).toBe(25);
  });
});
