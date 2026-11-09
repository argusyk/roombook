// apps/api/test/room-week.golden.test.ts
import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import iconv from "iconv-lite";
import { buildRoomWeek, toLegacyCsv } from "../src/reports/room-week";

const dir = new URL("./golden/room-week/", import.meta.url);
const weeks = readdirSync(dir).filter((f) => f.endsWith(".input.json"));

describe("room-week golden master", () => {
  it.each(weeks)("%s", (file) => {
    const input = JSON.parse(readFileSync(new URL(file, dir), "utf8"));
    const csv = file.replace(".input.json", ".csv");
    const expected = readFileSync(new URL(csv, dir));
    const actual = toLegacyCsv(buildRoomWeek(input));
    // спершу читабельний diff, потім вирок за байтами
    expect(iconv.decode(actual, "win1251"))
      .toBe(iconv.decode(expected, "win1251"));
    expect(Buffer.compare(actual, expected)).toBe(0);
  });
});
