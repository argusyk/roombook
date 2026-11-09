import type { SlotCreate } from "@roombook/shared";
import { ConflictError, NotFoundError, ValidationError } from "@roombook/shared/errors";
import { prisma } from "../db";
import type { AuthUser } from "../auth/plugin";

/** Кількість вільних місць слота за кількістю активних записів. */
export function seatsLeft(seats: number, activeBookings: number): number {
  return Math.max(0, seats - activeBookings);
}

export async function listSlots(range: { from?: Date; to?: Date }) {
  const slots = await prisma.consultationSlot.findMany({
    where: {
      startsAt: { gte: range.from, lt: range.to },
    },
    include: {
      teacher: { select: { id: true, name: true } },
      room: { select: { id: true, code: true } },
      _count: { select: { bookings: { where: { cancelledAt: null } } } },
    },
    orderBy: { startsAt: "asc" },
  });
  return slots.map(({ _count, ...s }) => ({
    ...s,
    booked: _count.bookings,
    seatsLeft: seatsLeft(s.seats, _count.bookings),
  }));
}

export async function createSlot(teacher: AuthUser, input: SlotCreate) {
  if (input.roomId) {
    const room = await prisma.room.findUnique({ where: { id: input.roomId } });
    if (!room) {
      throw new ValidationError([{ path: ["roomId"], message: "Немає такої аудиторії" }]);
    }
  }
  return prisma.consultationSlot.create({
    data: {
      teacherId: teacher.id,
      roomId: input.roomId ?? null,
      startsAt: new Date(input.startsAt),
      endsAt: new Date(input.endsAt),
      seats: input.seats,
      note: input.note ?? null,
    },
  });
}

/** Запис студента на слот консультації (Booking kind = consultation). */
export async function bookSlot(slotId: number, user: AuthUser, purpose: string) {
  const slot = await prisma.consultationSlot.findUnique({ where: { id: slotId } });
  if (!slot) throw new NotFoundError("Слот консультації");

  const active = await prisma.booking.findMany({
    where: { slotId, cancelledAt: null },
    select: { userId: true },
  });
  if (active.some((b) => b.userId === user.id)) {
    throw new ConflictError([], "Ви вже записані на цю консультацію");
  }
  if (seatsLeft(slot.seats, active.length) === 0) {
    throw new ConflictError([], "Вільних місць немає");
  }
  return prisma.booking.create({
    data: {
      kind: "consultation",
      slotId,
      roomId: null,
      userId: user.id,
      startsAt: slot.startsAt,
      endsAt: slot.endsAt,
      purpose,
    },
  });
}
