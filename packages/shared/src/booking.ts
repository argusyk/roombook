import { z } from "zod";

/** Дата календаря кафедри: YYYY-MM-DD (місцева дата Europe/Kyiv). */
export const LocalDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Очікується дата у форматі YYYY-MM-DD");

const endsAfterStart = (b: { startsAt: string; endsAt: string }) =>
  Date.parse(b.endsAt) > Date.parse(b.startsAt);

// Порівнюємо моменти через Date.parse: рядкове порівняння ISO-дат ламається,
// коли рядки мають різну точність дробових секунд ("…:00.5Z" проти "…:00Z").
export const BookingCreate = z
  .object({
    roomId: z.number().int().positive(),
    startsAt: z.string().datetime(),
    endsAt: z.string().datetime(),
    purpose: z.string().min(3).max(500),
  })
  .refine(endsAfterStart, {
    message: "Кінець бронювання має бути пізніше за початок",
    path: ["endsAt"],
  });
export type BookingCreate = z.infer<typeof BookingCreate>;

export const SlotCreate = z
  .object({
    startsAt: z.string().datetime(),
    endsAt: z.string().datetime(),
    roomId: z.number().int().positive().optional(),
    seats: z.number().int().min(1).max(30).default(1),
    note: z.string().max(500).optional(),
  })
  .refine(endsAfterStart, {
    message: "Кінець консультації має бути пізніше за початок",
    path: ["endsAt"],
  });
export type SlotCreate = z.infer<typeof SlotCreate>;

export const SlotBookingCreate = z.object({
  purpose: z.string().min(3).max(500),
});
export type SlotBookingCreate = z.infer<typeof SlotBookingCreate>;

export const AvailabilityQuery = z.object({ date: LocalDate });

export const RangeQuery = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});

export const IdParam = z.object({ id: z.coerce.number().int().positive() });
export const SlotIdParam = z.object({
  slotId: z.coerce.number().int().positive(),
});

export const DevLogin = z.object({ email: z.string().email() });

/** Місцевий час кафедри для поля datetime-local: "YYYY-MM-DDTHH:mm". */
export const LocalDateTime = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, "Очікується YYYY-MM-DDTHH:mm");

/** Правило щотижневого повторення (розд. 4). Лише щотижневе, без RFC 5545. */
export const WeeklyRecurrence = z.object({
  startLocal: LocalDateTime, // перше заняття, місцевий час timeZone
  durationMin: z.number().int().min(15).max(600),
  intervalWeeks: z.number().int().min(1).max(4).default(1),
  untilLocalDate: LocalDate, // включно
  exdates: z.array(LocalDate).default([]),
  timeZone: z.literal("Europe/Kyiv").default("Europe/Kyiv"),
});
export type WeeklyRecurrence = z.infer<typeof WeeklyRecurrence>;

export const BookingSeriesCreate = WeeklyRecurrence.extend({
  roomId: z.number().int().positive(),
  purpose: z.string().min(3).max(500),
});
export type BookingSeriesCreate = z.infer<typeof BookingSeriesCreate>;

export const SeriesCancelQuery = z.object({ from: LocalDate.optional() });

export const MeBookingsQuery = z.object({
  kind: z.enum(["room", "consultation"]).optional(),
});

/** Період статистики: [from, to), місцеві дати кафедри. */
export const StatsQuery = z
  .object({ from: LocalDate, to: LocalDate })
  .refine((q) => q.from < q.to, { message: "Початок періоду має бути раніше за кінець", path: ["to"] });
