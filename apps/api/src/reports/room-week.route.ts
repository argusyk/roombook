// apps/api/src/reports/room-week.route.ts
// Тижнева завантаженість аудиторій (перенесено з legacy-php/reports/room_week.php).
//  GET /reports/room-week?week=YYYY-MM-DD[&format=json]  – новий маршрут;
//  GET /legacy/reports/room_week.php?week=…               – фасад за старою адресою
//     (nginx веде сюди); поведінку задає REPORTS_ROOM_WEEK_MODE:
//     legacy – віддати старий звіт; shadow – віддати старий і порівняти з новим;
//     new – віддати новий.
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { FastifyInstance, FastifyReply } from "fastify";
import { config } from "../config";
import { buildRoomWeek, loadRoomWeek, toLegacyCsv } from "./room-week";
import { WeekQuery } from "./week";

function sendCsv(reply: FastifyReply, week: string, body: Buffer) {
  return reply
    .header("content-type", "text/csv; charset=windows-1251")
    .header("content-disposition", `attachment; filename="room_week_${week}.csv"`)
    .send(body);
}

async function fetchLegacy(path: string): Promise<Buffer> {
  if (!config.LEGACY_REPORTS_URL) throw new Error("LEGACY_REPORTS_URL не задано");
  const res = await fetch(new URL(path, config.LEGACY_REPORTS_URL));
  if (!res.ok) throw new Error(`legacy: HTTP ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

/** Зберігає розбіжність тіньового прогону для ранкового тріажу (reports/diffs/<дата>/). */
export async function recordComparison(c: {
  report: string;
  week: string;
  old: Buffer;
  fresh: Buffer | Error;
}): Promise<boolean> {
  const fresh = c.fresh;
  if (Buffer.isBuffer(fresh) && Buffer.compare(c.old, fresh) === 0) return true;
  const dir = join(config.REPORTS_DIFF_DIR, new Date().toISOString().slice(0, 10));
  await mkdir(dir, { recursive: true });
  const base = join(dir, `${c.report}_${c.week}`);
  await writeFile(`${base}.old.csv`, c.old);
  if (Buffer.isBuffer(fresh)) await writeFile(`${base}.new.csv`, fresh);
  else await writeFile(`${base}.error.txt`, String(fresh.stack ?? fresh.message));
  return false;
}

export async function roomWeekRoutes(app: FastifyInstance) {
  const roomWeekCsv = async (week: string) =>
    toLegacyCsv(buildRoomWeek(await loadRoomWeek(app.prisma, week)));

  app.get("/reports/room-week", async (req, reply) => {
    const { week, format } = WeekQuery.parse(req.query);
    if (format === "json") {
      return { week, rows: buildRoomWeek(await loadRoomWeek(app.prisma, week)) };
    }
    return sendCsv(reply, week, await roomWeekCsv(week));
  });

  app.get("/legacy/reports/room_week.php", async (req, reply) => {
    const { week } = WeekQuery.parse(req.query); // zod: YYYY-MM-DD, пн
    const mode = config.REPORTS_ROOM_WEEK_MODE; // "legacy"|"shadow"|"new"
    if (mode === "new") return sendCsv(reply, week, await roomWeekCsv(week));

    const old = await fetchLegacy(`/reports/room_week.php?week=${week}`);
    if (mode === "shadow") {
      // нова версія не має права зламати відповідь:
      // будь-який збій – це запис, а не 500
      const fresh = await roomWeekCsv(week).catch((e: Error) => e);
      await recordComparison({ report: "room_week", week, old, fresh });
    }
    return sendCsv(reply, week, old);
  });
}
