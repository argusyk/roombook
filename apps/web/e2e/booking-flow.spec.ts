// apps/web/e2e/booking-flow.spec.ts
import { test, expect, type Page } from "@playwright/test";

// тестовий викладач із сіду
test.use({ storageState: "e2e/.auth/teacher.json" });

async function book(page: Page, from: string, to: string, purpose: string) {
  await page.goto("/rooms/1/book?date=2027-03-16");
  await page.getByLabel("Початок").fill(`2027-03-16T${from}`);
  await page.getByLabel("Завершення").fill(`2027-03-16T${to}`);
  await page.getByLabel("Мета бронювання").fill(purpose);
  await page.getByRole("button", { name: "Забронювати" }).click();
}

const confirmed = /Бронювання підтверджено/;

test("дві суміжні пари в одній аудиторії бронюються без конфлікту",
  async ({ page }) => {
  await book(page, "14:00", "15:30", "Консультація з ІПЗ");
  await expect(page.getByRole("status")).toHaveText(confirmed);
  await book(page, "15:30", "17:00", "Лабораторна робота");
  await expect(page.getByRole("status")).toHaveText(confirmed);
  await expect(page.getByText(/Аудиторія зайнята/)).toHaveCount(0);
});
