import { useState } from "react";
import { JoinWaitlistResponse, waitlistRoutes } from "@roombook/shared";
import { api, ApiError } from "../../../api";
import { Button } from "../../../ui";

const path = (slotId: number) => waitlistRoutes.join.path.replace(":slotId", String(slotId));

export const defaultJoin = async (slotId: number) =>
  JoinWaitlistResponse.parse(await api(path(slotId), { method: "POST" }));
export const defaultLeave = (slotId: number) => api<void>(path(slotId), { method: "DELETE" });

/** Кнопка листа очікування для слота без вільних місць (розд. 14). */
export function WaitlistButton({
  slotId,
  join = defaultJoin,
  leave = defaultLeave,
}: {
  slotId: number;
  join?: (slotId: number) => Promise<JoinWaitlistResponse>;
  leave?: (slotId: number) => Promise<void>;
}) {
  const [ahead, setAhead] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function onJoin() {
    setBusy(true);
    setMessage("");
    try {
      const res = await join(slotId); // статус показуємо лише після відповіді сервера
      setAhead(res.ahead);
    } catch (e) {
      if (e instanceof ApiError && e.status === waitlistRoutes.join.hasSeats) {
        setMessage("У слоті є вільні місця – запишіться напряму");
      } else if (e instanceof ApiError && e.status === waitlistRoutes.join.conflict) {
        setMessage("Ви вже записані або вже в листі очікування");
      } else {
        setMessage("Не вдалося стати в лист очікування");
      }
    } finally {
      setBusy(false);
    }
  }

  async function onLeave() {
    setBusy(true);
    try {
      await leave(slotId);
      setAhead(null);
    } finally {
      setBusy(false);
    }
  }

  return (
    <span className="waitlist">
      {ahead === null ? (
        <Button variant="secondary" disabled={busy} onClick={onJoin}>
          Стати в лист очікування
        </Button>
      ) : (
        <>
          <span role="status">Ви в листі очікування, попереду: {ahead}</span>
          <Button variant="secondary" disabled={busy} onClick={onLeave}>
            Вийти з листа
          </Button>
        </>
      )}
      {message && <span className="form-error">{message}</span>}
    </span>
  );
}
