import { describe, it, expect } from "vitest";
import { buildCalendar, escapeText, foldLine } from "../src/calendar/ics";

const room = { id: 1, code: "A-314", building: "корпус A" };
const booking = {
  id: 7,
  startsAt: new Date("2026-11-12T08:00:00Z"),
  endsAt: new Date("2026-11-12T09:30:00Z"),
};

describe("iCal (RFC 5545)", () => {
  it("екранує кому в назві аудиторії: «A-314, корпус A»", () => {
    const ics = buildCalendar(room, [booking]);
    expect(ics).toContain("LOCATION:A-314\\, корпус A\r\n");
  });

  it("екранує \\ ; , і переноси рядків", () => {
    expect(escapeText("a\\b;c,d\ne")).toBe("a\\\\b\\;c\\,d\\ne");
  });

  it("час у UTC з суфіксом Z, рядки через CRLF", () => {
    const ics = buildCalendar(room, [booking], new Date("2026-11-09T10:00:00Z"));
    expect(ics).toContain("DTSTART:20261112T080000Z\r\nDTEND:20261112T093000Z\r\n");
    expect(ics.startsWith("BEGIN:VCALENDAR\r\n")).toBe(true);
    expect(ics.endsWith("END:VCALENDAR\r\n")).toBe(true);
  });

  it("згортає рядки, довші за 75 октетів, з урахуванням кирилиці", () => {
    const folded = foldLine(`SUMMARY:${"Ж".repeat(60)}`);
    for (const part of folded.split("\r\n")) {
      expect(Buffer.byteLength(part, "utf8")).toBeLessThanOrEqual(75);
    }
    expect(folded.replace(/\r\n /g, "")).toBe(`SUMMARY:${"Ж".repeat(60)}`);
  });

  it("мета бронювання (purpose) у фід не потрапляє", () => {
    const ics = buildCalendar(room, [{ ...booking, purpose: "Секретна нарада" } as typeof booking]);
    expect(ics).not.toContain("Секретна");
    expect(ics).toContain("SUMMARY:Зайнято");
  });
});
