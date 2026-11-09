// apps/api/test/booking.race.int.test.ts
import { test, expect } from "vitest";
import { createBooking } from "../src/booking/service";
import { ConflictError } from "@roombook/shared/errors";
import { prisma, resetDb, seedIds, slot } from "./helpers/db";

test("два паралельні бронювання одного слоту: рівно одне успішне",
  async () => {
  for (let round = 0; round < 25; round++) {
    await resetDb();
    let arrived = 0, release!: () => void;
    const gate = new Promise<void>((r) => { release = r; });
    const hooks = { afterConflictCheck: async () => {
      if (++arrived === 2) release();
      await gate;
    }};
    const s = slot(seedIds.rooms.A314, "2027-01-04T08:00Z", 90);
    const results = await Promise.allSettled([
      createBooking({ ...s, userId: 5 }, hooks),
      createBooking({ ...s, userId: 6 }, hooks),
    ]);
    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
    const rejected = results.find(
      (r) => r.status === "rejected",
    ) as PromiseRejectedResult;
    expect(rejected.reason, String(rejected.reason?.message)).toBeInstanceOf(ConflictError);
    const where = { roomId: 1, cancelledAt: null };
    expect(await prisma.booking.count({ where })).toBe(1);
  }
});
