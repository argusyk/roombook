// Доменні помилки RoomBook. Їх кидають сервіси apps/api, а обробник
// помилок Fastify перетворює на HTTP-відповіді. Рядки не кидаємо.

export abstract class DomainError extends Error {
  abstract readonly status: number;
  abstract readonly code: string;

  toJSON(): Record<string, unknown> {
    return { error: this.code, message: this.message };
  }
}

/** Перетин бронювань, немає місць, повторний запис тощо (409). */
export class ConflictError extends DomainError {
  readonly status = 409;
  readonly code: string = "CONFLICT";

  constructor(
    readonly conflicts: readonly unknown[] = [],
    message = "Аудиторія зайнята на цей час",
  ) {
    super(message);
    this.name = "ConflictError";
  }

  override toJSON() {
    return { ...super.toJSON(), conflicts: this.conflicts };
  }
}

export class NotFoundError extends DomainError {
  readonly status = 404;
  readonly code = "NOT_FOUND";

  constructor(what = "Ресурс") {
    super(`${what} не знайдено`);
    this.name = "NotFoundError";
  }
}

export interface ValidationIssue {
  path: (string | number)[];
  message: string;
}

export class ValidationError extends DomainError {
  readonly status = 400;
  readonly code = "VALIDATION";

  constructor(
    readonly issues: readonly ValidationIssue[] = [],
    message = "Некоректні дані запиту",
  ) {
    super(message);
    this.name = "ValidationError";
  }

  override toJSON() {
    return { ...super.toJSON(), issues: this.issues };
  }
}

export class ForbiddenError extends DomainError {
  readonly status = 403;
  readonly code = "FORBIDDEN";

  constructor(message = "Недостатньо прав") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export class UnauthorizedError extends DomainError {
  readonly status = 401;
  readonly code = "UNAUTHORIZED";

  constructor(message = "Потрібен вхід") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export function isDomainError(e: unknown): e is DomainError {
  return e instanceof DomainError;
}
