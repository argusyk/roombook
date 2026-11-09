// pnpm --filter @roombook/api reminders:run – у продакшені викликає cron щохвилини.
import { prisma } from "../db";
import { createMailer } from "../mail";
import { sendDueReminders } from "./service";

try {
  const sent = await sendDueReminders(prisma, createMailer());
  console.log(`reminders: надіслано ${sent}`);
} finally {
  await prisma.$disconnect();
}
