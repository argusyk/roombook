import { useCallback, useEffect, useState } from "react";
import { api } from "../../api";
import { formatKyiv } from "../../lib/time";
import { Button, Card, Tabs } from "../../ui";

export interface MyBooking {
  id: number;
  startsAt: string;
  endsAt: string;
  slot: {
    teacher: { name: string };
    room: { code: string } | null;
  } | null;
}

/** Скасувати запис можна не пізніше ніж за 2 години до початку. */
export const CANCEL_DEADLINE_MS = 2 * 60 * 60 * 1000;

export function canCancel(b: Pick<MyBooking, "startsAt">, now: Date): boolean {
  return Date.parse(b.startsAt) - now.getTime() >= CANCEL_DEADLINE_MS;
}

type Tab = "future" | "past";

export interface MyConsultationsProps {
  load?: () => Promise<MyBooking[]>;
  cancel?: (id: number) => Promise<void>;
  now?: () => Date;
}

const defaultLoad = () => api<MyBooking[]>("/me/bookings?kind=consultation");
const defaultCancel = (id: number) => api<void>(`/bookings/${id}`, { method: "DELETE" });

/** «Мої консультації» за макетом docs/mockups/my-consultations.png (розд. 8). */
export function MyConsultations({
  load = defaultLoad,
  cancel = defaultCancel,
  now = () => new Date(),
}: MyConsultationsProps) {
  const [items, setItems] = useState<MyBooking[] | null>(null);
  const [tab, setTab] = useState<Tab>("future");

  const refresh = useCallback(() => {
    load().then(setItems, () => setItems([]));
  }, [load]);
  useEffect(refresh, [refresh]);

  const t = now().getTime();
  const shown = (items ?? [])
    .filter((b) => (tab === "future" ? Date.parse(b.endsAt) > t : Date.parse(b.endsAt) <= t))
    .sort((a, b) =>
      tab === "future"
        ? Date.parse(a.startsAt) - Date.parse(b.startsAt)
        : Date.parse(b.startsAt) - Date.parse(a.startsAt),
    );

  async function onCancel(id: number) {
    await cancel(id);
    refresh();
  }

  return (
    <Card title="Мої консультації">
      <Tabs
        items={[
          { key: "future", label: "Майбутні" },
          { key: "past", label: "Минулі" },
        ]}
        value={tab}
        onChange={setTab}
      />
      {items !== null && shown.length === 0 && (
        <div className="empty-state" role="note">
          <img src="/empty-consultations.svg" alt="" width={120} height={90} />
          <p>{tab === "future" ? "Немає запланованих консультацій" : "Минулих консультацій немає"}</p>
        </div>
      )}
      <ul className="cards">
        {shown.map((b) => (
          <li key={b.id} className="card-row">
            <div>
              <strong>{b.slot?.teacher.name ?? "—"}</strong>
              <div>Аудиторія {b.slot?.room?.code ?? "онлайн"}</div>
            </div>
            <div>
              <span>{formatKyiv(b.startsAt, "dd.MM.yyyy")}</span>{" "}
              <span>
                {formatKyiv(b.startsAt, "HH:mm")}–{formatKyiv(b.endsAt, "HH:mm")}
              </span>
            </div>
            {tab === "future" && (
              <Button
                variant="secondary"
                disabled={!canCancel(b, now())}
                onClick={() => onCancel(b.id)}
              >
                Скасувати
              </Button>
            )}
          </li>
        ))}
      </ul>
    </Card>
  );
}
