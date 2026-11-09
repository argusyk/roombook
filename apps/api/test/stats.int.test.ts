import { it, expect, beforeAll, afterAll } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildApp } from "../src/app";
import { prisma, resetDb, seedIds } from "./helpers/db";

let app: FastifyInstance;
beforeAll(async () => {
  app = await buildApp();
  await resetDb();
  // 23 пари в A-314 за тиждень 02–06.11.2026 (по 4–5 на день)
  const data = Array.from({ length: 23 }, (_, i) => {
    const day = 2 + (i % 5);
    const pair = Math.floor(i / 5);
    const startsAt = new Date(Date.UTC(2026, 10, day, 6 + pair * 2, 0));
    return {
      kind: "room" as const, roomId: seedIds.rooms.A314, userId: 5, purpose: "Пара",
      startsAt, endsAt: new Date(startsAt.getTime() + 90 * 60_000),
    };
  });
  await prisma.booking.createMany({ data });
});
afterAll(async () => {
  await app.close();
});

it("GET /stats/rooms збігається з тижневим звітом: 23 пари з 40 = 58 %", async () => {
  const stats = await app.inject({ method: "GET", url: "/stats/rooms?from=2026-11-02&to=2026-11-09" });
  expect(stats.statusCode).toBe(200);
  const a314 = stats.json().rooms.find((r: { code: string }) => r.code === "A-314");
  expect(a314).toMatchObject({ pairs: 23, capacity: 40, percent: 58 });

  const report = await app.inject({ method: "GET", url: "/reports/room-week?week=2026-11-02&format=json" });
  const row = report.json().rows.find((r: { name: string }) => r.name === a314.name);
  expect(row).toMatchObject({ pairs: 23, percent: 58 });
});
