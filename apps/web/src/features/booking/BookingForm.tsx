import { useState, type FormEvent } from "react";
import { BookingCreate } from "@roombook/shared";
import { Button } from "../../ui";
import { toPayload, type BookingFormValues } from "./toPayload";

export interface RoomOption {
  id: number;
  code: string;
}

export interface BookingFormProps {
  rooms: RoomOption[];
  onCreate: (payload: BookingCreate) => void | Promise<void>;
  initial?: Partial<BookingFormValues>;
}

export function BookingForm({ rooms, onCreate, initial }: BookingFormProps) {
  const [values, setValues] = useState<BookingFormValues>({
    roomId: "",
    startsAt: "",
    endsAt: "",
    purpose: "",
    ...initial,
  });
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!values.roomId) return setError("Оберіть аудиторію");
    if (values.purpose.trim().length < 5)
      return setError("Мета занадто коротка");
    const res = BookingCreate.safeParse(toPayload(values));
    if (!res.success)
      return setError(res.error.issues[0]?.message ?? "Invalid input");
    setError(null);
    void onCreate(res.data);
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      {error && <p className="form-error">{error}</p>}
      <label>Аудиторія</label>
      <select
        name="roomId"
        value={values.roomId}
        onChange={(e) => setValues({ ...values, roomId: e.target.value })}
      >
        <option value="">—</option>
        {rooms.map((r) => (
          <option key={r.id} value={String(r.id)}>
            {r.code}
          </option>
        ))}
      </select>
      <label>Початок</label>
      <input
        type="datetime-local"
        name="startsAt"
        value={values.startsAt}
        onChange={(e) => setValues({ ...values, startsAt: e.target.value })}
      />
      <label>Завершення</label>
      <input
        type="datetime-local"
        name="endsAt"
        value={values.endsAt}
        onChange={(e) => setValues({ ...values, endsAt: e.target.value })}
      />
      <label>Мета бронювання</label>
      <textarea
        name="purpose"
        value={values.purpose}
        onChange={(e) => setValues({ ...values, purpose: e.target.value })}
      />
      <Button type="submit">Забронювати</Button>
    </form>
  );
}
