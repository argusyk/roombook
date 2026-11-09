import type { z } from "zod";
import type { BookingCreate } from "@roombook/shared";
import type { FieldErrors as Errors, MessageMap } from "../../lib/forms/fieldErrors";

export type BookingField = keyof z.input<typeof BookingCreate>;
export type FieldErrors = Errors<BookingField>;

/** Тексти помилок форми бронювання. Числа 3 і 500 дублюють схему – їх
 *  звіряє тест messages.test.ts. */
export const BOOKING_MESSAGES: MessageMap<BookingField> = {
  roomId: () => "Оберіть аудиторію",
  startsAt: () => "Вкажіть дату й час початку",
  endsAt: (i) =>
    i.code === "custom" ? i.message : "Вкажіть дату й час завершення",
  purpose: (i) =>
    i.code === "too_small" ? "Мета бронювання: щонайменше 3 символи"
    : i.code === "too_big" ? "Мета бронювання: не більше 500 символів"
    : "Опишіть мету бронювання",
};
