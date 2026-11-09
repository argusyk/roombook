import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest";
import type { FastifyInstance } from "fastify";
import { waitlistRoutes as r } from "@roombook/shared";
import { buildApp } from "../src/app";
import { asUser, prisma, resetDb, seedIds } from "./helpers/db";

let app: FastifyInstance;
let slotId: number;
const [s1, s2, s3, s4] = seedIds.students;

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
      teacherId: seedIds.teachers[0],
      roomId: seedIds.rooms.B214,
      seats: 1,
      startsAt: new Date("2027-03-16T08:00:00Z"),
      endsAt: new Date("2027-03-16T09:00:00Z"),
    },
  });
  slotId = slot.id;
});

const book = (user: number) =>
  app.inject({ method: "POST", url: `/slots/${slotId}/bookings`, headers: asUser(user), payload: { purpose: "Курсова" } });
const join = (user: number) =>
  app.inject({ method: "POST", url: `/slots/${slotId}/waitlist`, headers: asUser(user) });

describe("лист очікування", () => {
  it("на зайнятий слот – 201, черга FIFO з ahead", async () => {
    await book(s1);
    const a = await join(s2);
    const b = await join(s3);
    expect(a.statusCode).toBe(r.join.ok);
    expect(a.json()).toMatchObject({ entry: { position: 1, status: "waiting" }, ahead: 0 });
    expect(b.json()).toMatchObject({ entry: { position: 2 }, ahead: 1 });
  });

  it("є вільні місця – 422 hasSeats", async () => {
    const res = await join(s2);
    expect(res.statusCode).toBe(r.join.hasSeats);
    expect(res.json().reason).toBe("hasSeats");
  });

  it("вже в черзі або вже записаний – 409", async () => {
    await book(s1);
    await join(s2);
    expect((await join(s2)).statusCode).toBe(r.join.conflict);
    expect((await join(s1)).statusCode).toBe(r.join.conflict);
  });

  it("вихід з черги – 204, повторний – 404", async () => {
    await book(s1);
    await join(s2);
    const leave = () => app.inject({ method: "DELETE", url: `/slots/${slotId}/waitlist`, headers: asUser(s2) });
    expect((await leave()).statusCode).toBe(r.leave.ok);
    expect((await leave()).statusCode).toBe(r.leave.notFound);
  });

  it("скасування просуває першого в черзі в тій самій транзакції", async () => {
    const booked = (await book(s1)).json();
    await join(s2);
    await join(s3);
    const del = await app.inject({ method: "DELETE", url: `/bookings/${booked.id}`, headers: asUser(s1) });
    expect(del.statusCode).toBe(204);
    const active = await prisma.booking.findMany({ where: { slotId, cancelledAt: null } });
    expect(active.map((b) => b.userId)).toEqual([s2]); // перший, а не останній
    const entries = await prisma.waitlistEntry.findMany({ where: { slotId }, orderBy: { position: "asc" } });
    expect(entries.map((e) => e.status)).toEqual(["promoted", "waiting"]);
  });

  it("GET /me/waitlist – мої записи з кількістю попереду", async () => {
    await book(s1);
    await join(s2);
    await join(s4);
    const res = await app.inject({ method: "GET", url: r.mine.path, headers: asUser(s4) });
    expect(res.statusCode).toBe(r.mine.ok);
    expect(res.json()).toMatchObject([{ slotId, position: 2, ahead: 1 }]);
  });
});
