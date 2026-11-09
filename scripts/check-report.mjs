#!/usr/bin/env node
// scripts/check-report.mjs <каталог звіту> – незалежна перевірка звіту db-report.
// Очікує <каталог>/summary.json:
//   { "from": "2026-10-05T00:00:00Z", "to": "2026-11-02T00:00:00Z",
//     "byRoom": { "A-314": 12, "B-214": 7 } }
// і звіряє кількість активних бронювань аудиторій за період з базою
// (роль roombook_ro, ROOMBOOK_RO_URL). Код виходу 1, якщо числа розходяться.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import pg from "pg";

const dir = process.argv[2];
if (!dir) {
  console.error("використання: node scripts/check-report.mjs reports/<дата>");
  process.exit(2);
}
const summary = JSON.parse(readFileSync(join(dir, "summary.json"), "utf8"));
const client = new pg.Client({ connectionString: process.env.ROOMBOOK_RO_URL });
await client.connect();
try {
  await client.query("BEGIN TRANSACTION READ ONLY");
  const { rows } = await client.query(
    `SELECT r.code, COUNT(b.id)::int AS n
       FROM "Room" r
       LEFT JOIN "Booking" b ON b."roomId" = r.id
        AND b."kind" = 'room' AND b."cancelledAt" IS NULL
        AND b."startsAt" >= $1 AND b."startsAt" < $2
      GROUP BY r.code ORDER BY r.code`,
    [summary.from, summary.to],
  );
  let bad = 0;
  for (const { code, n } of rows) {
    const reported = summary.byRoom?.[code] ?? 0;
    const mark = reported === n ? "ok " : "DIFF";
    if (reported !== n) bad++;
    console.log(`${mark} ${code}: у звіті ${reported}, у базі ${n}`);
  }
  console.log(bad ? `check-report: ${bad} розбіжн.` : "check-report: суми збігаються");
  process.exitCode = bad ? 1 : 0;
} finally {
  await client.query("ROLLBACK").catch(() => {});
  await client.end();
}
