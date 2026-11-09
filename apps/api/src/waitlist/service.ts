// Лист очікування на зайнятий слот консультації (розд. 14).
// Контракт і інваріанти – packages/shared/src/waitlist.ts.
import type { Prisma, PrismaClient } from "@prisma/client";
import { ConflictError, NotFoundError, UnprocessableError } from "@roombook/shared/errors";
import { prisma } from "../db";
import type { AuthUser } from "../auth/plugin";
import { seatsLeft } from "../slots/service";

type Tx = Prisma.TransactionClient | PrismaClient;

const serialize = <T extends { createdAt: Date }>(e: T) => ({ ...e, createdAt: e.createdAt.toISOString() });

/** POST /slots/:slotId/waitlist – 201 {entry, ahead}; 409; 422 hasSeats. */
export async function joinWaitlist(slotId: number, user: AuthUser) {
  return prisma.$transaction(async (tx) => {
    // блокуємо рядок слота: позиції в черзі видаються по одній
    const locked = await tx.$queryRaw<{ id: number }[]>`
      SELECT id FROM "ConsultationSlot" WHERE id = ${slotId} FOR UPDATE`;
    if (!locked.length) throw new NotFoundError("Слот консультації");
    const slot = await tx.consultationSlot.findUniqueOrThrow({ where: { id: slotId } });

    const active = await tx.booking.findMany({
      where: { slotId, cancelledAt: null },
      select: { userId: true },
    });
    if (active.some((b) => b.userId === user.id)) {
      throw new ConflictError([], "Ви вже записані на цю консультацію");
    }
    if (seatsLeft(slot.seats, active.length) > 0) {
      throw new UnprocessableError("hasSeats", "У слоті є вільні місця – запишіться напряму");
    }
    const existing = await tx.waitlistEntry.findUnique({
      where: { slotId_userId: { slotId, userId: user.id } },
    });
    if (existing?.status === "waiting") {
      throw new ConflictError([], "Ви вже в листі очікування");
    }
    const last = await tx.waitlistEntry.aggregate({ where: { slotId }, _max: { position: true } });
    const position = (last._max.position ?? 0) + 1;
    const entry = existing
      ? await tx.waitlistEntry.update({
          where: { id: existing.id },
          data: { status: "waiting", position, createdAt: new Date(), promotedAt: null },
        })
      : await tx.waitlistEntry.create({ data: { slotId, userId: user.id, position } });
    const ahead = await tx.waitlistEntry.count({
      where: { slotId, status: "waiting", position: { lt: position } },
    });
    return { entry: serialize(entry), ahead };
  });
}

/** DELETE /slots/:slotId/waitlist – 204; 404, якщо користувача немає в черзі. */
export async function leaveWaitlist(slotId: number, user: AuthUser) {
  const { count } = await prisma.waitlistEntry.updateMany({
    where: { slotId, userId: user.id, status: "waiting" },
    data: { status: "left" },
  });
  if (count === 0) throw new NotFoundError("Запис у листі очікування");
}

/** GET /me/waitlist – записи користувача, що очікують, з кількістю попереду. */
export async function myWaitlist(user: AuthUser) {
  const entries = await prisma.waitlistEntry.findMany({
    where: { userId: user.id, status: "waiting" },
    include: { slot: { select: { startsAt: true, endsAt: true, teacher: { select: { name: true } } } } },
    orderBy: { createdAt: "asc" },
  });
  return Promise.all(
    entries.map(async (e) => ({
      ...serialize(e),
      ahead: await prisma.waitlistEntry.count({
        where: { slotId: e.slotId, status: "waiting", position: { lt: e.position } },
      }),
    })),
  );
}

/**
 * Промоція першого в черзі – у транзакції скасування (інваріант 4):
 * одразу створює бронювання (інваріант 5). Повертає просунутий запис або null.
 */
export async function promoteNext(tx: Tx, slotId: number) {
  const slot = await tx.consultationSlot.findUnique({ where: { id: slotId } });
  if (!slot) return null;
  const active = await tx.booking.count({ where: { slotId, cancelledAt: null } });
  if (seatsLeft(slot.seats, active) === 0) return null;
  const next = await tx.waitlistEntry.findFirst({
    where: { slotId, status: "waiting" },
    orderBy: { position: "asc" }, // FIFO
  });
  if (!next) return null;
  await tx.booking.create({
    data: {
      kind: "consultation",
      slotId,
      roomId: null,
      userId: next.userId,
      startsAt: slot.startsAt,
      endsAt: slot.endsAt,
      purpose: "Консультація (з листа очікування)",
    },
  });
  return tx.waitlistEntry.update({
    where: { id: next.id },
    data: { status: "promoted", promotedAt: new Date() },
  });
}
