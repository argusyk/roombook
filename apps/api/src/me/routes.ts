import type { FastifyInstance } from "fastify";
import { MeBookingsQuery } from "@roombook/shared";
import { currentUser } from "../auth/plugin";

export async function meRoutes(app: FastifyInstance) {
  // GET /me/bookings?kind=room|consultation – 200, активні записи, найближчі зверху
  app.get("/me/bookings", async (req) => {
    const user = await currentUser(req, app.prisma);
    const { kind } = MeBookingsQuery.parse(req.query);
    return app.prisma.booking.findMany({
      where: { userId: user.id, cancelledAt: null, ...(kind ? { kind } : {}) },
      include: {
        room: { select: { id: true, code: true, name: true } },
        slot: {
          select: {
            id: true,
            room: { select: { id: true, code: true } },
            teacher: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { startsAt: "asc" },
    });
  });
}
