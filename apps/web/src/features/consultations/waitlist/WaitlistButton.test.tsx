import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ApiError } from "../../../api";
import { WaitlistButton } from "./WaitlistButton";

const entry = { id: 1, slotId: 3, userId: 5, position: 2, status: "waiting" as const, createdAt: "2026-11-09T10:00:00.000Z" };
const joinBtn = () => screen.getByRole("button", { name: "Стати в лист очікування" });

describe("WaitlistButton", () => {
  it("після відповіді сервера показує, скільки людей попереду", async () => {
    render(<WaitlistButton slotId={3} join={vi.fn().mockResolvedValue({ entry, ahead: 1 })} />);
    await userEvent.click(joinBtn());
    expect(await screen.findByRole("status")).toHaveTextContent("попереду: 1");
  });

  it("не показує «Ви в листі очікування» до відповіді сервера", async () => {
    let resolve!: (v: { entry: typeof entry; ahead: number }) => void;
    const join = vi.fn(() => new Promise<{ entry: typeof entry; ahead: number }>((r) => { resolve = r; }));
    render(<WaitlistButton slotId={3} join={join} />);
    await userEvent.click(joinBtn());
    expect(screen.queryByRole("status")).toBeNull();
    expect(joinBtn()).toBeDisabled();
    resolve({ entry, ahead: 0 });
    expect(await screen.findByRole("status")).toHaveTextContent("попереду: 0");
  });

  it("409 – повідомлення про повторний запис", async () => {
    const join = vi.fn().mockRejectedValue(new ApiError(409, {}));
    render(<WaitlistButton slotId={3} join={join} />);
    await userEvent.click(joinBtn());
    expect(await screen.findByText("Ви вже записані або вже в листі очікування")).toBeInTheDocument();
  });

  it("422 hasSeats – підказка записатися напряму", async () => {
    const join = vi.fn().mockRejectedValue(new ApiError(422, { error: "UNPROCESSABLE" }));
    render(<WaitlistButton slotId={3} join={join} />);
    await userEvent.click(joinBtn());
    expect(await screen.findByText(/є вільні місця/)).toBeInTheDocument();
  });

  it("вихід з листа повертає кнопку", async () => {
    const leave = vi.fn().mockResolvedValue(undefined);
    render(<WaitlistButton slotId={3} join={vi.fn().mockResolvedValue({ entry, ahead: 0 })} leave={leave} />);
    await userEvent.click(joinBtn());
    await userEvent.click(await screen.findByRole("button", { name: "Вийти з листа" }));
    expect(leave).toHaveBeenCalledWith(3);
    expect(joinBtn()).toBeInTheDocument();
  });

  it("викликає join з id слота", async () => {
    const join = vi.fn().mockResolvedValue({ entry, ahead: 0 });
    render(<WaitlistButton slotId={42} join={join} />);
    await userEvent.click(joinBtn());
    expect(join).toHaveBeenCalledWith(42);
  });
});
