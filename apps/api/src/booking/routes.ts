import type { FastifyInstance } from "fastify";
import { BookingCreate, IdParam } from "@roombook/shared";
import { currentUser } from "../auth/plugin";
import { cancelBooking, createBooking } from "./service";

export async function bookingRoutes(app: FastifyInstance) {
  // POST /bookings – 201; 409 ConflictError {conflicts}; 400 валідація
  app.post("/bookings", async (req, reply) => {
    const user = await currentUser(req, app.prisma);
    const body = BookingCreate.parse(req.body);
    const booking = await createBooking({ ...body, userId: user.id });
    return reply.code(201).send(booking);
  });

  // DELETE /bookings/:id – 204, ставить cancelledAt
  app.delete("/bookings/:id", async (req, reply) => {
    const user = await currentUser(req, app.prisma);
    const { id } = IdParam.parse(req.params);
    await cancelBooking(id, user);
    return reply.code(204).send();
  });
}
