import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildApp } from "../src/app";
import { asUser, resetDb, seedIds } from "./helpers/db";

let app: FastifyInstance;

beforeAll(async () => {
  app = await buildApp();
});
afterAll(async () => {
  await app.close();
});
beforeEach(async () => {
  await resetDb();
});

describe("аудиторії", () => {
  it("GET /rooms повертає чотири аудиторії сіду", async () => {
    const res = await app.inject({ method: "GET", url: "/rooms" });
    expect(res.statusCode).toBe(200);
    expect(res.json().map((r: { code: string }) => r.code)).toEqual([
      "A-214",
      "A-314",
      "B-105",
      "B-214",
    ]);
  });

  it("GET /rooms/availability показує зайняту пару", async () => {
    // перша пара 23.10.2026: 08:00 за Києвом = 05:00 UTC (літній час)
    await app.inject({
      method: "POST",
      url: "/bookings",
      headers: asUser(seedIds.students[0]),
      payload: {
        roomId: seedIds.rooms.A314,
        startsAt: "2026-10-23T05:00:00Z",
        endsAt: "2026-10-23T06:30:00Z",
        purpose: "Лабораторна",
      },
    });
    const res = await app.inject({ method: "GET", url: "/rooms/availability?date=2026-10-23" });
    expect(res.statusCode).toBe(200);
    const a314 = res.json().rooms.find((r: { code: string }) => r.code === "A-314");
    expect(a314.freePairs).toEqual([2, 3, 4, 5, 6, 7, 8]);
    expect(a314.busy).toHaveLength(1);
  });
});
