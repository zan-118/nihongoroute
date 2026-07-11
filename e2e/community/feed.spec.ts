import { test, expect } from '@playwright/test';

test.describe('Komunitas Feed', () => {
  test('dapat merender halaman komunitas', async ({ page }) => {
    await page.goto('/community');
    await expect(page.locator('body')).toBeVisible();
  });
});
