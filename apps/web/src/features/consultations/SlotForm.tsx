import { useState, type FormEvent } from "react";
import { SlotCreate } from "@roombook/shared";
import { fieldErrors, firstInvalid, type FieldErrors, type MessageMap } from "../../lib/forms/fieldErrors";
import { kyivLocalToIso } from "../../lib/time";
import { Button } from "../../ui";

export interface SlotFormValues {
  startsAt: string;
  endsAt: string;
  seats: string;
  note: string;
}

type SlotField = "startsAt" | "endsAt" | "seats" | "note";

/** Тексти помилок форми слота. Межі (1–30 місць, 500 символів) – зі схеми SlotCreate. */
export const SLOT_MESSAGES: MessageMap<SlotField> = {
  startsAt: () => "Вкажіть дату й час початку",
  endsAt: (i) => (i.code === "custom" ? i.message : "Вкажіть дату й час завершення"),
  seats: () => "Кількість місць: від 1 до 30",
  note: () => "Примітка: не більше 500 символів",
};

const FIELD_ORDER: SlotField[] = ["startsAt", "endsAt", "seats", "note"];
const LABELS: Record<SlotField, string> = {
  startsAt: "Початок",
  endsAt: "Завершення",
  seats: "Кількість місць",
  note: "Примітка",
};

export function SlotForm({ onCreate }: { onCreate: (s: SlotCreate) => void | Promise<void> }) {
  const [values, setValues] = useState<SlotFormValues>({
    startsAt: "",
    endsAt: "",
    seats: "1",
    note: "",
  });
  const [errors, setErrors] = useState<FieldErrors<SlotField>>({});

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const parsed = SlotCreate.safeParse({
      startsAt: kyivLocalToIso(values.startsAt),
      endsAt: kyivLocalToIso(values.endsAt),
      seats: Number(values.seats),
      note: values.note || undefined,
    });
    if (!parsed.success) {
      const next = fieldErrors(parsed.error, SLOT_MESSAGES);
      setErrors(next);
      const first = firstInvalid(FIELD_ORDER, next);
      if (first) document.getElementById(`slot-${first}`)?.focus();
      return;
    }
    setErrors({});
    void onCreate(parsed.data);
  }

  const field = (f: SlotField, type: string) => (
    <>
      <label htmlFor={`slot-${f}`}>{LABELS[f]}</label>
      <input
        id={`slot-${f}`}
        name={f}
        type={type}
        value={values[f]}
        onChange={(e) => setValues({ ...values, [f]: e.target.value })}
        aria-invalid={errors[f] ? true : undefined}
        aria-describedby={errors[f] ? `slot-${f}-error` : undefined}
      />
      {errors[f] && (
        <p id={`slot-${f}-error`} className="field-error">{errors[f]}</p>
      )}
    </>
  );

  return (
    <form onSubmit={onSubmit} noValidate>
      {field("startsAt", "datetime-local")}
      {field("endsAt", "datetime-local")}
      {field("seats", "number")}
      {field("note", "text")}
      <Button type="submit">Створити слот</Button>
    </form>
  );
}
