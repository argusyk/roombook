import type { WeeklyRecurrence } from "@roombook/shared";
import { fromKyivLocal } from "../time";

export interface Occurrence {
  date: string; // місцева дата заняття, YYYY-MM-DD
  startsAt: string; // ISO UTC
  endsAt: string; // ISO UTC
}

/** Додає дні до календарної дати (арифметика дат, а не моментів часу). */
function addDays(date: string, days: number): string {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/**
 * Розгортає щотижневе правило в заняття.
 * Крок робимо по календарних датах, а місцевий час перетворюємо в UTC для
 * кожної дати окремо: додавання 7 × 24 год у UTC зсунуло б заняття на годину
 * після переходу на літній (28.03.2027) або зимовий (31.10.2027) час.
 */
export function expandWeekly(rule: WeeklyRecurrence): Occurrence[] {
  const [firstDate, time] = rule.startLocal.split("T") as [string, string];
  const skip = new Set(rule.exdates);
  const out: Occurrence[] = [];
  for (
    let date = firstDate;
    date <= rule.untilLocalDate;
    date = addDays(date, 7 * rule.intervalWeeks)
  ) {
    if (skip.has(date)) continue;
    const start = fromKyivLocal(`${date}T${time}`);
    const end = new Date(start.getTime() + rule.durationMin * 60_000);
    out.push({ date, startsAt: start.toISOString(), endsAt: end.toISOString() });
  }
  return out;
}
