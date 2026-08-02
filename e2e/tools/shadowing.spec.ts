import { test, expect } from "@playwright/test";

test.describe("E2E Tool Shadowing Recorder (/tools/shadowing)", () => {
  test("dapat memuat halaman alat bantu Shadowing", async ({ page }) => {
    await page.goto("/tools/shadowing");
    await expect(page.locator("body")).toBeVisible();
  });
});
