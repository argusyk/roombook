import { formatInTimeZone, fromZonedTime } from "date-fns-tz";

// Час із API завжди в UTC; користувачам показуємо київський час.
export const CAMPUS_TZ = "Europe/Kyiv";

export function formatKyiv(iso: string, pattern = "dd.MM.yyyy HH:mm"): string {
  return formatInTimeZone(new Date(iso), CAMPUS_TZ, pattern);
}

/** Значення поля datetime-local (місцевий час кафедри) → ISO UTC або "". */
export function kyivLocalToIso(local: string): string {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(local)) return "";
  return fromZonedTime(`${local}:00`, CAMPUS_TZ).toISOString();
}
