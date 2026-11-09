import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatsPage, currentWeek } from "./StatsPage";

describe("StatsPage", () => {
  it("показує відсоток з API без власного перерахунку (23 з 40 → 58)", async () => {
    const load = vi.fn().mockResolvedValue([
      { roomId: 1, code: "A-314", name: "Лабораторія", pairs: 23, percent: 58 },
    ]);
    render(<StatsPage load={load} initial={{ from: "2026-11-02", to: "2026-11-09" }} />);
    expect(await screen.findByText("58")).toBeInTheDocument();
    expect(load).toHaveBeenCalledWith("2026-11-02", "2026-11-09");
  });

  it("поточний тиждень – з понеділка до наступного понеділка", () => {
    expect(currentWeek(new Date("2026-11-12T10:00:00Z"))).toEqual({
      from: "2026-11-09",
      to: "2026-11-16",
    });
  });
});
