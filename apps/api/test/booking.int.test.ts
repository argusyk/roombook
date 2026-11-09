import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildApp } from "../src/app";
import { asUser, prisma, resetDb, seedIds } from "./helpers/db";

let app: FastifyInstance;
const student = seedIds.students[0]; // 5
const other = seedIds.students[1]; // 6

const body = (startsAt: string, endsAt: string, roomId: number = seedIds.rooms.A314) => ({
  roomId,
  startsAt,
  endsAt,
  purpose: "Консультація з ІПЗ",
});

beforeAll(async () => {
  app = await buildApp();
});
afterAll(async () => {
  await app.close();
});
beforeEach(async () => {
  await resetDb();
});

const post = (payload: Record<string, unknown>, user: number = student) =>
  app.inject({ method: "POST", url: "/bookings", headers: asUser(user), payload });

describe("POST /bookings", () => {
  it("створює бронювання – 201", async () => {
    const res = await post(body("2027-03-16T12:00:00Z", "2027-03-16T13:30:00Z"));
    expect(res.statusCode).toBe(201);
    expect(res.json()).toMatchObject({ roomId: 1, userId: student, cancelledAt: null });
  });

  it("перетин з активним бронюванням – 409 зі списком конфліктів", async () => {
    await post(body("2027-03-16T12:00:00Z", "2027-03-16T13:30:00Z"));
    const res = await post(body("2027-03-16T13:00:00Z", "2027-03-16T14:00:00Z"), other);
    expect(res.statusCode).toBe(409);
    expect(res.json().conflicts).toHaveLength(1);
  });

  it("інша аудиторія в той самий час – без конфлікту", async () => {
    await post(body("2027-03-16T12:00:00Z", "2027-03-16T13:30:00Z"));
    const res = await post(
      body("2027-03-16T12:00:00Z", "2027-03-16T13:30:00Z", seedIds.rooms.A214),
      other,
    );
    expect(res.statusCode).toBe(201);
  });

  it("некоректне тіло – 400", async () => {
    const res = await post({ roomId: "A-314" });
    expect(res.statusCode).toBe(400);
  });

  it("невідома аудиторія – 404", async () => {
    const res = await post(body("2027-03-16T12:00:00Z", "2027-03-16T13:30:00Z", 999));
    expect(res.statusCode).toBe(404);
  });
});

describe("DELETE /bookings/:id", () => {
  it("скасування ставить cancelledAt і звільняє час – 204", async () => {
    const created = await post(body("2027-03-16T12:00:00Z", "2027-03-16T13:30:00Z"));
    const id = created.json().id;
    const res = await app.inject({ method: "DELETE", url: `/bookings/${id}`, headers: asUser(student) });
    expect(res.statusCode).toBe(204);
    const row = await prisma.booking.findUniqueOrThrow({ where: { id } });
    expect(row.cancelledAt).not.toBeNull();
    const again = await post(body("2027-03-16T12:00:00Z", "2027-03-16T13:30:00Z"), other);
    expect(again.statusCode).toBe(201);
  });

  it("чуже бронювання скасувати не можна – 403", async () => {
    const created = await post(body("2027-03-16T12:00:00Z", "2027-03-16T13:30:00Z"));
    const res = await app.inject({
      method: "DELETE",
      url: `/bookings/${created.json().id}`,
      headers: asUser(other),
    });
    expect(res.statusCode).toBe(403);
  });
});
