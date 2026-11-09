import { describe, it, expect } from "vitest";
import {
  ConflictError,
  NotFoundError,
  ValidationError,
  isDomainError,
} from "../src/errors";

describe("доменні помилки", () => {
  it("ConflictError має статус 409 і список конфліктів", () => {
    const e = new ConflictError([{ id: 7 }]);
    expect(e.status).toBe(409);
    expect(e.toJSON()).toEqual({
      error: "CONFLICT",
      message: "Аудиторія зайнята на цей час",
      conflicts: [{ id: 7 }],
    });
  });

  it("NotFoundError має статус 404", () => {
    const e = new NotFoundError("Бронювання");
    expect(e.status).toBe(404);
    expect(e.message).toBe("Бронювання не знайдено");
  });

  it("ValidationError має статус 400 і перелік полів", () => {
    const e = new ValidationError([{ path: ["purpose"], message: "коротко" }]);
    expect(e.status).toBe(400);
    expect(e.toJSON().issues).toHaveLength(1);
  });

  it("isDomainError відрізняє доменні помилки від звичайних", () => {
    expect(isDomainError(new ConflictError())).toBe(true);
    expect(isDomainError(new Error("x"))).toBe(false);
  });
});
