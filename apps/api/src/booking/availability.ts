import type { PrismaClient } from "@prisma/client";
import { kyivDayRange } from "../time";
import { overlaps, type Interval } from "./conflicts";
import { pairsOfDay, type PairSlot } from "./slots";

export interface RoomDay {
  roomId: number;
  code: string;
  name: string;
  busy: Interval[];
  freePairs: number[];
}

/** Номери пар, що не перетинаються з жодним зайнятим інтервалом. */
export function freePairs(pairs: PairSlot[], busy: Interval[]): number[] {
  return pairs
    .filter((p) => !busy.some((b) => overlaps(p, b)))
    .map((p) => p.pair);
}

/** Зайнятість усіх аудиторій на місцеву дату кафедри. */
export async function roomAvailability(
  db: PrismaClient,
  date: string,
): Promise<RoomDay[]> {
  const { from, to } = kyivDayRange(date);
  const rooms = await db.room.findMany({ orderBy: { code: "asc" } });
  const bookings = await db.booking.findMany({
    where: {
      kind: "room",
      cancelledAt: null,
      startsAt: { lt: to },
      endsAt: { gt: from },
    },
    select: { roomId: true, startsAt: true, endsAt: true },
    orderBy: { startsAt: "asc" },
  });
  const pairs = pairsOfDay(date);
  return rooms.map((room) => {
    const busy = bookings
      .filter((b) => b.roomId === room.id)
      .map(({ startsAt, endsAt }) => ({ startsAt, endsAt }));
    return {
      roomId: room.id,
      code: room.code,
      name: room.name,
      busy,
      freePairs: freePairs(pairs, busy),
    };
  });
}
