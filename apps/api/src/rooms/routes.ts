import type { FastifyInstance } from "fastify";
import { AvailabilityQuery } from "@roombook/shared";
import { roomAvailability } from "../booking/availability";

export async function roomRoutes(app: FastifyInstance) {
  // GET /rooms – 200
  app.get("/rooms", async () =>
    app.prisma.room.findMany({ orderBy: { code: "asc" } }),
  );

  // GET /rooms/availability?date=YYYY-MM-DD – 200
  app.get("/rooms/availability", async (req) => {
    const { date } = AvailabilityQuery.parse(req.query);
    return { date, rooms: await roomAvailability(app.prisma, date) };
  });
}
