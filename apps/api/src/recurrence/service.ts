import type { BookingSeriesCreate } from "@roombook/shared";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "@roombook/shared/errors";
import { prisma } from "../db";
import type { AuthUser } from "../auth/plugin";
import { findConflicts } from "../booking/conflicts";
import { isDeadlock, isOverlapViolation } from "../booking/service";
import { kyivDate } from "../time";
import { expandWeekly, type Occurrence } from "./expand";

/** Дати занять серії, що перетинають активні бронювання аудиторії. */
async function conflictingDates(roomId: number, occurrences: Occurrence[]) {
  const dates: string[] = [];
  for (const o of occurrences) {
    const found = await findConflicts(prisma, {
      roomId,
      startsAt: new Date(o.startsAt),
      endsAt: new Date(o.endsAt),
    });
    if (found.length) dates.push(o.date);
  }
  return dates;
}

/** POST /booking-series: усі заняття або жодного (409 зі списком дат). */
export async function createSeries(user: AuthUser, input: BookingSeriesCreate) {
  const occurrences = expandWeekly(input);
  if (!occurrences.length) {
    throw new ValidationError([
      { path: ["untilLocalDate"], message: "Серія не містить жодного заняття" },
    ]);
  }
  const room = await prisma.room.findUnique({ where: { id: input.roomId } });
  if (!room) throw new NotFoundError("Аудиторію");

  // Попередня перевірка дає список зайнятих дат; атомарність «все або нічого»
  // забезпечують транзакція і обмеження booking_no_overlap: 23P01 на будь-якому
  // занятті відкочує всю серію (розд. 12).
  const conflicts = await conflictingDates(input.roomId, occurrences);
  if (conflicts.length) {
    throw new ConflictError(conflicts, "Частина дат серії зайнята");
  }

  for (let attempt = 1; ; attempt++) {
    try {
      return await insertSeries(user, input, occurrences);
    } catch (e) {
      if (!isOverlapViolation(e) && !isDeadlock(e)) throw e;
      const dates = await conflictingDates(input.roomId, occurrences);
      if (dates.length || attempt >= 3) {
        throw new ConflictError(dates, "Частина дат серії зайнята");
      }
    }
  }
}

function insertSeries(user: AuthUser, input: BookingSeriesCreate, occurrences: Occurrence[]) {
  return prisma.$transaction(async (tx) => {
    const series = await tx.bookingSeries.create({
      data: {
        roomId: input.roomId,
        userId: user.id,
        startLocal: input.startLocal,
        durationMin: input.durationMin,
        intervalWeeks: input.intervalWeeks,
        untilLocalDate: input.untilLocalDate,
        exdates: input.exdates,
        timeZone: input.timeZone,
        purpose: input.purpose,
      },
    });
    await tx.booking.createMany({
      data: occurrences.map((o) => ({
        kind: "room" as const,
        roomId: input.roomId,
        userId: user.id,
        seriesId: series.id,
        startsAt: new Date(o.startsAt),
        endsAt: new Date(o.endsAt),
        purpose: input.purpose,
      })),
    });
    return { ...series, occurrences: occurrences.length };
  });
}

interface Cancellable {
  id: number;
  startsAt: Date;
}

/**
 * Заняття, які можна скасувати: ще не почалися (startsAt > now) і, якщо задано
 * from, припадають на місцеву дату не раніше from. Порівнюємо моменти, а не
 * дати в UTC: заняття, що вже почалося о 14:00 за Києвом, не скасовуємо.
 */
export function selectCancellable<T extends Cancellable>(
  bookings: T[],
  now: Date,
  from?: string,
): T[] {
  return bookings.filter(
    (b) => b.startsAt > now && (!from || kyivDate(b.startsAt) >= from),
  );
}

/** DELETE /booking-series/:id?from=YYYY-MM-DD – скасування решти серії. */
export async function cancelSeries(id: number, user: AuthUser, from?: string) {
  const series = await prisma.bookingSeries.findUnique({
    where: { id },
    include: { bookings: { where: { cancelledAt: null } } },
  });
  if (!series) throw new NotFoundError("Серію");
  if (series.userId !== user.id && user.role !== "admin") {
    throw new ForbiddenError("Скасувати можна лише власну серію");
  }
  const now = new Date();
  const ids = selectCancellable(series.bookings, now, from).map((b) => b.id);
  await prisma.booking.updateMany({
    where: { id: { in: ids } },
    data: { cancelledAt: now },
  });
  return ids.length;
}
