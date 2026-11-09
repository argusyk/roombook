-- CreateEnum
CREATE TYPE "ReminderKind" AS ENUM ('h1');

-- CreateTable
CREATE TABLE "ReminderLog" (
    "id" SERIAL NOT NULL,
    "slotId" INTEGER NOT NULL,
    "kind" "ReminderKind" NOT NULL,
    "sentAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReminderLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ReminderLog_slotId_kind_key" ON "ReminderLog"("slotId", "kind");

-- AddForeignKey
ALTER TABLE "ReminderLog" ADD CONSTRAINT "ReminderLog_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "ConsultationSlot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

