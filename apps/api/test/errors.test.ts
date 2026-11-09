import { describe, it, expect, beforeAll, afterAll } from "vitest";
import type { FastifyInstance } from "fastify";
import { ConflictError } from "@roombook/shared/errors";
import { buildApp } from "../src/app";

// Обробник помилок перевіряємо на маршрутах, яким база не потрібна.
let app: FastifyInstance;

beforeAll(async () => {
  app = await buildApp();
  app.get("/__test/conflict", async () => {
    throw new ConflictError([{ id: 1 }]);
  });
  app.get("/__test/boom", async () => {
    throw new Error("boom");
  });
});

afterAll(async () => {
  await app.close();
});

describe("обробник помилок API", () => {
  it("ConflictError → 409 з переліком конфліктів", async () => {
    const res = await app.inject({ method: "GET", url: "/__test/conflict" });
    expect(res.statusCode).toBe(409);
    expect(res.json()).toMatchObject({ error: "CONFLICT", conflicts: [{ id: 1 }] });
  });

  it("помилка zod → 400 з адресою поля", async () => {
    const res = await app.inject({ method: "GET", url: "/rooms/availability?date=09.11.2026" });
    expect(res.statusCode).toBe(400);
    expect(res.json().issues[0].path).toEqual(["date"]);
  });

  it("запит без входу → 401", async () => {
    const res = await app.inject({ method: "POST", url: "/bookings", payload: {} });
    expect(res.statusCode).toBe(401);
  });

  it("невідома помилка → 500 без подробиць", async () => {
    const res = await app.inject({ method: "GET", url: "/__test/boom" });
    expect(res.statusCode).toBe(500);
    expect(res.json().message).toBe("Внутрішня помилка");
  });

  it("/health відповідає без бази", async () => {
    const res = await app.inject({ method: "GET", url: "/health" });
    expect(res.json()).toEqual({ ok: true });
  });
});
