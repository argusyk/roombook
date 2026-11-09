import { describe, it, expect } from "vitest";
import { expandWeekly } from "../src/recurrence/expand";

const rule = {
  startLocal: "2027-02-02T14:00",   // вівторок
  durationMin: 90,
  intervalWeeks: 1,
  untilLocalDate: "2027-05-25",
  exdates: ["2027-04-13"],
  timeZone: "Europe/Kyiv" as const,
};

describe("expandWeekly", () => {
  it("включає останній день і пропускає виключені дати", () => {
    expect(expandWeekly(rule)).toHaveLength(16);   // 17 вівторків мінус 1
  });

  it("зберігає 14:00 за Києвом після переходу на літній час", () => {
    const occ = expandWeekly(rule);
    const before = occ.find((o) => o.startsAt.startsWith("2027-03-23"));
    const after = occ.find((o) => o.startsAt.startsWith("2027-03-30"));
    expect(before?.startsAt).toBe("2027-03-23T12:00:00.000Z"); // UTC+2
    expect(after?.startsAt).toBe("2027-03-30T11:00:00.000Z");  // UTC+3
  });

  it("зберігає 14:00 за Києвом після переходу на зимовий час (31.10.2027)", () => {
    const occ = expandWeekly({
      ...rule,
      startLocal: "2027-10-19T14:00",
      untilLocalDate: "2027-11-09",
      exdates: [],
    });
    expect(occ.map((o) => o.startsAt)).toEqual([
      "2027-10-19T11:00:00.000Z", // UTC+3
      "2027-10-26T11:00:00.000Z", // UTC+3
      "2027-11-02T12:00:00.000Z", // перше заняття після 31.10, UTC+2
      "2027-11-09T12:00:00.000Z",
    ]);
  });

  it("тривалість кожного заняття – durationMin", () => {
    for (const o of expandWeekly(rule)) {
      expect(Date.parse(o.endsAt) - Date.parse(o.startsAt)).toBe(90 * 60_000);
    }
  });

  it("інтервал у два тижні", () => {
    const occ = expandWeekly({ ...rule, intervalWeeks: 2, exdates: [] });
    expect(occ.map((o) => o.date).slice(0, 3)).toEqual([
      "2027-02-02",
      "2027-02-16",
      "2027-03-02",
    ]);
  });

  it("порожня серія, якщо дата завершення раніше за перше заняття", () => {
    expect(expandWeekly({ ...rule, untilLocalDate: "2027-02-01" })).toEqual([]);
  });

  it("повертає місцеві дати занять", () => {
    expect(expandWeekly(rule)[0]?.date).toBe("2027-02-02");
  });
});
