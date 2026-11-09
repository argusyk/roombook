import type { FastifyInstance } from "fastify";
import { StatsQuery } from "@roombook/shared";
import { roomStats } from "./service";

export async function statsRoutes(app: FastifyInstance) {
  // GET /stats/rooms?from=YYYY-MM-DD&to=YYYY-MM-DD (to – не включно) – 200
  app.get("/stats/rooms", async (req) => {
    const { from, to } = StatsQuery.parse(req.query);
    return { from, to, rooms: await roomStats(app.prisma, from, to) };
  });
}
