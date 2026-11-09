import { describe, it, expect } from "vitest";
import { z } from "zod";
import { fieldErrors, firstInvalid } from "./fieldErrors";

const Schema = z.object({ a: z.string().min(2), b: z.number() });
const messages = { a: () => "поле a", b: () => "поле b" };

describe("lib/forms/fieldErrors", () => {
  it("бере текст з карти повідомлень", () => {
    const r = Schema.safeParse({ a: "x", b: "y" });
    expect(!r.success && fieldErrors(r.error, messages)).toEqual({ a: "поле a", b: "поле b" });
  });

  it("ігнорує поля, яких немає в карті", () => {
    const r = Schema.safeParse({ a: "x", b: 1 });
    expect(!r.success && fieldErrors(r.error, { b: () => "b" })).toEqual({});
  });

  it("firstInvalid повертає перше поле за порядком форми", () => {
    expect(firstInvalid(["a", "b"] as const, { b: "x" })).toBe("b");
    expect(firstInvalid(["a", "b"] as const, {})).toBeUndefined();
  });
});
