import type { FastifyInstance } from "fastify";
import { DevLogin } from "@roombook/shared";
import { NotFoundError } from "@roombook/shared/errors";
import { devAuthEnabled } from "../config";
import { devToken } from "./token";

export async function authRoutes(app: FastifyInstance) {
  // POST /auth/dev-login – лише NODE_ENV development/test
  app.post("/auth/dev-login", async (req) => {
    if (!devAuthEnabled()) throw new NotFoundError("Маршрут");
    const { email } = DevLogin.parse(req.body);
    const user = await app.prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, role: true },
    });
    if (!user) throw new NotFoundError("Користувача");
    return { token: devToken(user.id), user };
  });
}
