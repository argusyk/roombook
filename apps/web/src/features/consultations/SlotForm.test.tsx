import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SlotCreate } from "@roombook/shared";
import { SlotForm } from "./SlotForm";

const set = (label: string, value: string) =>
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
const submit = () => userEvent.click(screen.getByRole("button", { name: "Створити слот" }));

describe("SlotForm", () => {
  it("створює слот із часом у UTC", async () => {
    const onCreate = vi.fn();
    render(<SlotForm onCreate={onCreate} />);
    set("Початок", "2026-11-12T09:00");
    set("Завершення", "2026-11-12T10:00");
    await submit();
    expect(onCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        startsAt: "2026-11-12T07:00:00.000Z",
        endsAt: "2026-11-12T08:00:00.000Z",
        seats: 1,
      }),
    );
  });

  it("без початку – помилка під полем і фокус на ньому", async () => {
    const onCreate = vi.fn();
    render(<SlotForm onCreate={onCreate} />);
    await submit();
    expect(onCreate).not.toHaveBeenCalled();
    const start = screen.getByLabelText("Початок");
    expect(start).toHaveAccessibleDescription("Вкажіть дату й час початку");
    expect(start).toHaveFocus();
  });

  it("кінець раніше за початок прив'язано до поля завершення", async () => {
    render(<SlotForm onCreate={vi.fn()} />);
    set("Початок", "2026-11-12T10:00");
    set("Завершення", "2026-11-12T09:00");
    await submit();
    expect(screen.getByLabelText("Завершення")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText("Завершення")).toHaveFocus();
  });

  it("12 місць дозволено: межу задає схема (до 30), а не форма", async () => {
    const onCreate = vi.fn();
    render(<SlotForm onCreate={onCreate} />);
    set("Початок", "2026-11-12T09:00");
    set("Завершення", "2026-11-12T10:00");
    set("Кількість місць", "12");
    await submit();
    expect(onCreate).toHaveBeenCalledWith(expect.objectContaining({ seats: 12 }));
  });

  it("межі в тексті про місця збігаються зі схемою", async () => {
    const seats = SlotCreate.innerType().shape.seats.removeDefault();
    expect(seats.minValue).toBe(1);
    expect(seats.maxValue).toBe(30);
    render(<SlotForm onCreate={vi.fn()} />);
    set("Початок", "2026-11-12T09:00");
    set("Завершення", "2026-11-12T10:00");
    set("Кількість місць", "31");
    await submit();
    expect(screen.getByLabelText("Кількість місць")).toHaveAccessibleDescription(
      "Кількість місць: від 1 до 30",
    );
  });
});
