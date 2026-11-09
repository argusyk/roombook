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
 * Дві одночасні вставки, що перетинаються, PostgreSQL інколи розв'язує не
 * помилкою 23P01, а взаємоблокуванням (40P01, deadlock detected): обидві
 * транзакції вже вставили рядок в індекс GiST і чекають одна на одну.
 * Переможець фіксується, переможений отримує 40P01 – для нас це той самий конфлікт.
 */
export function isDeadlock(e: unknown): boolean {
  return ((e as Error)?.message ?? "").includes("40P01");
}

const MAX_ATTEMPTS = 3;

/**
 * Створює бронювання аудиторії. Попередня перевірка findConflicts() дає
 * формі список конфліктів; гарантію неперетину дає обмеження
 * booking_no_overlap у базі (23P01 або 40P01 → ConflictError).
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
  for (let attempt = 1; ; attempt++) {
    try {
      return await prisma.booking.create({ data });
    } catch (e) {
      if (!isOverlapViolation(e) && !isDeadlock(e)) throw e;
      // після 23P01 переможець уже зафіксований – конфлікт видно;
      // після 40P01 він міг ще не зафіксуватися – тоді пробуємо вставку знову
      const found = await findConflicts(prisma, data);
      if (found.length || attempt >= MAX_ATTEMPTS) throw new ConflictError(found);
    }
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
