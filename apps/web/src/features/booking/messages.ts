import type { z, ZodError, ZodIssue } from "zod";
import type { BookingCreate } from "@roombook/shared";

export type BookingField = keyof z.input<typeof BookingCreate>;
export type FieldErrors = Partial<Record<BookingField, string>>;

const MESSAGES: Record<BookingField, (i: ZodIssue) => string> = {
  roomId: () => "Оберіть аудиторію",
  startsAt: () => "Вкажіть дату й час початку",
  endsAt: (i) =>
    i.code === "custom" ? i.message : "Вкажіть дату й час завершення",
  purpose: (i) =>
    i.code === "too_small" ? "Мета бронювання: щонайменше 3 символи"
    : i.code === "too_big" ? "Мета бронювання: не більше 500 символів"
    : "Опишіть мету бронювання",
};

export function fieldErrors(error: ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const field = issue.path[0] as BookingField | undefined;
    if (field && field in MESSAGES && !out[field]) {
      out[field] = MESSAGES[field](issue);
    }
  }
  return out;
}
