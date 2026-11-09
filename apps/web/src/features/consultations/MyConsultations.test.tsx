import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MyConsultations, canCancel, type MyBooking } from "./MyConsultations";

const now = () => new Date("2026-11-12T06:00:00Z"); // 08:00 за Києвом

const booking = (id: number, startsAt: string, endsAt: string, teacher = "Викладач 1"): MyBooking => ({
  id,
  startsAt,
  endsAt,
  slot: { teacher: { name: teacher }, room: { code: "B-214" } },
});

const items = [
  booking(2, "2026-11-13T12:40:00Z", "2026-11-13T13:40:00Z", "Викладач 2"),
  booking(1, "2026-11-12T08:00:00Z", "2026-11-12T09:00:00Z"), // через 2 год – ще можна
  booking(3, "2026-11-12T07:00:00Z", "2026-11-12T07:30:00Z", "Викладач 3"), // через 1 год
  booking(4, "2026-11-01T08:00:00Z", "2026-11-01T09:00:00Z", "Викладач 4"), // минула
];

const setup = (cancel = vi.fn().mockResolvedValue(undefined)) =>
  render(<MyConsultations load={() => Promise.resolve(items)} cancel={cancel} now={now} />);

describe("MyConsultations", () => {
  it("найближчі консультації зверху", async () => {
    setup();
    const names = (await screen.findAllByRole("listitem")).map((li) => li.querySelector("strong")?.textContent);
    expect(names).toEqual(["Викладач 3", "Викладач 1", "Викладач 2"]);
  });

  it("показує час у Europe/Kyiv", async () => {
    setup();
    expect(await screen.findByText("10:00–11:00")).toBeInTheDocument();
  });

  it("кнопка «Скасувати» неактивна, якщо до початку менше 2 годин", async () => {
    setup();
    const buttons = await screen.findAllByRole("button", { name: "Скасувати" });
    expect(buttons.map((b) => (b as HTMLButtonElement).disabled)).toEqual([true, false, false]);
  });

  it("скасування викликає DELETE і перезавантажує список", async () => {
    const cancel = vi.fn().mockResolvedValue(undefined);
    setup(cancel);
    const buttons = await screen.findAllByRole("button", { name: "Скасувати" });
    await userEvent.click(buttons[1]!);
    expect(cancel).toHaveBeenCalledWith(1);
  });

  it("вкладка «Минулі» показує минулі консультації", async () => {
    setup();
    await userEvent.click(await screen.findByRole("tab", { name: "Минулі" }));
    expect(screen.getByText("Викладач 4")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Скасувати" })).toBeNull();
  });

  it("порожній стан", async () => {
    render(<MyConsultations load={() => Promise.resolve([])} now={now} />);
    expect(await screen.findByText("Немає запланованих консультацій")).toBeInTheDocument();
  });
});

describe("canCancel", () => {
  it("рівно за 2 години – ще можна", () => {
    expect(canCancel({ startsAt: "2026-11-12T08:00:00Z" }, now())).toBe(true);
  });
});
