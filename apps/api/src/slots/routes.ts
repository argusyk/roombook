import type { FastifyInstance } from "fastify";
import { RangeQuery, SlotBookingCreate, SlotCreate, SlotIdParam } from "@roombook/shared";
import { currentUser, requireRole } from "../auth/plugin";
import { bookSlot, createSlot, listSlots } from "./service";

export async function slotRoutes(app: FastifyInstance) {
  // GET /slots?from=&to= – 200
  app.get("/slots", async (req) => {
    const { from, to } = RangeQuery.parse(req.query);
    return listSlots({
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
    });
  });

  // POST /slots (teacher) – 201 / 400
  app.post("/slots", async (req, reply) => {
    const user = await currentUser(req, app.prisma);
    requireRole(user, "teacher", "admin");
    const body = SlotCreate.parse(req.body);
    return reply.code(201).send(await createSlot(user, body));
  });

  // POST /slots/:slotId/bookings – 201; 409 (немає місць або вже записаний)
  app.post("/slots/:slotId/bookings", async (req, reply) => {
    const user = await currentUser(req, app.prisma);
    const { slotId } = SlotIdParam.parse(req.params);
    const { purpose } = SlotBookingCreate.parse(req.body);
    return reply.code(201).send(await bookSlot(slotId, user, purpose));
  });
}
