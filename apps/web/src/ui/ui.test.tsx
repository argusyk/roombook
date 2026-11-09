import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button, Card, Tabs } from "./index";

describe("ui", () => {
  it("Button за замовчуванням має type=button", () => {
    render(<Button>Гаразд</Button>);
    expect(screen.getByRole("button", { name: "Гаразд" })).toHaveAttribute("type", "button");
  });

  it("Card показує заголовок", () => {
    render(<Card title="Консультації">вміст</Card>);
    expect(screen.getByRole("heading", { name: "Консультації" })).toBeInTheDocument();
  });

  it("Tabs позначає активну вкладку", () => {
    render(
      <Tabs
        items={[
          { key: "future", label: "Майбутні" },
          { key: "past", label: "Минулі" },
        ]}
        value="future"
        onChange={vi.fn()}
      />,
    );
    expect(screen.getByRole("tab", { name: "Майбутні" })).toHaveAttribute("aria-selected", "true");
  });

  it("Tabs повідомляє про вибір", async () => {
    const onChange = vi.fn();
    render(
      <Tabs
        items={[
          { key: "future", label: "Майбутні" },
          { key: "past", label: "Минулі" },
        ]}
        value="future"
        onChange={onChange}
      />,
    );
    await userEvent.click(screen.getByRole("tab", { name: "Минулі" }));
    expect(onChange).toHaveBeenCalledWith("past");
  });
});
