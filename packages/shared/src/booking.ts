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
