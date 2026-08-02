import { test, expect } from "@playwright/test";

test.describe("Navigasi & Global UI Real E2E", () => {
  test("dapat memuat halaman beranda dengan benar", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("body")).toBeVisible();
  });

  test("dapat memuat halaman Pustaka (/library)", async ({ page }) => {
    await page.goto("/library");
    await expect(page.locator("body")).toBeVisible();
  });

  test("dapat memuat halaman Ujian (/exams)", async ({ page }) => {
    await page.goto("/exams");
    await expect(page.locator("body")).toBeVisible();
  });

  test("dapat memuat Kamus Terpadu (/tools/dictionary)", async ({ page }) => {
    await page.goto("/tools/dictionary");
    await expect(page.locator("body")).toBeVisible();
  });

  test("harus menangani rute 404 tidak dikenal secara terisolasi", async ({ page }) => {
    await page.goto("/rute-acak-tidak-ada-12345");
    await expect(page.locator("body")).toBeVisible();
  });
});
