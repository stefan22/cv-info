import { expect, test } from "@playwright/test";

test.describe("public pages", () => {
  test("home loads hero copy", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: /free cv insights/i }),
    ).toBeVisible({ timeout: 30_000 });
    await expect(
      page.getByRole("heading", { name: /free cv insights/i }),
    ).toContainText(/powered by ai/i);
  });

  test("auth sign-in view loads", async ({ page }) => {
    await page.goto("/auth");
    await expect(
      page.getByRole("heading", { name: /welcome back/i }),
    ).toBeVisible({ timeout: 30_000 });
  });

  test("auth sign-up view loads", async ({ page }) => {
    await page.goto("/auth?mode=signup");
    await expect(
      page.getByRole("heading", { name: /create your free account/i }),
    ).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText(/why you need an account/i)).toBeVisible();
  });

  test("dashboard redirects unauthenticated users to auth", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    await page.waitForURL(/\/auth/, { timeout: 30_000 });
    expect(page.url()).toContain("/auth");
  });
});
