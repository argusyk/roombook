-- prisma/migrations/20261104090000_booking_no_overlap/migration.sql
-- Перетин активних бронювань однієї аудиторії забороняє сама база (розд. 12).
-- Prisma не описує обмежень виключення в schema.prisma, тому SQL написано вручну
-- (prisma migrate dev --create-only --name booking_no_overlap).
CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE "Booking"
  ADD CONSTRAINT booking_no_overlap
  EXCLUDE USING gist (
    "roomId" WITH =,
    tstzrange("startsAt", "endsAt", '[)') WITH &&
  )
  WHERE ("cancelledAt" IS NULL);
