// apps/api/src/reports/room-week.ts
import iconv from "iconv-lite";
import type { PrismaClient } from "@prisma/client";
import { percentOf } from "@roombook/shared";

export const SLOTS_PER_WEEK = 40;          // 8 пар × 5 днів, як у legacy
const collator = new Intl.Collator("uk");  // явний порядок замість ORDER BY

export interface RoomWeekRow {
  name: string;
  pairs: number;
  percent: number;
}

export function buildRoomWeek(
  input: { name: string; pairs: number }[],
): RoomWeekRow[] {
  return input
    .map((r) => ({ ...r, percent: percentOf(r.pairs, SLOTS_PER_WEEK) }))
    .sort((a, b) => collator.compare(a.name, b.name));
}

/** Зайняті пари за аудиторіями за тиждень пн–пт (week – понеділок, YYYY-MM-DD). */
export async function loadRoomWeek(db: PrismaClient, week: string) {
  const rows = await db.$queryRaw<{ name: string; pairs: bigint }[]>`
    SELECT r.name, COUNT(s."roomId") AS pairs
    FROM "Room" r
    LEFT JOIN room_slot s ON s."roomId" = r.id
      AND s.day >= ${week}::date AND s.day < ${week}::date + 5
    GROUP BY r.id, r.name`;
  return rows.map((r) => ({ name: r.name, pairs: Number(r.pairs) }));
}

export function toLegacyCsv(rows: RoomWeekRow[]): Buffer {
  const lines = ["Аудиторія;Пар;Завантаженість, %",
    ...rows.map((r) => `${r.name};${r.pairs};${r.percent}`)];
  return iconv.encode(lines.join("\r\n") + "\r\n", "win1251");
}
