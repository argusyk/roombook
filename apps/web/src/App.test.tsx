import { describe, it, expect } from "vitest";
import { route } from "./App";
import { occupancyPercent } from "./features/rooms/RoomsPage";

describe("маршрути", () => {
  it("/ – сторінка аудиторій", () => {
    expect(route("/", "?date=2026-11-09")).toEqual({ page: "rooms", date: "2026-11-09" });
  });

  it("/rooms/1/book – бронювання аудиторії на дату", () => {
    expect(route("/rooms/1/book", "?date=2027-03-16")).toEqual({
      page: "book",
      roomId: 1,
      date: "2027-03-16",
    });
  });

  it("/consultations – консультації", () => {
    expect(route("/consultations", "").page).toBe("consultations");
  });
});

describe("зайнятість аудиторії", () => {
  it("усі пари вільні – 0 %", () => {
    expect(occupancyPercent(8)).toBe(0);
  });

  it("дві пари з восьми зайняті – 25 %", () => {
    expect(occupancyPercent(6)).toBe(25);
  });
});
