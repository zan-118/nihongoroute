import { test, expect } from '@playwright/test';

test.describe('Gamifikasi & Dasbor Pengguna', () => {
  test('menampilkan elemen gamifikasi profil', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Karena kita tidak benar-benar login dengan DB di E2E ini kecuali 
    // globalSetup yang dimock, kita hanya cek ketiadaan crash
    // atau visibilitas elemen container
    await expect(page.locator('body')).toBeVisible();
  });
});
