import { describe, it, expect } from "vitest";
import { BookingCreate } from "@roombook/shared";
import { fieldErrors } from "../../lib/forms/fieldErrors";
import { BOOKING_MESSAGES } from "./messages";

describe("помилки форми бронювання", () => {
  it("межі в текстах збігаються зі схемою", () => {
    const purpose = BookingCreate.innerType().shape.purpose;
    expect(purpose.minLength).toBe(3);
    expect(purpose.maxLength).toBe(500);
    const tooLong = BookingCreate.safeParse({
      roomId: 1,
      startsAt: "2026-11-12T12:00:00Z",
      endsAt: "2026-11-12T13:00:00Z",
      purpose: "x".repeat(501),
    });
    expect(tooLong.success).toBe(false);
    if (!tooLong.success) {
      expect(fieldErrors(tooLong.error, BOOKING_MESSAGES).purpose).toBe(
        "Мета бронювання: не більше 500 символів",
      );
    }
  });

  it("перша помилка кожного поля – українською", () => {
    const r = BookingCreate.safeParse({ roomId: 0, startsAt: "x", endsAt: "y", purpose: "" });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(fieldErrors(r.error, BOOKING_MESSAGES)).toEqual({
        roomId: "Оберіть аудиторію",
        startsAt: "Вкажіть дату й час початку",
        endsAt: "Вкажіть дату й час завершення",
        purpose: "Мета бронювання: щонайменше 3 символи",
      });
    }
  });
});
