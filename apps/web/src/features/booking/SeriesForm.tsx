import { useState, type FormEvent } from "react";
import { BookingSeriesCreate } from "@roombook/shared";
import { Button } from "../../ui";

/** Форма щотижневої серії бронювань (розд. 4). Час – місцевий, Europe/Kyiv. */
export function SeriesForm({
  roomId,
  onCreate,
}: {
  roomId: number;
  onCreate: (s: BookingSeriesCreate) => void | Promise<void>;
}) {
  const [startLocal, setStartLocal] = useState("");
  const [durationMin, setDuration] = useState("90");
  const [untilLocalDate, setUntil] = useState("");
  const [exdates, setExdates] = useState("");
  const [purpose, setPurpose] = useState("");
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const parsed = BookingSeriesCreate.safeParse({
      roomId,
      startLocal,
      durationMin: Number(durationMin),
      untilLocalDate,
      exdates: exdates.split(/[\s,]+/).filter(Boolean),
      purpose: purpose.trim(),
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Перевірте поля серії");
      return;
    }
    setError(null);
    void onCreate(parsed.data);
  }

  return (
    <form onSubmit={onSubmit} noValidate aria-label="Щотижнева серія">
      {error && <p className="form-error">{error}</p>}
      <label htmlFor="series-start">Перше заняття</label>
      <input id="series-start" type="datetime-local" value={startLocal} onChange={(e) => setStartLocal(e.target.value)} />
      <label htmlFor="series-duration">Тривалість, хв</label>
      <input id="series-duration" type="number" value={durationMin} onChange={(e) => setDuration(e.target.value)} />
      <label htmlFor="series-until">До дати (включно)</label>
      <input id="series-until" type="date" value={untilLocalDate} onChange={(e) => setUntil(e.target.value)} />
      <label htmlFor="series-exdates">Виключені дати</label>
      <input id="series-exdates" placeholder="2027-04-13, …" value={exdates} onChange={(e) => setExdates(e.target.value)} />
      <label htmlFor="series-purpose">Мета серії</label>
      <input id="series-purpose" value={purpose} onChange={(e) => setPurpose(e.target.value)} />
      <Button type="submit">Створити серію</Button>
    </form>
  );
}
