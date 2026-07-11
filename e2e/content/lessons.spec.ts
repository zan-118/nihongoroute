import { test, expect } from '@playwright/test';

test.describe('Pelajaran & Editorial CMS', () => {
  test('dapat merender layout pelajaran', async ({ page }) => {
    await page.goto('/lessons');
    
    // Verifikasi judul atau container
    await expect(page.locator('body')).toBeVisible();
  });
});
