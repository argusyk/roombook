// scripts/debug/double-booking.ts
// pnpm tsx scripts/debug/double-booking.ts --rounds 20 --concurrency 40
// Імітує відкриття запису: N одночасних POST /bookings на ту саму аудиторію
// і той самий слот від різних тестових користувачів. Правильно: 1×201, решта 409.
// Заголовок x-test-user API приймає лише в NODE_ENV development/test.
import { parseArgs } from "node:util";

const { values } = parseArgs({ options: {
  rounds: { type: "string", default: "20" },
  concurrency: { type: "string", default: "40" },
  base: { type: "string", default: "http://localhost:3000" },
}});
const rounds = Number(values.rounds), n = Number(values.concurrency);
const bases = values.base!.split(","); // кілька екземплярів API через кому

let bad = 0;
for (let r = 0; r < rounds; r++) {
  const startsAt = new Date(Date.UTC(2027, 0, 4, 8, 0) + r * 2 * 3600_000);
  const endsAt = new Date(startsAt.getTime() + 90 * 60_000);
  const results = await Promise.all(Array.from({ length: n }, (_, i) =>
    fetch(`${bases[i % bases.length]}/bookings`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-test-user": String(1 + (i % 20)), // користувачі сіду 1..20
      },
      body: JSON.stringify({
        roomId: 1, startsAt, endsAt, purpose: "load test",
      }),
    }).then((res) => res.status)));
  const created = results.filter((s) => s === 201).length;
  const conflicts = results.filter((s) => s === 409).length;
  if (created !== 1) bad++;
  console.log(`round ${r + 1}: 201=${created} 409=${conflicts}`);
}
console.log(`rounds with created != 1: ${bad}/${rounds}`);
process.exit(bad === 0 ? 0 : 1);
