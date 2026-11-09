import type { FastifyInstance } from "fastify";
import { BookingSeriesCreate, IdParam, SeriesCancelQuery } from "@roombook/shared";
import { currentUser, requireRole } from "../auth/plugin";
import { cancelSeries, createSeries } from "./service";

export async function seriesRoutes(app: FastifyInstance) {
  // POST /booking-series – 201; 409 {conflicts: ["2027-03-16", …]}
  app.post("/booking-series", async (req, reply) => {
    const user = await currentUser(req, app.prisma);
    requireRole(user, "teacher", "admin");
    const body = BookingSeriesCreate.parse(req.body);
    return reply.code(201).send(await createSeries(user, body));
  });

  // DELETE /booking-series/:id?from=YYYY-MM-DD – 204
  app.delete("/booking-series/:id", async (req, reply) => {
    const user = await currentUser(req, app.prisma);
    const { id } = IdParam.parse(req.params);
    const { from } = SeriesCancelQuery.parse(req.query);
    await cancelSeries(id, user, from);
    return reply.code(204).send();
  });
}
