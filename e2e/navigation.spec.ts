import { test, expect } from '@playwright/test';

test.describe('Main Application Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Jalankan sebagai guest session atau buka dashboard langsung
    await page.goto('/dashboard');
  });

  test('Sidebar atau navigasi utama dirender pada dashboard', async ({ page }) => {
    // Periksa keberadaan navigasi (misalnya sidebar/navbar)
    const sidebar = page.locator('nav');
    await expect(sidebar.first()).toBeVisible();
  });

  test('Dapat menavigasi ke halaman Perpustakaan (Library)', async ({ page }) => {
    // Navigasi manual ke perpustakaan
    await page.goto('/library');
    
    // Pastikan URL berubah ke /library
    await expect(page).toHaveURL(/\/library/);
  });

  test('Dapat menavigasi ke halaman Pengaturan (Settings)', async ({ page }) => {
    // Navigasi manual ke pengaturan
    await page.goto('/settings');

    // Pastikan URL berubah ke /settings
    await expect(page).toHaveURL(/\/settings/);
  });
});
