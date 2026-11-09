// Навчальна автентифікація RoomBook.
// У розробці й тестах вхід виконує POST /auth/dev-login, який повертає токен
// виду "dev-<userId>". Справжній вхід (SSO університету) – поза межами
// навчального прикладу, тож у production такі токени не приймаються.

export const DEV_TOKEN_PREFIX = "dev-";

export function devToken(userId: number): string {
  return `${DEV_TOKEN_PREFIX}${userId}`;
}

type Headers = Record<string, string | string[] | undefined>;

/** Ідентифікатор користувача з заголовків або null. */
export function userIdFromHeaders(headers: Headers): number | null {
  const auth = headers["authorization"];
  const bearer = typeof auth === "string" ? auth.match(/^Bearer\s+(\S+)$/i) : null;
  const token = bearer?.[1];
  if (token?.startsWith(DEV_TOKEN_PREFIX)) {
    return toId(token.slice(DEV_TOKEN_PREFIX.length));
  }
  // x-test-user – для навантажувальних скриптів (розд. 12)
  const testUser = headers["x-test-user"];
  if (typeof testUser === "string") return toId(testUser);
  return null;
}

function toId(raw: string): number | null {
  if (!/^\d{1,9}$/.test(raw)) return null;
  const id = Number(raw);
  return id > 0 ? id : null;
}
