import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest";
import type { FastifyInstance } from "fastify";
import iconv from "iconv-lite";
import { buildApp } from "../src/app";
import { prisma, resetDb, seedIds } from "./helpers/db";

let app: FastifyInstance;

beforeAll(async () => {
  app = await buildApp();
});
afterAll(async () => {
  await app.close();
});
beforeEach(async () => {
  await resetDb();
  // пн 02.11.2026: дві пари в A-314, одна скасована; пт 06.11 – ще одна;
  // сб 07.11 – поза тижнем звіту (пн–пт)
  const at = (iso: string, cancelled = false) => ({
    kind: "room" as const,
    roomId: seedIds.rooms.A314,
    userId: seedIds.students[0],
    startsAt: new Date(iso),
    endsAt: new Date(Date.parse(iso) + 90 * 60_000),
    purpose: "Пара",
    cancelledAt: cancelled ? new Date() : null,
  });
  await prisma.booking.createMany({
    data: [
      at("2026-11-02T06:00:00Z"),
      at("2026-11-02T07:40:00Z"),
      at("2026-11-02T09:20:00Z", true),
      at("2026-11-06T14:00:00Z"),
      at("2026-11-07T08:00:00Z"),
    ],
  });
});

describe("GET /reports/room-week", () => {
  it("JSON: пари з представлення room_slot, скасовані й вихідні не рахуються", async () => {
    const res = await app.inject({ method: "GET", url: "/reports/room-week?week=2026-11-02&format=json" });
    expect(res.statusCode).toBe(200);
    const a314 = res.json().rows.find((r: { name: string }) => r.name === "Лабораторія програмної інженерії");
    expect(a314).toEqual({ name: "Лабораторія програмної інженерії", pairs: 3, percent: 8 });
    expect(res.json().rows).toHaveLength(4); // аудиторії без пар – з нулем
  });

  it("CSV у cp1251 за старою адресою фасаду (режим new)", async () => {
    const res = await app.inject({ method: "GET", url: "/legacy/reports/room_week.php?week=2026-11-02" });
    expect(res.headers["content-type"]).toContain("windows-1251");
    expect(iconv.decode(res.rawPayload, "win1251")).toContain("Лабораторія програмної інженерії;3;8\r\n");
  });

  it("некоректний week – 400", async () => {
    const res = await app.inject({ method: "GET", url: "/reports/room-week?week=2026-11-03" });
    expect(res.statusCode).toBe(400);
  });
});
