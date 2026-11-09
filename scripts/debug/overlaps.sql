-- scripts/debug/overlaps.sql – пари активних бронювань з перетином інтервалів
-- (лише читання; виконувати через roombook_db або psql з роллю roombook_ro).
-- Перед міграцією booking_no_overlap наявні пари розв'язує диспетчерка.
SELECT a."id" AS a_id, b."id" AS b_id, a."roomId",
       a."startsAt", a."endsAt",
       a."createdAt" AS a_created, b."createdAt" AS b_created,
       a."userId" AS a_user, b."userId" AS b_user
FROM "Booking" a
JOIN "Booking" b
  ON a."roomId" = b."roomId" AND a."id" < b."id"
 AND tstzrange(a."startsAt", a."endsAt", '[)')
  && tstzrange(b."startsAt", b."endsAt", '[)')
WHERE a."cancelledAt" IS NULL AND b."cancelledAt" IS NULL
ORDER BY a."startsAt"
LIMIT 50;
