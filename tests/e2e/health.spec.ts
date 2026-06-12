import { expect, test } from "@playwright/test";

test("homepage exposes the document and main landmark", async ({ page }) => {
  const response = await page.goto("/");

  expect(response?.ok()).toBe(true);
  await expect(page.locator("main")).toBeVisible();
});
