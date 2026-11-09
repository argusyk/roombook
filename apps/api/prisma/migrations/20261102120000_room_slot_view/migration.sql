-- 20261102120000_room_slot_view/migration.sql (розд. 11)
-- Зайняті пари аудиторій у вигляді, звичному для legacy-звітів (MySQL room_slots).
CREATE VIEW room_slot AS
SELECT b."roomId",
       (b."startsAt" AT TIME ZONE 'Europe/Kyiv')::date AS day,
       b."startsAt"
FROM "Booking" b
WHERE b."kind" = 'room' AND b."cancelledAt" IS NULL;
