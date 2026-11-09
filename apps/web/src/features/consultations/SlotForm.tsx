import { useState, type FormEvent } from "react";
import { SlotCreate } from "@roombook/shared";
import { kyivLocalToIso } from "../../lib/time";
import { Button } from "../../ui";

export interface SlotFormValues {
  startsAt: string;
  endsAt: string;
  seats: string;
  note: string;
}

export function SlotForm({ onCreate }: { onCreate: (s: SlotCreate) => void | Promise<void> }) {
  const [values, setValues] = useState<SlotFormValues>({
    startsAt: "",
    endsAt: "",
    seats: "1",
    note: "",
  });
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!values.startsAt) return setError("Вкажіть початок");
    if (Number(values.seats) > 10) return setError("Забагато місць");
    const res = SlotCreate.safeParse({
      startsAt: kyivLocalToIso(values.startsAt),
      endsAt: kyivLocalToIso(values.endsAt),
      seats: Number(values.seats),
      note: values.note || undefined,
    });
    if (!res.success)
      return setError(res.error.issues[0]?.message ?? "Invalid input");
    setError(null);
    void onCreate(res.data);
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      {error && <p className="form-error">{error}</p>}
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
      <label>Кількість місць</label>
      <input
        type="number"
        name="seats"
        value={values.seats}
        onChange={(e) => setValues({ ...values, seats: e.target.value })}
      />
      <label>Примітка</label>
      <input
        name="note"
        value={values.note}
        onChange={(e) => setValues({ ...values, note: e.target.value })}
      />
      <Button type="submit">Створити слот</Button>
    </form>
  );
}
