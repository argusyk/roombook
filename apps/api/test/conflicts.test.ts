import { describe, it, expect } from "vitest";
import { overlaps } from "../src/booking/conflicts";

const iv = (from: string, to: string) => ({
  startsAt: new Date(`2027-03-16T${from}:00Z`),
  endsAt: new Date(`2027-03-16T${to}:00Z`),
});

describe("overlaps: напіввідкриті інтервали [start, end)", () => {
  it("однакові інтервали перетинаються", () => {
    expect(overlaps(iv("12:00", "13:30"), iv("12:00", "13:30"))).toBe(true);
  });

  it("частковий перетин", () => {
    expect(overlaps(iv("12:00", "13:30"), iv("13:00", "14:00"))).toBe(true);
  });

  it("вкладений інтервал", () => {
    expect(overlaps(iv("12:00", "15:00"), iv("13:00", "14:00"))).toBe(true);
  });

  it("суміжні інтервали не перетинаються (14:00–15:30 і 15:30–17:00)", () => {
    expect(overlaps(iv("14:00", "15:30"), iv("15:30", "17:00"))).toBe(false);
  });

  it("суміжні в іншому порядку", () => {
    expect(overlaps(iv("15:30", "17:00"), iv("14:00", "15:30"))).toBe(false);
  });

  it("рознесені інтервали", () => {
    expect(overlaps(iv("08:00", "09:30"), iv("12:00", "13:30"))).toBe(false);
  });
});
