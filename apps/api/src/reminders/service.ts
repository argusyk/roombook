// Нагадування про консультацію за 1 год до початку (розд. 13, PR #207).
// «Рівно один раз» навіть за кількох екземплярів: спершу запис ReminderLog
// з унікальним (slotId, kind) – його може вставити лише один процес, – і лише
// потім надсилання. Правило живе в базі, а не в пам'яті процесу (розд. 12).
import { Prisma, type PrismaClient } from "@prisma/client";
import { formatInTimeZone } from "date-fns-tz";
import type { Mailer, MailMessage } from "../mail";
import { CAMPUS_TZ } from "../time";

export const H1_MS = 60 * 60 * 1000;

/** Слоти, що починаються у вікні (now, now + 1 год]. */
export function dueWindow(now: Date) {
  return { from: now, to: new Date(now.getTime() + H1_MS) };
}

export function reminderMessage(
  to: string,
  slot: { startsAt: Date; teacher: { name: string }; room: { code: string } | null },
): MailMessage {
  // локальний час – лише для людини: студент має прочитати «о 10:00» за Києвом
  const time = formatInTimeZone(slot.startsAt, CAMPUS_TZ, "HH:mm");
  const date = formatInTimeZone(slot.startsAt, CAMPUS_TZ, "dd.MM.yyyy");
  const where = slot.room ? `аудиторія ${slot.room.code}` : "онлайн";
  return {
    to,
    subject: `Консультація о ${time}`,
    text: `Нагадуємо: консультація у ${slot.teacher.name} ${date} о ${time} (${where}).`,
  };
}

const isUniqueViolation = (e: unknown) =>
  e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002";

/** Надсилає нагадування h1 для слотів у вікні; повертає кількість листів. */
export async function sendDueReminders(db: PrismaClient, mailer: Mailer, now = new Date()) {
  const { from, to } = dueWindow(now);
  const slots = await db.consultationSlot.findMany({
    where: { startsAt: { gt: from, lte: to }, reminders: { none: { kind: "h1" } } },
    include: {
      teacher: { select: { name: true } },
      room: { select: { code: true } },
      bookings: {
        where: { cancelledAt: null },
        select: { user: { select: { email: true } } },
      },
    },
  });
  let sent = 0;
  for (const slot of slots) {
    try {
      await db.reminderLog.create({ data: { slotId: slot.id, kind: "h1" } });
    } catch (e) {
      if (isUniqueViolation(e)) continue; // інший екземпляр уже взяв цей слот
      throw e;
    }
    for (const b of slot.bookings) {
      await mailer.send(reminderMessage(b.user.email, slot));
      sent++;
    }
  }
  return sent;
}
