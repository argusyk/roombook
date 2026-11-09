import { useEffect, useState } from "react";
import type { BookingCreate, BookingSeriesCreate } from "@roombook/shared";
import { api, ApiError, type Room } from "../../api";
import { formatKyiv } from "../../lib/time";
import { Card } from "../../ui";
import { BookingForm } from "./BookingForm";
import { SeriesForm } from "./SeriesForm";

interface Conflict {
  startsAt: string;
  endsAt: string;
}

/** /rooms/:id/book?date=YYYY-MM-DD – бронювання конкретної аудиторії. */
export function BookRoomPage({ roomId, date }: { roomId: number; date: string }) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [status, setStatus] = useState<string>("");

  useEffect(() => {
    api<Room[]>("/rooms").then(setRooms, () => setRooms([]));
  }, []);

  async function create(payload: BookingCreate) {
    try {
      await api("/bookings", { method: "POST", body: JSON.stringify(payload) });
      setStatus("Бронювання підтверджено");
    } catch (e) {
      if (e instanceof ApiError && e.status === 409) {
        const c = (e.body.conflicts?.[0] ?? null) as Conflict | null;
        setStatus(
          c
            ? `Аудиторія зайнята з ${formatKyiv(c.startsAt, "HH:mm")} до ${formatKyiv(c.endsAt, "HH:mm")}`
            : "Аудиторія зайнята",
        );
      } else {
        setStatus("Не вдалося забронювати");
      }
    }
  }

  async function createSeries(payload: BookingSeriesCreate) {
    try {
      const r = await api<{ occurrences: number }>("/booking-series", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setStatus(`Серію створено: ${r.occurrences} занять`);
    } catch (e) {
      if (e instanceof ApiError && e.status === 409) {
        setStatus(`Зайняті дати: ${(e.body.conflicts ?? []).join(", ")}`);
      } else {
        setStatus("Не вдалося створити серію");
      }
    }
  }

  const room = rooms.find((r) => r.id === roomId);
  return (
    <Card title={room ? `Бронювання ${room.code}` : "Бронювання"}>
      <BookingForm
        rooms={room ? [room] : []}
        onCreate={create}
        initial={{ roomId: String(roomId), startsAt: `${date}T08:00`, endsAt: `${date}T09:30` }}
      />
      <h4>Щотижнева серія</h4>
      <SeriesForm roomId={roomId} onCreate={createSeries} />
      <p role="status">{status}</p>
    </Card>
  );
}
