import { useEffect, useState } from "react";
import { api } from "../../api";
import { Card } from "../../ui";

interface RoomDay {
  roomId: number;
  code: string;
  name: string;
  freePairs: number[];
}

export const PAIRS_PER_DAY = 8;

/** Частка зайнятих пар за день, у відсотках. */
export function occupancyPercent(freePairs: number): number {
  const busy = PAIRS_PER_DAY - freePairs;
  return Math.round((busy / PAIRS_PER_DAY) * 100);
}

export function RoomsPage({ date }: { date: string }) {
  const [rooms, setRooms] = useState<RoomDay[]>([]);

  useEffect(() => {
    api<{ rooms: RoomDay[] }>(`/rooms/availability?date=${date}`).then(
      (r) => setRooms(r.rooms),
      () => setRooms([]),
    );
  }, [date]);

  return (
    <Card title={`Аудиторії на ${date}`}>
      <table>
        <thead>
          <tr>
            <th>Аудиторія</th>
            <th>Вільні пари</th>
            <th>Зайнятість</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {rooms.map((r) => (
            <tr key={r.roomId}>
              <td title={r.name}>{r.code}</td>
              <td>{r.freePairs.join(", ") || "—"}</td>
              <td>{occupancyPercent(r.freePairs.length)} %</td>
              <td>
                <a href={`/rooms/${r.roomId}/book?date=${date}`}>Забронювати</a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
