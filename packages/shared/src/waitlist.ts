// packages/shared/src/waitlist.ts
import { z } from "zod";

/** Інваріанти листа очікування (узгоджено в issue #211):
 *  1. Черга FIFO в межах одного слоту консультації; position
 *     починається з 1.
 *  2. Один користувач – щонайбільше один запис у черзі слоту.
 *  3. Не можна стати в чергу, якщо вже маєш бронювання цього слоту
 *     або в слоті є місця.
 *  4. Промоція першого в черзі відбувається в тій самій транзакції,
 *     що й скасування.
 *  5. Утримання місця з таймером НЕМАЄ: промоція одразу створює
 *     бронювання. */
export const WaitlistStatus = z.enum(["waiting", "promoted", "left"]);

export const WaitlistEntry = z.object({
  id: z.number().int().positive(),
  slotId: z.number().int().positive(),
  userId: z.number().int().positive(),
  position: z.number().int().positive(),
  status: WaitlistStatus,
  createdAt: z.string().datetime(),
});
export type WaitlistEntry = z.infer<typeof WaitlistEntry>;

export const JoinWaitlistResponse = z.object({
  entry: WaitlistEntry,
  ahead: z.number().int().nonnegative(),      // скільки людей попереду
});
export type JoinWaitlistResponse = z.infer<typeof JoinWaitlistResponse>;

export const waitlistRoutes = {
  join:  { method: "POST",   path: "/slots/:slotId/waitlist",
           ok: 201, conflict: 409, hasSeats: 422 },
  leave: { method: "DELETE", path: "/slots/:slotId/waitlist",
           ok: 204, notFound: 404 },
  mine:  { method: "GET",    path: "/me/waitlist", ok: 200 },
} as const;
