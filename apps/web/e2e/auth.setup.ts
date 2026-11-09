import { test as setup, expect } from "@playwright/test";

// Вхід тестових користувачів із сіду через POST /auth/dev-login.
// Паролів немає: dev-login працює лише в NODE_ENV development/test.
for (const [role, email] of [
  ["teacher", "teacher1@roombook.test"],
  ["student", "student01@roombook.test"],
] as const) {
  setup(`login ${role}`, async ({ page, request }) => {
    const res = await request.post("/api/auth/dev-login", { data: { email } });
    expect(res.ok()).toBeTruthy();
    const { token } = await res.json();
    await page.goto("/");
    await page.evaluate((t) => localStorage.setItem("roombook.token", t), token);
    await page.context().storageState({ path: `e2e/.auth/${role}.json` });
  });
}
