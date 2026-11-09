import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildApp } from "../src/app";
import { asUser, resetDb, seedIds } from "./helpers/db";

let app: FastifyInstance;
const teacher = seedIds.teachers[0];
const [s1, s2] = seedIds.students;

beforeAll(async () => {
  app = await buildApp();
});
afterAll(async () => {
  await app.close();
});
beforeEach(async () => {
  await resetDb();
});

async function createSlot(seats = 1) {
  const res = await app.inject({
    method: "POST",
    url: "/slots",
    headers: asUser(teacher),
    payload: {
      startsAt: "2027-03-16T07:00:00Z",
      endsAt: "2027-03-16T08:00:00Z",
      roomId: seedIds.rooms.B214,
      seats,
    },
  });
  expect(res.statusCode).toBe(201);
  return res.json().id as number;
}

const book = (slotId: number, user: number) =>
  app.inject({
    method: "POST",
    url: `/slots/${slotId}/bookings`,
    headers: asUser(user),
    payload: { purpose: "Питання до курсової" },
  });

describe("слоти консультацій", () => {
  it("студент не може створити слот – 403", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/slots",
      headers: asUser(s1),
      payload: { startsAt: "2027-03-16T07:00:00Z", endsAt: "2027-03-16T08:00:00Z" },
    });
    expect(res.statusCode).toBe(403);
  });

  it("запис на слот – 201, запис без аудиторії (roomId = NULL)", async () => {
    const slotId = await createSlot();
    const res = await book(slotId, s1);
    expect(res.statusCode).toBe(201);
    expect(res.json()).toMatchObject({ kind: "consultation", slotId, roomId: null });
  });

  it("повторний запис – 409", async () => {
    const slotId = await createSlot(2);
    await book(slotId, s1);
    expect((await book(slotId, s1)).statusCode).toBe(409);
  });

  it("немає місць – 409", async () => {
    const slotId = await createSlot(1);
    await book(slotId, s1);
    expect((await book(slotId, s2)).statusCode).toBe(409);
  });

  it("GET /slots показує кількість вільних місць", async () => {
    const slotId = await createSlot(2);
    await book(slotId, s1);
    const res = await app.inject({ method: "GET", url: "/slots" });
    expect(res.json()[0]).toMatchObject({ id: slotId, booked: 1, seatsLeft: 1 });
  });
});
