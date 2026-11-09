import type { PrismaClient } from "@prisma/client";
import { kyivDayRange } from "../time";
import { overlaps, type Interval } from "./conflicts";
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

/**
 * Зайнятість усіх аудиторій на місцеву дату кафедри, разом із заняттями серій.
 * Два запити незалежно від кількості аудиторій (розд. 12: виправлено N+1,
 * що з'явився в коміті «include series bookings in availability»).
 */
export async function roomAvailability(
  db: PrismaClient,
  date: string,
): Promise<RoomDay[]> {
  const { from, to } = kyivDayRange(date);
  const [rooms, bookings] = await Promise.all([
    db.room.findMany({ orderBy: { code: "asc" } }),
    db.booking.findMany({
      where: {
        kind: "room",
        cancelledAt: null,
        startsAt: { lt: to },
        endsAt: { gt: from },
      },
      select: { roomId: true, seriesId: true, startsAt: true, endsAt: true },
      orderBy: { startsAt: "asc" },
    }),
  ]);
  const byRoom = new Map<number, RoomDay["busy"]>();
  for (const { roomId, ...b } of bookings) {
    if (roomId === null) continue;
    byRoom.set(roomId, [...(byRoom.get(roomId) ?? []), b]);
  }
  const pairs = pairsOfDay(date);
  return rooms.map((room) => {
    const busy = byRoom.get(room.id) ?? [];
    return {
      roomId: room.id,
      code: room.code,
      name: room.name,
      busy,
      freePairs: freePairs(pairs, busy),
    };
  });
}
