import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BookingForm } from "./BookingForm";

const roomA214 = { id: 2, code: "A-214" };
const rooms = [{ id: 1, code: "A-314" }, roomA214];

async function fill(
  user: ReturnType<typeof userEvent.setup>,
  { room = "A-314", from = "2026-11-12T14:00", to = "2026-11-12T15:30", purpose = "Консультація з ІПЗ" } = {},
) {
  if (room) await user.selectOptions(screen.getByLabelText("Аудиторія"), room);
  fireEvent.change(screen.getByLabelText("Початок"), { target: { value: from } });
  fireEvent.change(screen.getByLabelText("Завершення"), { target: { value: to } });
  if (purpose) await user.type(screen.getByLabelText("Мета бронювання"), purpose);
}

const submit = (user: ReturnType<typeof userEvent.setup>) =>
  user.click(screen.getByRole("button", { name: "Забронювати" }));

describe("BookingForm", () => {
  it("показує всі аудиторії у списку", () => {
    render(<BookingForm rooms={rooms} onCreate={vi.fn()} />);
    expect(screen.getByRole("option", { name: "A-314" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "A-214" })).toBeInTheDocument();
  });

  it("надсилає коректне бронювання в UTC", async () => {
    const user = userEvent.setup();
    const onCreate = vi.fn();
    render(<BookingForm rooms={rooms} onCreate={onCreate} />);
    await fill(user);
    await submit(user);
    expect(onCreate).toHaveBeenCalledWith({
      roomId: 1,
      startsAt: "2026-11-12T12:00:00.000Z",
      endsAt: "2026-11-12T13:30:00.000Z",
      purpose: "Консультація з ІПЗ",
    });
  });

  it("прив'язує помилку часу до поля завершення і фокусує його", async () => {
    const user = userEvent.setup();
    render(<BookingForm rooms={[roomA214]} onCreate={vi.fn()} />);
    await user.selectOptions(screen.getByLabelText("Аудиторія"), "A-214");
    fireEvent.change(screen.getByLabelText("Початок"), {
      target: { value: "2026-11-12T15:00" },
    });
    fireEvent.change(screen.getByLabelText("Завершення"), {
      target: { value: "2026-11-12T14:00" },
    });
    await user.type(screen.getByLabelText("Мета бронювання"), "Лаб");
    await user.click(screen.getByRole("button", { name: "Забронювати" }));

    const end = screen.getByLabelText("Завершення");
    expect(end).toHaveAttribute("aria-invalid", "true");
    expect(end).toHaveAccessibleDescription(
      "Кінець бронювання має бути пізніше за початок",
    );
    expect(end).toHaveFocus();
    expect(
      screen.queryByText("Мета бронювання: щонайменше 3 символи"),
    ).toBeNull();
  });

  it("мета з трьох символів приймається, як і в API", async () => {
    const user = userEvent.setup();
    const onCreate = vi.fn();
    render(<BookingForm rooms={rooms} onCreate={onCreate} />);
    await fill(user, { purpose: "Лаб" });
    await submit(user);
    expect(onCreate).toHaveBeenCalledOnce();
  });

  it("коротка мета – помилка під полем українською", async () => {
    const user = userEvent.setup();
    render(<BookingForm rooms={rooms} onCreate={vi.fn()} />);
    await fill(user, { purpose: "Ла" });
    await submit(user);
    expect(screen.getByLabelText("Мета бронювання")).toHaveAccessibleDescription(
      "Мета бронювання: щонайменше 3 символи",
    );
  });

  it("без аудиторії фокус на першому полі з помилкою", async () => {
    const user = userEvent.setup();
    const onCreate = vi.fn();
    render(<BookingForm rooms={rooms} onCreate={onCreate} />);
    await fill(user, { room: "" });
    await submit(user);
    expect(onCreate).not.toHaveBeenCalled();
    expect(screen.getByLabelText("Аудиторія")).toHaveFocus();
    expect(screen.getByText("Оберіть аудиторію")).toBeInTheDocument();
  });

  it("усі помилки показано під своїми полями, без англійських текстів zod", async () => {
    const user = userEvent.setup();
    render(<BookingForm rooms={rooms} onCreate={vi.fn()} />);
    await submit(user);
    expect(screen.getByText("Вкажіть дату й час початку")).toBeInTheDocument();
    expect(screen.queryByText(/Invalid/)).toBeNull();
  });

  it("повідомлення полів не мають role=alert", async () => {
    const user = userEvent.setup();
    render(<BookingForm rooms={rooms} onCreate={vi.fn()} />);
    await submit(user);
    expect(screen.queryAllByRole("alert")).toHaveLength(0);
  });

  it("виправлене поле більше не позначене як помилкове", async () => {
    const user = userEvent.setup();
    const onCreate = vi.fn();
    render(<BookingForm rooms={rooms} onCreate={onCreate} />);
    await fill(user, { room: "" });
    await submit(user);
    await user.selectOptions(screen.getByLabelText("Аудиторія"), "A-314");
    await submit(user);
    expect(screen.getByLabelText("Аудиторія")).not.toHaveAttribute("aria-invalid");
    expect(onCreate).toHaveBeenCalledOnce();
  });
});
