import { test, expect, type Page } from "@playwright/test";

test.use({ storageState: "e2e/.auth/teacher.json" });

async function book(page: Page, from: string, to: string, purpose: string) {
  await page.goto("/rooms/1/book?date=2027-03-17");
  await page.locator('[name="startsAt"]').fill(`2027-03-17T${from}`);
  await page.locator('[name="endsAt"]').fill(`2027-03-17T${to}`);
  await page.locator('[name="purpose"]').fill(purpose);
  await page.getByRole("button", { name: "Забронювати" }).click();
}

test("перетин з наявним бронюванням показує конфлікт", async ({ page }) => {
  await book(page, "10:00", "11:30", "Лекція з ІПЗ");
  await expect(page.getByRole("status")).toHaveText(/Бронювання підтверджено/);
  await book(page, "11:00", "12:00", "Консультація");
  await expect(page.getByRole("status")).toHaveText(/Аудиторія зайнята з 10:00 до 11:30/);
});
