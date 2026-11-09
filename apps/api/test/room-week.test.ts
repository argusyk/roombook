import { describe, it, expect } from "vitest";
import iconv from "iconv-lite";
import { buildRoomWeek, toLegacyCsv } from "../src/reports/room-week";
import { WeekQuery } from "../src/reports/week";

describe("тижневий звіт", () => {
  it("CSV у cp1251 з CRLF і крапкою з комою", () => {
    const buf = toLegacyCsv(buildRoomWeek([{ name: "Аудиторія", pairs: 23 }]));
    expect(iconv.decode(buf, "win1251")).toBe(
      "Аудиторія;Пар;Завантаженість, %\r\nАудиторія;23;58\r\n",
    );
    expect(buf[0]).toBe(0xc0); // «А» у cp1251 (в UTF-8 було б 0xD0 0x90), без BOM
  });

  it("week має бути понеділком у форматі YYYY-MM-DD", () => {
    expect(WeekQuery.safeParse({ week: "2026-11-02" }).success).toBe(true);
    expect(WeekQuery.safeParse({ week: "2026-11-03" }).success).toBe(false);
    expect(WeekQuery.safeParse({ week: "2026-11-02' OR 1=1 --" }).success).toBe(false);
  });

  it("сортування за назвою з українською колацією", () => {
    const rows = buildRoomWeek([
      { name: "Читальна зала", pairs: 1 },
      { name: "Актова зала", pairs: 2 },
      { name: "Їдальня", pairs: 0 },
    ]);
    expect(rows.map((r) => r.name)).toEqual(["Актова зала", "Їдальня", "Читальна зала"]);
  });
});
