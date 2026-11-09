// Регресія N+1 з розд. 12 (перевірка, з якою йшла бісекція, – постійний тест).
import { test, expect, afterAll } from "vitest";
import { PrismaClient } from "@prisma/client";
import { buildApp } from "../src/app";
import { resetDb } from "./helpers/db";

const logged = new PrismaClient({ log: [{ emit: "event", level: "query" }] });
afterAll(async () => {
  await logged.$disconnect();
});

test("availability: кількість SQL-запитів не залежить від числа аудиторій",
  async () => {
  await resetDb();
  await logged.room.createMany({
    data: Array.from({ length: 26 }, (_, i) => ({
      code: `C-${100 + i}`, name: `Аудиторія ${100 + i}`, building: "Корпус C", capacity: 20,
    })),
  }); // разом із сідом – 30 аудиторій
  let queries = 0;
  logged.$on("query", () => { queries++; });
  const app = await buildApp({ prisma: logged });
  queries = 0;
  const res = await app.inject({
    method: "GET",
    url: "/rooms/availability?date=2026-11-09",
  });
  expect(res.statusCode).toBe(200);
  expect(res.json().rooms).toHaveLength(30);
  expect(queries).toBeLessThanOrEqual(3);
  await app.close();
});
