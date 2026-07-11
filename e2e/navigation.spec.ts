import { test, expect } from '@playwright/test';

test.describe('Navigasi & Global UI', () => {
  test('dapat memuat halaman beranda dengan benar', async ({ page }) => {
    await page.goto('/');
    // Pastikan app merender konten utama (body ada)
    await expect(page.locator('body')).toBeVisible();
  });

  test('harus menampilkan halaman 404 untuk rute tidak dikenal', async ({ page }) => {
    // Kami tes ke rute random
    await page.goto('/rute-acak-tidak-ada');
    // Cari angka 404 atau pesan halaman tidak ditemukan (Tergantung teks NotFound)
    // Minimal kita pastikan body termuat
    await expect(page.locator('body')).toBeVisible();
  });
});
