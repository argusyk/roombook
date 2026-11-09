import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildApp } from "../src/app";
import { asUser, prisma, resetDb, seedIds } from "./helpers/db";

let app: FastifyInstance;
const student = seedIds.students[0];
const teacher = seedIds.teachers[0];

beforeAll(async () => {
  app = await buildApp();
});
afterAll(async () => {
  await app.close();
});
beforeEach(async () => {
  await resetDb();
  const slot = await prisma.consultationSlot.create({
    data: {
      teacherId: teacher,
      roomId: seedIds.rooms.B214,
      startsAt: new Date("2026-11-12T08:00:00Z"),
      endsAt: new Date("2026-11-12T09:00:00Z"),
      seats: 3,
    },
  });
  await prisma.booking.createMany({
    data: [
      { kind: "consultation", slotId: slot.id, userId: student, startsAt: slot.startsAt, endsAt: slot.endsAt, purpose: "Курсова" },
      { kind: "room", roomId: seedIds.rooms.A314, userId: student, startsAt: new Date("2026-11-10T08:00:00Z"), endsAt: new Date("2026-11-10T09:30:00Z"), purpose: "Лабораторна" },
      { kind: "room", roomId: seedIds.rooms.A314, userId: student, startsAt: new Date("2026-11-09T08:00:00Z"), endsAt: new Date("2026-11-09T09:30:00Z"), purpose: "Скасована", cancelledAt: new Date() },
      { kind: "room", roomId: seedIds.rooms.A214, userId: seedIds.students[1], startsAt: new Date("2026-11-10T08:00:00Z"), endsAt: new Date("2026-11-10T09:30:00Z"), purpose: "Чуже" },
    ],
  });
});

const get = (url: string, user = student) =>
  app.inject({ method: "GET", url, headers: asUser(user) });

describe("GET /me/bookings", () => {
  it("повертає лише власні активні записи, найближчі зверху", async () => {
    const res = await get("/me/bookings");
    expect(res.statusCode).toBe(200);
    expect(res.json().map((b: { purpose: string }) => b.purpose)).toEqual(["Лабораторна", "Курсова"]);
  });

  it("kind=consultation – лише записи на консультації з викладачем і аудиторією", async () => {
    const res = await get("/me/bookings?kind=consultation");
    const [b] = res.json();
    expect(res.json()).toHaveLength(1);
    expect(b.slot).toMatchObject({ teacher: { name: "Викладач 1" }, room: { code: "B-214" } });
  });

  it("kind=room – лише бронювання аудиторій", async () => {
    const res = await get("/me/bookings?kind=room");
    expect(res.json()).toHaveLength(1);
  });

  it("невідомий kind – 400", async () => {
    expect((await get("/me/bookings?kind=lesson")).statusCode).toBe(400);
  });
});
