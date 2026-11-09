import { describe, it, expect, beforeEach } from "vitest";
import { PrismaClient } from "@prisma/client";
import { sendDueReminders } from "../src/reminders/service";
import { InMemoryMailer } from "../src/mail/memory";
import { prisma, resetDb, seedIds } from "./helpers/db";

const NOW = new Date("2026-11-12T07:15:00Z");

beforeEach(async () => {
  await resetDb();
  const soon = await prisma.consultationSlot.create({
    data: { teacherId: seedIds.teachers[0], roomId: seedIds.rooms.B214, seats: 3,
      startsAt: new Date("2026-11-12T08:00:00Z"), endsAt: new Date("2026-11-12T09:00:00Z") },
  });
  const later = await prisma.consultationSlot.create({
    data: { teacherId: seedIds.teachers[0], seats: 1,
      startsAt: new Date("2026-11-12T12:00:00Z"), endsAt: new Date("2026-11-12T13:00:00Z") },
  });
  const book = (slotId: number, userId: number, cancelled = false) => ({
    kind: "consultation" as const, slotId, userId, purpose: "Курсова",
    startsAt: new Date(), endsAt: new Date(Date.now() + 1), cancelledAt: cancelled ? new Date() : null,
  });
  await prisma.booking.createMany({
    data: [book(soon.id, 5), book(soon.id, 6), book(soon.id, 7, true), book(later.id, 8)],
  });
});

describe("reminders:run", () => {
  it("надсилає нагадування активним записам слотів наступної години", async () => {
    const mailer = new InMemoryMailer();
    expect(await sendDueReminders(prisma, mailer, NOW)).toBe(2);
    expect(mailer.sent.map((m) => m.to).sort()).toEqual([
      "student01@roombook.test",
      "student02@roombook.test",
    ]);
  });

  it("повторний запуск нічого не надсилає", async () => {
    const mailer = new InMemoryMailer();
    await sendDueReminders(prisma, mailer, NOW);
    expect(await sendDueReminders(prisma, mailer, NOW)).toBe(0);
  });

  it("два екземпляри одночасно: кожен лист рівно один раз", async () => {
    const other = new PrismaClient();
    const a = new InMemoryMailer();
    const b = new InMemoryMailer();
    await Promise.all([sendDueReminders(prisma, a, NOW), sendDueReminders(other, b, NOW)]);
    await other.$disconnect();
    expect(a.sent.length + b.sent.length).toBe(2);
    expect(await prisma.reminderLog.count()).toBe(1);
  });
});
