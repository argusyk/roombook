import { describe, it, expect } from "vitest";
import { dueWindow, reminderMessage } from "../src/reminders/service";
import { InMemoryMailer } from "../src/mail/memory";
import { LogMailer } from "../src/mail";

const slot = (iso: string) => ({
  startsAt: new Date(iso),
  teacher: { name: "Викладач 1" },
  room: { code: "B-214" },
});

describe("нагадування", () => {
  it("вікно – наступна година", () => {
    const { from, to } = dueWindow(new Date("2026-11-12T07:00:00Z"));
    expect(to.getTime() - from.getTime()).toBe(3_600_000);
  });

  it("лист показує київський час (зимовий, UTC+2)", () => {
    const m = reminderMessage("student01@roombook.test", slot("2026-11-12T08:00:00Z"));
    expect(m.subject).toBe("Консультація о 10:00");
    expect(m.text).toContain("12.11.2026 о 10:00 (аудиторія B-214)");
  });

  it("тиждень переходу на зимовий час: 26.10.2026 09:00 за Києвом = 07:00 UTC", () => {
    const m = reminderMessage("s@roombook.test", slot("2026-10-26T07:00:00Z"));
    expect(m.subject).toBe("Консультація о 09:00");
  });

  it("до переходу (23.10.2026) Київ = UTC+3", () => {
    const m = reminderMessage("s@roombook.test", slot("2026-10-23T06:00:00Z"));
    expect(m.subject).toBe("Консультація о 09:00");
  });

  it("онлайн-консультація без аудиторії", () => {
    const m = reminderMessage("s@roombook.test", { ...slot("2026-11-12T08:00:00Z"), room: null });
    expect(m.text).toContain("(онлайн)");
  });

  it("InMemoryMailer накопичує листи, LogMailer пише в журнал", async () => {
    const mem = new InMemoryMailer();
    await mem.send({ to: "a@b.c", subject: "s", text: "t" });
    expect(mem.sent).toHaveLength(1);
    const lines: string[] = [];
    await new LogMailer((l) => lines.push(l)).send({ to: "a@b.c", subject: "s", text: "t" });
    expect(lines[0]).toContain("to=a@b.c");
  });
});
