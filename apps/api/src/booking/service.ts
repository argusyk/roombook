import { ConflictError, ForbiddenError, NotFoundError } from "@roombook/shared/errors";
import { prisma } from "../db";
import type { AuthUser } from "../auth/plugin";
import { findConflicts } from "./conflicts";

export { ConflictError };

export interface BookingInput {
  roomId: number;
  userId: number;
  startsAt: Date | string;
  endsAt: Date | string;
  purpose: string;
}

const toDate = (v: Date | string) => (v instanceof Date ? v : new Date(v));

/** Створює бронювання аудиторії, якщо воно не перетинає активних. */
export async function createBooking(input: BookingInput) {
  const data = {
    kind: "room" as const,
    roomId: input.roomId,
    userId: input.userId,
    startsAt: toDate(input.startsAt),
    endsAt: toDate(input.endsAt),
    purpose: input.purpose,
  };
  const room = await prisma.room.findUnique({ where: { id: data.roomId } });
  if (!room) throw new NotFoundError("Аудиторію");

  // Перевірка і запис поки не атомарні (docs/backlog.md).
  const conflicts = await findConflicts(prisma, data);
  if (conflicts.length) throw new ConflictError(conflicts);
  return prisma.booking.create({ data });
}

/** Скасування: власник або адміністратор; ставить cancelledAt. */
export async function cancelBooking(id: number, user: AuthUser) {
  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking || booking.cancelledAt) throw new NotFoundError("Бронювання");
  if (booking.userId !== user.id && user.role !== "admin") {
    throw new ForbiddenError("Скасувати можна лише власне бронювання");
  }
  return prisma.booking.update({
    where: { id },
    data: { cancelledAt: new Date() },
  });
}
