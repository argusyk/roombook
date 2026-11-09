import type { PrismaClient } from "@prisma/client";
import { kyivDayRange } from "../time";
import { findConflicts, overlaps, type Interval } from "./conflicts";
import { pairsOfDay, type PairSlot } from "./slots";

export interface RoomDay {
  roomId: number;
  code: string;
  name: string;
  busy: (Interval & { seriesId: number | null })[];
  freePairs: number[];
}

/** Номери пар, що не перетинаються з жодним зайнятим інтервалом. */
export function freePairs(pairs: PairSlot[], busy: Interval[]): number[] {
  return pairs
    .filter((p) => !busy.some((b) => overlaps(p, b)))
    .map((p) => p.pair);
}

/** Зайнятість усіх аудиторій на місцеву дату кафедри, разом із заняттями серій. */
export async function roomAvailability(
  db: PrismaClient,
  date: string,
): Promise<RoomDay[]> {
  const { from, to } = kyivDayRange(date);
  const rooms = await db.room.findMany({ orderBy: { code: "asc" } });
  const pairs = pairsOfDay(date);
  const result: RoomDay[] = [];
  for (const room of rooms) {
    // та сама перевірка, що й під час бронювання: заняття серій – звичайні Booking
    const found = await findConflicts(db, { roomId: room.id, startsAt: from, endsAt: to });
    const busy = found.map(({ startsAt, endsAt, seriesId }) => ({ startsAt, endsAt, seriesId }));
    result.push({
      roomId: room.id,
      code: room.code,
      name: room.name,
      busy,
      freePairs: freePairs(pairs, busy),
    });
  }
  return result;
}
