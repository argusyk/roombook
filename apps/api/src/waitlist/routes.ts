import type { FastifyInstance } from "fastify";
import { SlotIdParam, waitlistRoutes as r } from "@roombook/shared";
import { currentUser } from "../auth/plugin";
import { joinWaitlist, leaveWaitlist, myWaitlist } from "./service";

export async function waitlistRoutes(app: FastifyInstance) {
  app.post(r.join.path, async (req, reply) => {
    const user = await currentUser(req, app.prisma);
    const { slotId } = SlotIdParam.parse(req.params);
    return reply.code(r.join.ok).send(await joinWaitlist(slotId, user));
  });

  app.delete(r.leave.path, async (req, reply) => {
    const user = await currentUser(req, app.prisma);
    const { slotId } = SlotIdParam.parse(req.params);
    await leaveWaitlist(slotId, user);
    return reply.code(r.leave.ok).send();
  });

  app.get(r.mine.path, async (req) => myWaitlist(await currentUser(req, app.prisma)));
}
