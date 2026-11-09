import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest";
import type { FastifyInstance } from "fastify";
import { waitlistRoutes as r } from "@roombook/shared";
import { buildApp } from "../src/app";
import { InMemoryMailer } from "../src/mail/memory";
import { asUser, prisma, resetDb, seedIds } from "./helpers/db";

let app: FastifyInstance;
const mailer = new InMemoryMailer();
let slotId: number;
const [s1, s2, s3, s4] = seedIds.students;

beforeAll(async () => {
  app = await buildApp({ mailer });
});
afterAll(async () => {
  await app.close();
});
beforeEach(async () => {
  await resetDb();
  mailer.sent.length = 0;
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

  it("промоція надсилає лист новому учаснику після COMMIT", async () => {
    const booked = (await book(s1)).json();
    await join(s2);
    await app.inject({ method: "DELETE", url: `/bookings/${booked.id}`, headers: asUser(s1) });
    expect(mailer.sent).toHaveLength(1);
    expect(mailer.sent[0]).toMatchObject({ to: "student02@roombook.test" });
    expect(mailer.sent[0]!.text).toContain("16.03.2027 о 10:00");
  });
});

describe("закриття запису за 2 год до початку (#236)", () => {
  async function soonSlot(minutesAhead: number) {
    const startsAt = new Date(Date.now() + minutesAhead * 60_000);
    const slot = await prisma.consultationSlot.create({
      data: { teacherId: seedIds.teachers[0], seats: 1, startsAt, endsAt: new Date(startsAt.getTime() + 3_600_000) },
    });
    return slot.id;
  }

  it("до початку менше 2 год – 422 closed", async () => {
    const id = await soonSlot(60);
    await app.inject({ method: "POST", url: `/slots/${id}/bookings`, headers: asUser(s1), payload: { purpose: "Курсова" } });
    const res = await app.inject({ method: "POST", url: `/slots/${id}/waitlist`, headers: asUser(s2) });
    expect(res.statusCode).toBe(r.join.closed);
    expect(res.json().reason).toBe("closed");
  });

  it("скасування менш ніж за 2 год не просуває чергу: місце вільне", async () => {
    const id = await soonSlot(180);
    const booked = (await app.inject({ method: "POST", url: `/slots/${id}/bookings`, headers: asUser(s1), payload: { purpose: "Курсова" } })).json();
    await app.inject({ method: "POST", url: `/slots/${id}/waitlist`, headers: asUser(s2) });
    await prisma.consultationSlot.update({ where: { id }, data: { startsAt: new Date(Date.now() + 30 * 60_000) } });
    await app.inject({ method: "DELETE", url: `/bookings/${booked.id}`, headers: asUser(s1) });
    expect(await prisma.booking.count({ where: { slotId: id, cancelledAt: null } })).toBe(0);
    expect(mailer.sent).toHaveLength(0);
  });
});
