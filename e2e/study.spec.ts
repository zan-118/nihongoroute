import { test, expect } from '@playwright/test';

test.describe('Study and SRS Journeys', () => {
  test('Menavigasi ke halaman ulasan SRS', async ({ page }) => {
    await page.goto('/review');

    // Pastikan halaman dimuat dengan benar
    const mainContainer = page.locator('main');
    await expect(mainContainer).toBeVisible();
  });

  test('Menavigasi ke halaman Ujian (Exams) JLPT', async ({ page }) => {
    await page.goto('/exams');

    // Menunggu kontainer ujian dirender
    const examsContainer = page.locator('text=/Simulasi Ujian|JLPT Mock/i');
    const container = page.locator('main');
    await expect(container).toBeVisible();
  });
});
