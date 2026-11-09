import { describe, it, expect } from "vitest";
import { toPayload } from "./toPayload";

const base = { roomId: "1", startsAt: "", endsAt: "", purpose: "" };

describe("toPayload", () => {
  it("перетворює roomId на число", () => {
    expect(toPayload({ ...base, roomId: "3" }).roomId).toBe(3);
  });

  it("порожній roomId → undefined", () => {
    expect(toPayload({ ...base, roomId: "" }).roomId).toBeUndefined();
  });

  it("київський час узимку → UTC−2 год", () => {
    expect(toPayload({ ...base, startsAt: "2026-11-12T14:00" }).startsAt).toBe(
      "2026-11-12T12:00:00.000Z",
    );
  });

  it("київський час улітку → UTC−3 год", () => {
    expect(toPayload({ ...base, startsAt: "2027-06-01T14:00" }).startsAt).toBe(
      "2027-06-01T11:00:00.000Z",
    );
  });

  it("порожній час → порожній рядок (його відхилить схема)", () => {
    expect(toPayload(base).endsAt).toBe("");
  });

  it("обрізає пробіли в меті", () => {
    expect(toPayload({ ...base, purpose: "  Лаб  " }).purpose).toBe("Лаб");
  });
});
