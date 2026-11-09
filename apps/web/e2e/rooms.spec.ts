import { test, expect } from "@playwright/test";

test("сторінка аудиторій показує аудиторії з сіду", async ({ page }) => {
  await page.goto("/?date=2027-03-16");
  await expect(page.getByRole("heading", { name: "Аудиторії на 2027-03-16" })).toBeVisible();
  await expect(page.getByRole("cell", { name: "A-314" })).toBeVisible();
});
