// Тонкий клієнт API. Vite проксіює /api/* на apps/api.
const TOKEN_KEY = "roombook.token";

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly body: { error?: string; message?: string; conflicts?: unknown[] },
  ) {
    super(body.message ?? `HTTP ${status}`);
  }
}

export function setToken(token: string | null): void {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  const token = getToken();
  if (token) headers.set("authorization", `Bearer ${token}`);
  if (init.body) headers.set("content-type", "application/json");
  const res = await fetch(`/api${path}`, { ...init, headers });
  if (res.status === 204) return undefined as T;
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, body);
  return body as T;
}

export interface Room {
  id: number;
  code: string;
  name: string;
  building: string;
  capacity: number;
  hasProjector: boolean;
}

export interface Slot {
  id: number;
  teacher: { id: number; name: string };
  room: { id: number; code: string } | null;
  startsAt: string;
  endsAt: string;
  seats: number;
  seatsLeft: number;
  note: string | null;
}
