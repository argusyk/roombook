import { it, expect, beforeAll, afterAll } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildApp } from "../src/app";
import { prisma, resetDb, seedIds } from "./helpers/db";

let app: FastifyInstance;
beforeAll(async () => {
  app = await buildApp();
  await resetDb();
});
afterAll(async () => {
  await app.close();
});

it("GET /rooms/:id/calendar.ics – активні бронювання аудиторії без мети", async () => {
  const base = { kind: "room" as const, roomId: seedIds.rooms.A314, userId: 5, purpose: "Приватна мета" };
  await prisma.booking.createMany({
    data: [
      { ...base, startsAt: new Date("2026-11-12T08:00:00Z"), endsAt: new Date("2026-11-12T09:30:00Z") },
      { ...base, startsAt: new Date("2026-11-13T08:00:00Z"), endsAt: new Date("2026-11-13T09:30:00Z"), cancelledAt: new Date() },
    ],
  });
  const res = await app.inject({ method: "GET", url: "/rooms/1/calendar.ics" });
  expect(res.statusCode).toBe(200);
  expect(res.headers["content-type"]).toContain("text/calendar");
  expect(res.body.match(/BEGIN:VEVENT/g)).toHaveLength(1);
  expect(res.body).toContain("LOCATION:A-314\\, Корпус A");
  expect(res.body).not.toContain("Приватна");
});
