import type { Prisma, PrismaClient } from "@prisma/client";

/** Клієнт Prisma або транзакція: findConflicts працює з обома. */
export type Db = PrismaClient | Prisma.TransactionClient;

export interface Interval {
  startsAt: Date;
  endsAt: Date;
}

/**
 * Перетин напіввідкритих інтервалів [start, end):
 * суміжні інтервали (14:00–15:30 і 15:30–17:00) не конфліктують.
 */
export function overlaps(a: Interval, b: Interval): boolean {
  return a.startsAt < b.endsAt && b.startsAt < a.endsAt;
}

export interface ConflictQuery {
  roomId: number;
  startsAt: Date;
  endsAt: Date;
}

/** Активні бронювання тієї самої аудиторії, що перетинають запит. */
export async function findConflicts(db: Db, req: ConflictQuery) {
  const rows = await db.booking.findMany({
    where: {
      roomId: req.roomId,
      cancelledAt: null,
      startsAt: { lte: req.endsAt },
      endsAt: { gte: req.startsAt },
    },
    select: { id: true, roomId: true, startsAt: true, endsAt: true },
    orderBy: { startsAt: "asc" },
  });
  return rows;
}
