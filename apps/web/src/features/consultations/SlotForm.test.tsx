import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SlotForm } from "./SlotForm";

const field = (c: HTMLElement, name: string) =>
  c.querySelector(`[name="${name}"]`) as HTMLInputElement;

describe("SlotForm", () => {
  it("створює слот із часом у UTC", async () => {
    const onCreate = vi.fn();
    const { container } = render(<SlotForm onCreate={onCreate} />);
    fireEvent.change(field(container, "startsAt"), { target: { value: "2026-11-12T09:00" } });
    fireEvent.change(field(container, "endsAt"), { target: { value: "2026-11-12T10:00" } });
    await userEvent.click(screen.getByRole("button", { name: "Створити слот" }));
    expect(onCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        startsAt: "2026-11-12T07:00:00.000Z",
        endsAt: "2026-11-12T08:00:00.000Z",
        seats: 1,
      }),
    );
  });

  it("без початку не надсилає", async () => {
    const onCreate = vi.fn();
    render(<SlotForm onCreate={onCreate} />);
    await userEvent.click(screen.getByRole("button", { name: "Створити слот" }));
    expect(onCreate).not.toHaveBeenCalled();
  });
});
