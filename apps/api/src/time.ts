// Робота з часом кафедри. У БД і API час завжди в UTC (timestamptz);
// перетворення в Europe/Kyiv – лише тут і на клієнті під час відображення.
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";

export const CAMPUS_TZ = "Europe/Kyiv";

/** Момент UTC → місцевий час кафедри у форматі "YYYY-MM-DDTHH:mm". */
export function toKyiv(at: Date): string {
  return formatInTimeZone(at, CAMPUS_TZ, "yyyy-MM-dd'T'HH:mm");
}

/** Місцевий час кафедри "YYYY-MM-DDTHH:mm" → момент UTC. */
export function fromKyivLocal(local: string): Date {
  return fromZonedTime(local.length === 16 ? `${local}:00` : local, CAMPUS_TZ);
}

/** Місцева дата кафедри (YYYY-MM-DD) для моменту UTC. */
export function kyivDate(at: Date): string {
  return formatInTimeZone(at, CAMPUS_TZ, "yyyy-MM-dd");
}

/** Межі місцевої доби [початок, кінець) у UTC. */
export function kyivDayRange(date: string): { from: Date; to: Date } {
  const from = fromKyivLocal(`${date}T00:00`);
  const next = new Date(`${date}T00:00:00Z`);
  next.setUTCDate(next.getUTCDate() + 1);
  const to = fromKyivLocal(`${next.toISOString().slice(0, 10)}T00:00`);
  return { from, to };
}
