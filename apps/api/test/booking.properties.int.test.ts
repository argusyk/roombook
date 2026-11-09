// apps/api/test/booking.properties.int.test.ts
import { describe, it, expect, beforeAll } from "vitest";
import fc from "fast-check";
import { createBooking, ConflictError } from "../src/booking/service";
import { prisma, resetBookings, resetDb } from "./helpers/db";

const SLOT_MS = 15 * 60_000;
const BASE = Date.parse("2027-03-16T06:00:00Z"); // 08:00 за Києвом

const request = fc.record({
  roomId: fc.integer({ min: 1, max: 3 }),
  slot: fc.integer({ min: 0, max: 47 }),   // початок у межах 12 годин
  len: fc.integer({ min: 1, max: 8 }),     // від 15 хв до 2 год
});

const toInput = (r: { roomId: number; slot: number; len: number }) => ({
  roomId: r.roomId,
  userId: 1,
  purpose: "property test",
  startsAt: new Date(BASE + r.slot * SLOT_MS).toISOString(),
  endsAt: new Date(BASE + (r.slot + r.len) * SLOT_MS).toISOString(),
});

// Оракул зі специфікації, НЕ з src/: напіввідкриті інтервали [start, end)
type Interval = { start: number; end: number };
const specOverlap = (a: Interval, b: Interval) =>
  a.start < b.end && b.start < a.end;

const accept = (p: Promise<unknown>) =>
  p.then(
    () => true,
    (e) => { if (e instanceof ConflictError) return false; throw e; },
  );

beforeAll(async () => {
  await resetDb(); // аудиторії й користувачі сіду
});

describe("властивості конфліктів бронювань", () => {
  it("P1: активні бронювання однієї аудиторії не перетинаються",
     async () => {
    const reqsArb = fc.array(request, { minLength: 2, maxLength: 12 });
    await fc.assert(
      fc.asyncProperty(reqsArb, async (reqs) => {
        await resetBookings();
        for (const r of reqs) await accept(createBooking(toInput(r)));
        const rows = await prisma.booking.findMany({
          where: { cancelledAt: null },
        });
        const iv = rows.map((b) => ({
          room: b.roomId, start: +b.startsAt, end: +b.endsAt,
        }));
        for (let i = 0; i < iv.length; i++)
          for (let j = i + 1; j < iv.length; j++)
            if (iv[i]!.room === iv[j]!.room)
              expect(specOverlap(iv[i]!, iv[j]!)).toBe(false);
      }),
      { numRuns: 200 },
    );
  });

  it("P2: запит приймається тоді й лише тоді, коли не перетинає прийнятих",
     async () => {
    const reqsArb = fc.array(request, { minLength: 1, maxLength: 12 });
    await fc.assert(
      fc.asyncProperty(reqsArb, async (reqs) => {
        await resetBookings();
        const model: { room: number; start: number; end: number }[] = [];
        for (const r of reqs) {
          const iv = { room: r.roomId, start: BASE + r.slot * SLOT_MS,
                       end: BASE + (r.slot + r.len) * SLOT_MS };
          const expected = !model.some(
            (m) => m.room === iv.room && specOverlap(m, iv),
          );
          const accepted = await accept(createBooking(toInput(r)));
          expect(accepted).toBe(expected);
          if (accepted) model.push(iv);
        }
      }),
      { numRuns: 200 },
    );
  });

  it("суміжні пари 14:00–15:30 і 15:30–17:00 через сервіс приймаються обидві",
     async () => {
    await resetBookings();
    const pair = (from: string, to: string) => ({
      roomId: 1, userId: 5, purpose: "Пара",
      startsAt: `2027-03-16T${from}:00Z`, endsAt: `2027-03-16T${to}:00Z`,
    });
    await expect(accept(createBooking(pair("12:00", "13:30")))).resolves.toBe(true);
    await expect(accept(createBooking(pair("13:30", "15:00")))).resolves.toBe(true);
  });
});
