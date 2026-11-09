import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildApp } from "../src/app";
import { asUser, prisma, resetDb, seedIds } from "./helpers/db";

let app: FastifyInstance;
const teacher = seedIds.teachers[0];

const series = {
  roomId: seedIds.rooms.A314,
  purpose: "Щотижнева консультація",
  startLocal: "2027-02-02T14:00",
  durationMin: 90,
  intervalWeeks: 1,
  untilLocalDate: "2027-05-25",
  exdates: ["2027-04-13"],
};

beforeAll(async () => {
  app = await buildApp();
});
afterAll(async () => {
  await app.close();
});
beforeEach(async () => {
  await resetDb();
});

const create = (payload: Record<string, unknown> = series) =>
  app.inject({ method: "POST", url: "/booking-series", headers: asUser(teacher), payload });

describe("POST /booking-series", () => {
  it("серія без конфліктів створює 16 Booking з однаковим seriesId", async () => {
    const res = await create();
    expect(res.statusCode).toBe(201);
    const rows = await prisma.booking.findMany({ where: { seriesId: res.json().id } });
    expect(rows).toHaveLength(16);
  });

  it("конфлікт 2027-03-16 – 409 зі списком дат, і жодного запису серії", async () => {
    await prisma.booking.create({
      data: {
        kind: "room",
        roomId: seedIds.rooms.A314,
        userId: seedIds.students[0],
        startsAt: new Date("2027-03-16T12:30:00Z"),
        endsAt: new Date("2027-03-16T13:00:00Z"),
        purpose: "Захист курсових",
      },
    });
    const res = await create();
    expect(res.statusCode).toBe(409);
    expect(res.json().conflicts).toEqual(["2027-03-16"]);
    expect(await prisma.booking.count({ where: { seriesId: { not: null } } })).toBe(0);
    expect(await prisma.bookingSeries.count()).toBe(0);
  });

  it("студент не створює серій – 403", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/booking-series",
      headers: asUser(seedIds.students[0]),
      payload: series,
    });
    expect(res.statusCode).toBe(403);
  });
});

describe("DELETE /booking-series/:id", () => {
  it("скасовує майбутні заняття серії – 204", async () => {
    const id = (await create()).json().id;
    const res = await app.inject({
      method: "DELETE",
      url: `/booking-series/${id}?from=2027-04-01`,
      headers: asUser(teacher),
    });
    expect(res.statusCode).toBe(204);
    const active = await prisma.booking.count({ where: { seriesId: id, cancelledAt: null } });
    expect(active).toBe(9); // 9 занять лютого–березня лишаються, з 1 квітня скасовано
  });
});
