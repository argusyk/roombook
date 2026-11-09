import { useState } from "react";
import { api, getToken, setToken } from "./api";
import { BookRoomPage } from "./features/booking/BookRoomPage";
import { ConsultationsPage } from "./features/consultations/ConsultationsPage";
import { RoomsPage } from "./features/rooms/RoomsPage";

const today = () => new Date().toISOString().slice(0, 10);

/** Мінімальний маршрутизатор за location.pathname (без залежностей). */
export function route(pathname: string, search: string) {
  const params = new URLSearchParams(search);
  const book = pathname.match(/^\/rooms\/(\d+)\/book$/);
  if (book) return { page: "book" as const, roomId: Number(book[1]), date: params.get("date") ?? today() };
  if (pathname === "/consultations") return { page: "consultations" as const };
  return { page: "rooms" as const, date: params.get("date") ?? today() };
}

function DevLogin() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<string | null>(null);
  async function login() {
    const r = await api<{ token: string; user: { role: string } }>("/auth/dev-login", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
    setToken(r.token);
    setRole(r.user.role);
  }
  return (
    <div className="dev-login">
      <input aria-label="Email для входу" value={email} onChange={(e) => setEmail(e.target.value)} />
      <button type="button" onClick={login}>
        Увійти (dev)
      </button>
      {getToken() && <span>увійшли{role ? ` як ${role}` : ""}</span>}
    </div>
  );
}

export function App() {
  const r = route(window.location.pathname, window.location.search);
  return (
    <main>
      <header>
        <a href="/">RoomBook</a> · <a href="/consultations">Консультації</a>
        <DevLogin />
      </header>
      {r.page === "book" && <BookRoomPage roomId={r.roomId} date={r.date} />}
      {r.page === "consultations" && <ConsultationsPage canCreate />}
      {r.page === "rooms" && <RoomsPage date={r.date} />}
    </main>
  );
}
