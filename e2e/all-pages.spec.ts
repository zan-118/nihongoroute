import { test, expect } from '@playwright/test';

/**
 * @file all-pages.spec.ts
 * @description Comprehensive smoke test to ensure all major routes are accessible
 * and render correctly without critical failures.
 */

const routes = [
  { path: '/', title: /NihongoRoute/i },
  { path: '/dashboard', title: /Dashboard/i },
  { path: '/courses', title: /Materi|Kursus/i },
  { path: '/library', title: /Pustaka|Library/i },
  { path: '/library/grammar', title: /Tata Bahasa|Grammar/i },
  { path: '/library/verbs', title: /Kata Kerja|Verbs/i },
  { path: '/library/vocab', title: /Kosakata|Vocab/i },
  { path: '/exams', title: /Ujian|Exams/i },
  { path: '/review', title: /Review|Hafalan/i },
  { path: '/settings', title: /Pengaturan|Settings/i },
  { path: '/login', title: /Masuk|Login/i },
  { path: '/support', title: /Bantuan|Support/i },
];

test.describe('Global Smoke Test: All Pages Accessibility', () => {
  
  test.beforeEach(async ({ page }) => {
    // Disable tour for all tests to avoid overlay issues
    await page.addInitScript(() => {
      window.localStorage.setItem('nihongoroute_tour_seen', 'true');
    });
  });

  for (const route of routes) {
    test(`Should load page: ${route.path}`, async ({ page }) => {
      // Visit the route
      const response = await page.goto(route.path, { waitUntil: 'networkidle' });
      
      // 1. Check HTTP Status
      expect(response?.status()).toBeLessThan(400);

      // 2. Handle Loading States (Wait for spinners to disappear)
      const spinner = page.locator('.animate-spin, [class*="spin"]');
      if (await spinner.count() > 0) {
        await expect(spinner.first()).not.toBeVisible({ timeout: 15000 });
      }

      // 3. Check basic content visibility
      // Brand logo usually in Sidebar/Topbar
      const brand = page.getByRole('link', { name: /Nihongo.*Route/i }).first();
      const heading = page.locator('h1, h2, h3').first();
      
      await expect(brand.or(heading)).toBeVisible({ timeout: 15000 });

      // 3. Check for specific page markers if provided
      if (route.title) {
        await expect(page.locator('body').getByText(route.title).first()).toBeVisible();
      }

      // 4. Ensure no "Application Error" or "404" is visible
      const errorText = page.getByText(/Application Error|404|Page Not Found/i);
      expect(await errorText.count()).toBe(0);
    });
  }

  test('Should show 404 for non-existent routes', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist');
    expect(response?.status()).toBe(404);
    await expect(page.getByText(/404|Tidak Ditemukan/i).first()).toBeVisible();
  });
});
