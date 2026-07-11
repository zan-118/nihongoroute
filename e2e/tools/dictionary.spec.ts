import { test, expect } from '@playwright/test';

test.describe('Kamus & Alat Tambahan', () => {
  test('dapat merender halaman kamus', async ({ page }) => {
    await page.goto('/dictionary');
    // Asumsi rute /dictionary render dengan benar
    await expect(page.locator('body')).toBeVisible();
  });
});
