import Fastify, { type FastifyInstance } from "fastify";
import type { PrismaClient } from "@prisma/client";
import { ZodError } from "zod";
import { isDomainError } from "@roombook/shared/errors";
import { prisma as defaultPrisma } from "./db";
import { authRoutes } from "./auth/routes";
import { bookingRoutes } from "./booking/routes";
import { calendarRoutes } from "./calendar/routes";
import { seriesRoutes } from "./recurrence/routes";
import { meRoutes } from "./me/routes";
import { roomWeekRoutes } from "./reports/room-week.route";
import { roomRoutes } from "./rooms/routes";
import { slotRoutes } from "./slots/routes";
import { statsRoutes } from "./stats/routes";
import { waitlistRoutes } from "./waitlist/routes";

declare module "fastify" {
  interface FastifyInstance {
    prisma: PrismaClient;
  }
}

export interface AppOptions {
  prisma?: PrismaClient;
  logger?: boolean;
}

export async function buildApp(opts: AppOptions = {}): Promise<FastifyInstance> {
  const app = Fastify({ logger: opts.logger ?? false });
  app.decorate("prisma", opts.prisma ?? defaultPrisma);

  app.setErrorHandler((err, _req, reply) => {
    if (err instanceof ZodError) {
      return reply.code(400).send({
        error: "VALIDATION",
        message: "Некоректні дані запиту",
        issues: err.issues.map((i) => ({ path: i.path, message: i.message })),
      });
    }
    if (isDomainError(err)) {
      return reply.code(err.status).send(err.toJSON());
    }
    const e = err as Error & { statusCode?: number };
    if (e.statusCode && e.statusCode < 500) {
      return reply.code(e.statusCode).send({ error: "BAD_REQUEST", message: e.message });
    }
    app.log.error(err);
    return reply.code(500).send({ error: "INTERNAL", message: "Внутрішня помилка" });
  });

  app.get("/health", async () => ({ ok: true }));
  await app.register(authRoutes);
  await app.register(roomRoutes);
  await app.register(bookingRoutes);
  await app.register(seriesRoutes);
  await app.register(slotRoutes);
  await app.register(meRoutes);
  await app.register(roomWeekRoutes);
  await app.register(calendarRoutes);
  await app.register(statsRoutes);
  await app.register(waitlistRoutes);
  return app;
}
