import { describe, it, expect } from "vitest";
import {
  BookingCreate,
  SlotCreate,
  SlotBookingCreate,
  AvailabilityQuery,
  IdParam,
  DevLogin,
  BookingSeriesCreate,
} from "../src/booking";

const valid = {
  roomId: 1,
  startsAt: "2026-11-12T12:00:00.000Z",
  endsAt: "2026-11-12T13:30:00.000Z",
  purpose: "Консультація з ІПЗ",
};

describe("BookingCreate", () => {
  it("приймає коректне бронювання", () => {
    expect(BookingCreate.safeParse(valid).success).toBe(true);
  });

  it("приймає мету з трьох символів", () => {
    const r = BookingCreate.safeParse({ ...valid, purpose: "Лаб" });
    expect(r.success).toBe(true);
  });

  it("відхиляє мету коротшу за 3 символи", () => {
    const r = BookingCreate.safeParse({ ...valid, purpose: "Ла" });
    expect(r.success).toBe(false);
  });

  it("відхиляє мету довшу за 500 символів", () => {
    const r = BookingCreate.safeParse({ ...valid, purpose: "x".repeat(501) });
    expect(r.success).toBe(false);
  });

  it("відхиляє нецілий roomId", () => {
    expect(BookingCreate.safeParse({ ...valid, roomId: 1.5 }).success).toBe(false);
  });

  it("відхиляє недодатний roomId", () => {
    expect(BookingCreate.safeParse({ ...valid, roomId: 0 }).success).toBe(false);
  });

  it("відхиляє код аудиторії замість id", () => {
    const r = BookingCreate.safeParse({ ...valid, roomId: "A-314" });
    expect(r.success).toBe(false);
  });

  it("відхиляє дату без позначки часового поясу", () => {
    const r = BookingCreate.safeParse({ ...valid, startsAt: "2026-11-12T12:00" });
    expect(r.success).toBe(false);
  });

  it("відхиляє кінець раніше за початок", () => {
    const r = BookingCreate.safeParse({
      ...valid,
      startsAt: valid.endsAt,
      endsAt: valid.startsAt,
    });
    expect(r.success).toBe(false);
  });

  it("відхиляє нульову тривалість", () => {
    const r = BookingCreate.safeParse({ ...valid, endsAt: valid.startsAt });
    expect(r.success).toBe(false);
  });

  it("порівнює моменти, а не рядки, за різної точності секунд", () => {
    const r = BookingCreate.safeParse({
      ...valid,
      startsAt: "2026-11-12T12:00:00.5Z",
      endsAt: "2026-11-12T12:00:01Z",
    });
    expect(r.success).toBe(true);
  });

  it("повідомлення про порядок часу українською", () => {
    const r = BookingCreate.safeParse({ ...valid, endsAt: valid.startsAt });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.issues[0]?.message).toBe(
        "Кінець бронювання має бути пізніше за початок",
      );
    }
  });
});

describe("SlotCreate", () => {
  const slot = {
    startsAt: "2026-11-12T08:00:00.000Z",
    endsAt: "2026-11-12T09:00:00.000Z",
  };

  it("ставить одне місце за замовчуванням", () => {
    expect(SlotCreate.parse(slot).seats).toBe(1);
  });

  it("аудиторія необов'язкова", () => {
    expect(SlotCreate.safeParse(slot).success).toBe(true);
    expect(SlotCreate.safeParse({ ...slot, roomId: 3 }).success).toBe(true);
  });

  it("відхиляє нуль місць", () => {
    expect(SlotCreate.safeParse({ ...slot, seats: 0 }).success).toBe(false);
  });

  it("відхиляє понад 30 місць", () => {
    expect(SlotCreate.safeParse({ ...slot, seats: 31 }).success).toBe(false);
  });

  it("відхиляє кінець раніше за початок", () => {
    const r = SlotCreate.safeParse({ startsAt: slot.endsAt, endsAt: slot.startsAt });
    expect(r.success).toBe(false);
  });
});

describe("інші схеми", () => {
  it("SlotBookingCreate вимагає мету", () => {
    expect(SlotBookingCreate.safeParse({}).success).toBe(false);
    expect(SlotBookingCreate.safeParse({ purpose: "Курсова" }).success).toBe(true);
  });

  it("AvailabilityQuery приймає лише YYYY-MM-DD", () => {
    expect(AvailabilityQuery.safeParse({ date: "2026-11-09" }).success).toBe(true);
    expect(AvailabilityQuery.safeParse({ date: "09.11.2026" }).success).toBe(false);
  });

  it("IdParam перетворює рядок на ціле", () => {
    expect(IdParam.parse({ id: "42" }).id).toBe(42);
    expect(IdParam.safeParse({ id: "abc" }).success).toBe(false);
  });

  it("DevLogin вимагає email", () => {
    expect(DevLogin.safeParse({ email: "admin@roombook.test" }).success).toBe(true);
    expect(DevLogin.safeParse({ email: "admin" }).success).toBe(false);
  });
});

describe("BookingSeriesCreate", () => {
  it("підставляє інтервал 1 тиждень, порожні виключення і Europe/Kyiv", () => {
    const r = BookingSeriesCreate.parse({
      roomId: 1,
      purpose: "Консультація",
      startLocal: "2027-02-02T14:00",
      durationMin: 90,
      untilLocalDate: "2027-05-25",
    });
    expect(r).toMatchObject({ intervalWeeks: 1, exdates: [], timeZone: "Europe/Kyiv" });
  });
});
