import { describe, it, expect } from "vitest";
import { selectCancellable } from "../src/recurrence/service";

const b = (id: number, iso: string) => ({ id, startsAt: new Date(iso) });

describe("скасування решти серії", () => {
  const bookings = [
    b(1, "2027-03-09T12:00:00Z"),
    b(2, "2027-03-16T12:00:00Z"), // 14:00 за Києвом
    b(3, "2027-03-23T12:00:00Z"),
  ];

  it("не скасовує заняття, що вже почалося, але не закінчилося", () => {
    const now = new Date("2027-03-16T12:30:00Z"); // 14:30 за Києвом
    expect(selectCancellable(bookings, now).map((x) => x.id)).toEqual([3]);
  });

  it("не чіпає минулих занять", () => {
    const now = new Date("2027-03-10T00:00:00Z");
    expect(selectCancellable(bookings, now).map((x) => x.id)).toEqual([2, 3]);
  });

  it("from обмежує скасування місцевою датою", () => {
    const now = new Date("2027-03-01T00:00:00Z");
    expect(selectCancellable(bookings, now, "2027-03-16").map((x) => x.id)).toEqual([2, 3]);
  });
});
