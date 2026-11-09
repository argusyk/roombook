import { test, expect, type Page } from "@playwright/test";

test.use({ storageState: "e2e/.auth/teacher.json" });

async function createSeries(page: Page, roomId: number, exdates = "") {
  await page.goto(`/rooms/${roomId}/book?date=2027-02-02`);
  await page.getByLabel("Перше заняття").fill("2027-02-02T14:00");
  await page.getByLabel("Тривалість, хв").fill("90");
  await page.getByLabel("До дати (включно)").fill("2027-05-25");
  await page.getByLabel("Виключені дати").fill(exdates);
  await page.getByLabel("Мета серії").fill("Щотижнева консультація");
  await page.getByRole("button", { name: "Створити серію" }).click();
}

test("серія з виключеною датою створює 16 занять", async ({ page }) => {
  await createSeries(page, 2, "2027-04-13");
  await expect(page.getByRole("status")).toHaveText(/Серію створено: 16 занять/);
  await page.screenshot({ path: "e2e/artifacts/recurring-created.png" });
});

test("конфлікт однієї дати відхиляє всю серію", async ({ page }) => {
  await page.goto("/rooms/3/book?date=2027-03-16");
  await page.locator('[name="startsAt"]').fill("2027-03-16T14:30");
  await page.locator('[name="endsAt"]').fill("2027-03-16T15:00");
  await page.locator('[name="purpose"]').fill("Захист курсових");
  await page.getByRole("button", { name: "Забронювати" }).click();
  await createSeries(page, 3);
  await expect(page.getByRole("status")).toHaveText(/Зайняті дати: 2027-03-16/);
});

test("помилка у формі серії показується без запиту до API", async ({ page }) => {
  await page.goto("/rooms/4/book?date=2027-02-02");
  await page.getByRole("button", { name: "Створити серію" }).click();
  await expect(page.locator(".form-error")).toBeVisible();
});
