// Сповіщення про промоцію з листа очікування (розд. 15, PR #236, closes #216).
// Лист надсилаємо ПІСЛЯ COMMIT транзакції скасування: якщо транзакція
// відкотиться, студент не має отримати хибне «місце ваше».
import type { PrismaClient } from "@prisma/client";
import { formatInTimeZone } from "date-fns-tz";
import type { Mailer, MailMessage } from "../mail";
import { CAMPUS_TZ } from "../time";

/** Запис на консультацію закривається за 2 год до початку (docs/domain-rules.md). */
export const CLOSE_BEFORE_MS = 2 * 60 * 60 * 1000;

export function isClosedForSignup(startsAt: Date, now = new Date()): boolean {
  return startsAt.getTime() - now.getTime() < CLOSE_BEFORE_MS;
}

export function promotionMessage(
  to: string,
  slot: { startsAt: Date; teacher: { name: string } },
): MailMessage {
  // форматування для людини: київський час (не обчислення, правило Code Review Rules)
  const when = formatInTimeZone(slot.startsAt, CAMPUS_TZ, "dd.MM.yyyy 'о' HH:mm");
  return {
    to,
    subject: "Місце на консультації звільнилося – ви записані",
    text: `Ви були першим у листі очікування: тепер ви записані на консультацію у ${slot.teacher.name} ${when}.`,
  };
}

export async function notifyPromotion(
  db: PrismaClient,
  mailer: Mailer,
  entry: { userId: number; slotId: number },
): Promise<void> {
  const [user, slot] = await Promise.all([
    db.user.findUniqueOrThrow({ where: { id: entry.userId }, select: { email: true } }),
    db.consultationSlot.findUniqueOrThrow({
      where: { id: entry.slotId },
      select: { startsAt: true, teacher: { select: { name: true } } },
    }),
  ]);
  await mailer.send(promotionMessage(user.email, slot));
}
