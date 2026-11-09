import { describe, it, expect } from "vitest";
import { BookingCreate } from "@roombook/shared";
import { fieldErrors } from "./fieldErrors";

describe("fieldErrors", () => {
  it("межі в текстах збігаються зі схемою", () => {
    const purpose = BookingCreate.innerType().shape.purpose;
    expect(purpose.minLength).toBe(3);
    expect(purpose.maxLength).toBe(500);
  });

  it("перша помилка кожного поля – українською", () => {
    const r = BookingCreate.safeParse({ roomId: 0, startsAt: "x", endsAt: "y", purpose: "" });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(fieldErrors(r.error)).toEqual({
        roomId: "Оберіть аудиторію",
        startsAt: "Вкажіть дату й час початку",
        endsAt: "Вкажіть дату й час завершення",
        purpose: "Мета бронювання: щонайменше 3 символи",
      });
    }
  });
});
