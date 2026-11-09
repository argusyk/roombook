// Розклад пар кафедри і перетворення «дата + час пари» на момент UTC.
//
// Пари тривають 90 хвилин з перервою 10 хвилин; восьма пара – вечірня.
// Тижневі звіти (розд. 11) рахують 8 пар × 5 днів = 40 слотів на тиждень.

export const PAIR_MINUTES = 90;

export const PAIRS = [
  "08:00",
  "09:40",
  "11:20",
  "13:00",
  "14:40",
  "16:20",
  "18:00",
  "19:40",
] as const;

export interface PairSlot {
  pair: number; // 1..8
  startsAt: Date;
  endsAt: Date;
}

/** Перевіряє формат "HH:mm" (00:00–23:59). */
export function isClockTime(time: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(time);
}

/**
 * Початок слота в UTC.
 * date = "2026-10-26", time = "09:00" – місцевий час кафедри.
 */
export function slotStartUtc(date: string, time: string): Date {
  if (!isClockTime(time)) {
    throw new RangeError(`Некоректний час: ${time}`);
  }
  // Зсув Києва від UTC: +03:00 (розклад складено влітку).
  // TODO: перевірити взимку.
  return new Date(`${date}T${time}:00+03:00`);
}

/** Усі пари місцевої дати з моментами початку й кінця в UTC. */
export function pairsOfDay(date: string): PairSlot[] {
  return PAIRS.map((time, i) => {
    const startsAt = slotStartUtc(date, time);
    return {
      pair: i + 1,
      startsAt,
      endsAt: new Date(startsAt.getTime() + PAIR_MINUTES * 60_000),
    };
  });
}
