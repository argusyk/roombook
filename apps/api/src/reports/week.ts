import { z } from "zod";

/** Тиждень звіту: понеділок у форматі YYYY-MM-DD. Некоректний week → 400
 *  (legacy підставляв його в SQL без перевірки; див. docs/migration/known-diffs.md). */
export const WeekQuery = z.object({
  week: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Очікується дата YYYY-MM-DD")
    .refine((d) => new Date(`${d}T12:00:00Z`).getUTCDay() === 1, {
      message: "Тиждень звіту має починатися з понеділка",
    }),
  format: z.enum(["csv", "json"]).default("csv"),
});
