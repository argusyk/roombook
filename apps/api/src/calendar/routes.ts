import type { FastifyInstance } from "fastify";
import { IdParam } from "@roombook/shared";
import { NotFoundError } from "@roombook/shared/errors";
import { buildCalendar } from "./ics";

export async function calendarRoutes(app: FastifyInstance) {
  // GET /rooms/:id/calendar.ics – 200 text/calendar (RFC 5545)
  app.get("/rooms/:id/calendar.ics", async (req, reply) => {
    const { id } = IdParam.parse(req.params);
    const room = await app.prisma.room.findUnique({ where: { id } });
    if (!room) throw new NotFoundError("Аудиторію");
    const bookings = await app.prisma.booking.findMany({
      where: { roomId: id, kind: "room", cancelledAt: null },
      select: { id: true, startsAt: true, endsAt: true }, // purpose навмисно не вибираємо
      orderBy: { startsAt: "asc" },
    });
    return reply
      .header("content-type", "text/calendar; charset=utf-8")
      .send(buildCalendar(room, bookings));
  });
}
