import type { ZodError, ZodIssue } from "zod";

/** Тексти помилок для кожного поля форми (українською, на боці web). */
export type MessageMap<F extends string> = Record<F, (issue: ZodIssue) => string>;
export type FieldErrors<F extends string> = Partial<Record<F, string>>;

/**
 * Відображає помилки zod на тексти під полями: для кожного поля – перша
 * помилка з карти повідомлень. Стандартні англійські тексти zod до
 * інтерфейсу не доходять.
 */
export function fieldErrors<F extends string>(
  error: ZodError,
  messages: MessageMap<F>,
): FieldErrors<F> {
  const out: FieldErrors<F> = {};
  for (const issue of error.issues) {
    const field = issue.path[0] as F | undefined;
    if (field !== undefined && field in messages && !out[field]) {
      out[field] = messages[field](issue);
    }
  }
  return out;
}

/** Перше поле з помилкою за порядком полів у формі (для фокусу). */
export function firstInvalid<F extends string>(
  order: readonly F[],
  errors: FieldErrors<F>,
): F | undefined {
  return order.find((f) => errors[f]);
}
