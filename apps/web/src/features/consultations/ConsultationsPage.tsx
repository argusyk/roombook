import { useCallback, useEffect, useState } from "react";
import type { SlotCreate } from "@roombook/shared";
import { api, type Slot } from "../../api";
import { formatKyiv } from "../../lib/time";
import { Button, Card } from "../../ui";
import { SlotForm } from "./SlotForm";

export function ConsultationsPage({ canCreate }: { canCreate: boolean }) {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [message, setMessage] = useState("");

  const load = useCallback(() => {
    api<Slot[]>(`/slots?from=${new Date().toISOString()}`).then(setSlots, () => setSlots([]));
  }, []);
  useEffect(load, [load]);

  async function book(slot: Slot) {
    try {
      await api(`/slots/${slot.id}/bookings`, {
        method: "POST",
        body: JSON.stringify({ purpose: "Консультація" }),
      });
      setMessage("Ви записалися на консультацію");
      load();
    } catch {
      setMessage("Записатися не вдалося");
    }
  }

  async function create(s: SlotCreate) {
    await api("/slots", { method: "POST", body: JSON.stringify(s) });
    load();
  }

  return (
    <>
      <Card title="Консультації">
        <ul>
          {slots.map((s) => (
            <li key={s.id}>
              {formatKyiv(s.startsAt)} · {s.teacher.name} · {s.room?.code ?? "онлайн"} · вільно{" "}
              {s.seatsLeft}
              {s.seatsLeft > 0 && <Button onClick={() => book(s)}>Записатися</Button>}
            </li>
          ))}
        </ul>
        <p role="status">{message}</p>
      </Card>
      {canCreate && (
        <Card title="Новий слот">
          <SlotForm onCreate={create} />
        </Card>
      )}
    </>
  );
}
