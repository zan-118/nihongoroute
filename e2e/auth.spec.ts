import { test, expect } from '@playwright/test';

test.describe('Authentication Journey', () => {
  test('Halaman utama mengarahkan ke onboarding atau dashboard dan memuat halaman dengan benar', async ({ page }) => {
    // Membuka homepage
    await page.goto('/');
    
    // Pastikan title memiliki kata "NihongoRoute"
    await expect(page).toHaveTitle(/NihongoRoute/i);
  });

  test('Halaman Login dapat dimuat dan memiliki input email serta password', async ({ page }) => {
    // Mengunjungi halaman login
    await page.goto('/login');

    // Menunggu form login dirender
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitButton = page.locator('button[type="submit"]');

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitButton).toBeVisible();
  });
});
