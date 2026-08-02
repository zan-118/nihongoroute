import { test, expect } from "@playwright/test";

test.describe("E2E Pustaka Kosakata (/library/vocab)", () => {
  test("dapat memuat halaman daftar kosakata", async ({ page }) => {
    await page.goto("/library/vocab");
    await expect(page.locator("body")).toBeVisible();
  });

  test("dapat menavigasi ke detail kosakata", async ({ page }) => {
    await page.goto("/library/vocab/taberu");
    await expect(page.locator("body")).toBeVisible();
  });
});
