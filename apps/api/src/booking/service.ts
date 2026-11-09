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

/** Точки ін'єкції лише для тестів гонки; у продакшені порожні. */
export interface TestHooks {
  afterConflictCheck?: () => Promise<void>;
}

const toDate = (v: Date | string) => (v instanceof Date ? v : new Date(v));

const OVERLAP = "booking_no_overlap";

// Форма помилки залежить від версії Prisma: код 23P01 і назва
// обмеження трапляються в meta або лише в тексті. Регресійний тест
// фіксує поведінку для нашої версії.
export function isOverlapViolation(e: unknown): boolean {
  const message = (e as Error)?.message ?? "";
  const meta = JSON.stringify((e as { meta?: unknown })?.meta ?? {});
  const text = `${message} ${meta}`;
  return text.includes("23P01") || text.includes(OVERLAP);
}

/**
 * Створює бронювання аудиторії. Попередня перевірка findConflicts() дає
 * формі список конфліктів; гарантію неперетину дає обмеження
 * booking_no_overlap у базі (23P01 → ConflictError).
 */
export async function createBooking(
  input: BookingInput,
  hooks: TestHooks = {},
) {
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

  const conflicts = await findConflicts(prisma, data);
  if (conflicts.length) throw new ConflictError(conflicts);
  await hooks.afterConflictCheck?.();          // лише для тестів гонки
  try {
    return await prisma.booking.create({ data });
  } catch (e) {
    if (isOverlapViolation(e)) {
      throw new ConflictError(await findConflicts(prisma, data));
    }
    throw e;
  }
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
