// Статистика завантаженості аудиторій за період (розд. 13, PR #208).
// Відсоток – лише через percentOf і представлення room_slot, тим самим
// способом, що й тижневий звіт: для тижня числа збігаються з /reports/room-week.
import type { PrismaClient } from "@prisma/client";
import { percentOf } from "@roombook/shared";
import { PAIRS } from "../booking/slots";

export interface RoomStats {
  roomId: number;
  code: string;
  name: string;
  pairs: number;
  capacity: number;
  percent: number;
}

/** Кількість робочих днів (пн–пт) у [from, to), дати YYYY-MM-DD. */
export function weekdaysBetween(from: string, to: string): number {
  let n = 0;
  for (let d = new Date(`${from}T12:00:00Z`); d < new Date(`${to}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + 1)) {
    const day = d.getUTCDay();
    if (day !== 0 && day !== 6) n++;
  }
  return n;
}

export async function roomStats(db: PrismaClient, from: string, to: string): Promise<RoomStats[]> {
  const capacity = PAIRS.length * weekdaysBetween(from, to);
  const rows = await db.$queryRaw<{ id: number; code: string; name: string; pairs: bigint }[]>`
    SELECT r.id, r.code, r.name, COUNT(s."roomId") AS pairs
    FROM "Room" r
    LEFT JOIN room_slot s ON s."roomId" = r.id
      AND s.day >= ${from}::date AND s.day < ${to}::date
      AND EXTRACT(ISODOW FROM s.day) < 6
    GROUP BY r.id, r.code, r.name
    ORDER BY r.code`;
  return rows.map((r) => {
    const pairs = Number(r.pairs);
    return {
      roomId: r.id,
      code: r.code,
      name: r.name,
      pairs,
      capacity,
      percent: capacity > 0 ? percentOf(pairs, capacity) : 0,
    };
  });
}
