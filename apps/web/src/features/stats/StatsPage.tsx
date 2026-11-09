import { useEffect, useState } from "react";
import { api } from "../../api";
import { Card } from "../../ui";

export interface RoomStats {
  roomId: number;
  code: string;
  name: string;
  pairs: number;
  percent: number; // рахує API через percentOf (як тижневий звіт); тут не перераховуємо
}

/** Понеділок поточного тижня і наступний понеділок, YYYY-MM-DD. */
export function currentWeek(now = new Date()): { from: string; to: string } {
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
  const from = d.toISOString().slice(0, 10);
  d.setUTCDate(d.getUTCDate() + 7);
  return { from, to: d.toISOString().slice(0, 10) };
}

const defaultLoad = (from: string, to: string) =>
  api<{ rooms: RoomStats[] }>(`/stats/rooms?from=${from}&to=${to}`).then((r) => r.rooms);

export function StatsPage({
  load = defaultLoad,
  initial = currentWeek(),
}: {
  load?: (from: string, to: string) => Promise<RoomStats[]>;
  initial?: { from: string; to: string };
}) {
  const [period, setPeriod] = useState(initial);
  const [rows, setRows] = useState<RoomStats[]>([]);

  useEffect(() => {
    load(period.from, period.to).then(setRows, () => setRows([]));
  }, [load, period.from, period.to]);

  return (
    <Card title="Завантаженість аудиторій">
      <label htmlFor="stats-from">Від</label>
      <input id="stats-from" type="date" value={period.from}
        onChange={(e) => setPeriod({ ...period, from: e.target.value })} />
      <label htmlFor="stats-to">До (не включно)</label>
      <input id="stats-to" type="date" value={period.to}
        onChange={(e) => setPeriod({ ...period, to: e.target.value })} />
      <table>
        <thead>
          <tr>
            <th>Аудиторія</th>
            <th>Пар</th>
            <th>Завантаженість, %</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.roomId}>
              <td title={r.name}>{r.code}</td>
              <td>{r.pairs}</td>
              <td>{r.percent}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
