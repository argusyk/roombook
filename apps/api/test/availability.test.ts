import { describe, it, expect } from "vitest";
import { freePairs } from "../src/booking/availability";
import { pairsOfDay, slotStartUtc } from "../src/booking/slots";

const at = (iso: string) => new Date(iso);

describe("розклад пар у UTC", () => {
  it("summer schedule", () => {
    // 23.10.2026 – ще літній час, Київ = UTC+3
    expect(slotStartUtc("2026-10-23", "09:00").toISOString()).toBe(
      "2026-10-23T06:00:00.000Z",
    );
  });

  it("winter schedule", () => {
    // 25.10.2026 Україна перейшла на зимовий час, Київ = UTC+2
    expect(slotStartUtc("2026-10-26", "09:00").toISOString()).toBe(
      "2026-10-26T07:00:00.000Z",
    );
  });

  it("день має вісім пар по 90 хвилин", () => {
    const pairs = pairsOfDay("2026-10-23");
    expect(pairs).toHaveLength(8);
    for (const p of pairs) {
      expect(p.endsAt.getTime() - p.startsAt.getTime()).toBe(90 * 60_000);
    }
  });

  it("пари нумеруються з 1 і не перетинаються", () => {
    const pairs = pairsOfDay("2026-10-23");
    expect(pairs.map((p) => p.pair)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    for (let i = 1; i < pairs.length; i++) {
      expect(pairs[i]!.startsAt.getTime()).toBeGreaterThan(
        pairs[i - 1]!.endsAt.getTime(),
      );
    }
  });

  it("відхиляє некоректний час", () => {
    expect(() => slotStartUtc("2026-10-23", "25:00")).toThrow(RangeError);
    expect(() => slotStartUtc("2026-10-23", "9:00")).toThrow(RangeError);
  });
});

describe("freePairs", () => {
  const pairs = pairsOfDay("2026-10-23"); // перша пара 05:00Z–06:30Z

  it("без бронювань вільні всі пари", () => {
    expect(freePairs(pairs, [])).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it("бронювання на першу пару займає лише її", () => {
    const busy = [{ startsAt: at("2026-10-23T05:00:00Z"), endsAt: at("2026-10-23T06:30:00Z") }];
    expect(freePairs(pairs, busy)).toEqual([2, 3, 4, 5, 6, 7, 8]);
  });

  it("бронювання, що закінчується на початку пари, її не займає", () => {
    const busy = [{ startsAt: at("2026-10-23T04:00:00Z"), endsAt: at("2026-10-23T05:00:00Z") }];
    expect(freePairs(pairs, busy)).toContain(1);
  });

  it("довге бронювання займає кілька пар", () => {
    const busy = [{ startsAt: at("2026-10-23T05:30:00Z"), endsAt: at("2026-10-23T09:00:00Z") }];
    expect(freePairs(pairs, busy)).toEqual([4, 5, 6, 7, 8]);
  });
});
