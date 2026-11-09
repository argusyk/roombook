import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BookingForm } from "./BookingForm";

const rooms = [
  { id: 1, code: "A-314" },
  { id: 2, code: "A-214" },
];

function field(container: HTMLElement, name: string) {
  return container.querySelector(`[name="${name}"]`) as HTMLInputElement;
}

describe("BookingForm", () => {
  it("показує всі аудиторії у списку", () => {
    render(<BookingForm rooms={rooms} onCreate={vi.fn()} />);
    expect(screen.getByRole("option", { name: "A-314" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "A-214" })).toBeInTheDocument();
  });

  it("не надсилає форму без аудиторії", async () => {
    const onCreate = vi.fn();
    render(<BookingForm rooms={rooms} onCreate={onCreate} />);
    await userEvent.click(screen.getByRole("button", { name: "Забронювати" }));
    expect(onCreate).not.toHaveBeenCalled();
    expect(screen.getByText("Оберіть аудиторію")).toBeInTheDocument();
  });

  it("надсилає коректне бронювання в UTC", async () => {
    const onCreate = vi.fn();
    const { container } = render(<BookingForm rooms={rooms} onCreate={onCreate} />);
    await userEvent.selectOptions(field(container, "roomId"), "A-314");
    fireEvent.change(field(container, "startsAt"), { target: { value: "2026-11-12T14:00" } });
    fireEvent.change(field(container, "endsAt"), { target: { value: "2026-11-12T15:30" } });
    await userEvent.type(field(container, "purpose"), "Консультація з ІПЗ");
    await userEvent.click(screen.getByRole("button", { name: "Забронювати" }));
    expect(onCreate).toHaveBeenCalledWith({
      roomId: 1,
      startsAt: "2026-11-12T12:00:00.000Z",
      endsAt: "2026-11-12T13:30:00.000Z",
      purpose: "Консультація з ІПЗ",
    });
  });

  it("відхиляє кінець раніше за початок", async () => {
    const onCreate = vi.fn();
    const { container } = render(<BookingForm rooms={rooms} onCreate={onCreate} />);
    await userEvent.selectOptions(field(container, "roomId"), "A-314");
    fireEvent.change(field(container, "startsAt"), { target: { value: "2026-11-12T15:00" } });
    fireEvent.change(field(container, "endsAt"), { target: { value: "2026-11-12T14:00" } });
    await userEvent.type(field(container, "purpose"), "Консультація");
    await userEvent.click(screen.getByRole("button", { name: "Забронювати" }));
    expect(onCreate).not.toHaveBeenCalled();
  });

  it("підставляє початкові значення", () => {
    const { container } = render(
      <BookingForm rooms={rooms} onCreate={vi.fn()} initial={{ roomId: "2" }} />,
    );
    expect(field(container, "roomId").value).toBe("2");
  });
});
