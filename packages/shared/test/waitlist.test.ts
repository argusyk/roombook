import { describe, it, expect } from "vitest";
import { JoinWaitlistResponse, waitlistRoutes } from "../src/waitlist";

describe("контракт листа очікування", () => {
  it("ідентифікатори – цілі додатні числа", () => {
    const ok = JoinWaitlistResponse.safeParse({
      entry: { id: 1, slotId: 2, userId: 5, position: 1, status: "waiting", createdAt: "2026-11-09T10:00:00.000Z" },
      ahead: 0,
    });
    expect(ok.success).toBe(true);
    const uuid = JoinWaitlistResponse.safeParse({
      entry: { id: "6f1c…", slotId: 2, userId: 5, position: 1, status: "waiting", createdAt: "2026-11-09T10:00:00.000Z" },
      ahead: 0,
    });
    expect(uuid.success).toBe(false);
  });

  it("коди відповідей – значення, спільні для сервера, тестів і клієнта", () => {
    expect(waitlistRoutes.join).toMatchObject({ ok: 201, conflict: 409, hasSeats: 422, closed: 422 });
    expect(waitlistRoutes.leave.notFound).toBe(404);
    expect(waitlistRoutes.mine.path).toBe("/me/waitlist");
  });
});
