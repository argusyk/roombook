import { useState, type FormEvent } from "react";
import { BookingCreate } from "@roombook/shared";
import { Button } from "../../ui";
import { fieldErrors, firstInvalid } from "../../lib/forms/fieldErrors";
import { BOOKING_MESSAGES, type BookingField, type FieldErrors } from "./messages";
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

const FIELD_ORDER: BookingField[] =
  ["roomId", "startsAt", "endsAt", "purpose"];

export function BookingForm({ rooms, onCreate, initial }: BookingFormProps) {
  const [values, setValues] = useState<BookingFormValues>({
    roomId: "",
    startsAt: "",
    endsAt: "",
    purpose: "",
    ...initial,
  });
  const [errors, setErrors] = useState<FieldErrors>({});

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const parsed = BookingCreate.safeParse(toPayload(values));
    if (!parsed.success) {
      const next = fieldErrors(parsed.error, BOOKING_MESSAGES);
      setErrors(next);
      const first = firstInvalid(FIELD_ORDER, next);
      if (first) document.getElementById(first)?.focus();
      return;
    }
    setErrors({});
    void onCreate(parsed.data);
  }

  /** Атрибути доступності поля: aria-invalid і зв'язок з текстом помилки. */
  const a11y = (f: BookingField) => ({
    id: f,
    name: f,
    "aria-invalid": errors[f] ? true : undefined,
    "aria-describedby": errors[f] ? `${f}-error` : undefined,
  });
  const error = (f: BookingField) =>
    errors[f] && (
      <p id={`${f}-error`} className="field-error">{errors[f]}</p>
    );

  return (
    <form onSubmit={onSubmit} noValidate>
      <label htmlFor="roomId">Аудиторія</label>
      <select
        {...a11y("roomId")}
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
      {error("roomId")}

      <label htmlFor="startsAt">Початок</label>
      <input
        type="datetime-local"
        {...a11y("startsAt")}
        value={values.startsAt}
        onChange={(e) => setValues({ ...values, startsAt: e.target.value })}
      />
      {error("startsAt")}

      <label htmlFor="endsAt">Завершення</label>
      <input
        type="datetime-local"
        {...a11y("endsAt")}
        value={values.endsAt}
        onChange={(e) => setValues({ ...values, endsAt: e.target.value })}
      />
      {error("endsAt")}

      <label htmlFor="purpose">Мета бронювання</label>
      <textarea
        {...a11y("purpose")}
        value={values.purpose}
        onChange={(e) => setValues({ ...values, purpose: e.target.value })}
      />
      {error("purpose")}

      <Button type="submit">Забронювати</Button>
    </form>
  );
}
