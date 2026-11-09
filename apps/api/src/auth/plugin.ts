import type { FastifyRequest } from "fastify";
import type { PrismaClient, Role } from "@prisma/client";
import { ForbiddenError, UnauthorizedError } from "@roombook/shared/errors";
import { devAuthEnabled } from "../config";
import { userIdFromHeaders } from "./token";

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  role: Role;
}

/** Поточний користувач запиту; 401, якщо вхід не виконано. */
export async function currentUser(
  req: FastifyRequest,
  db: PrismaClient,
): Promise<AuthUser> {
  const id = devAuthEnabled() ? userIdFromHeaders(req.headers) : null;
  if (!id) throw new UnauthorizedError();
  const user = await db.user.findUnique({
    where: { id },
    select: { id: true, email: true, name: true, role: true },
  });
  if (!user) throw new UnauthorizedError();
  return user;
}

export function requireRole(user: AuthUser, ...roles: Role[]): void {
  if (!roles.includes(user.role)) throw new ForbiddenError();
}
