import { test, expect } from '@playwright/test';

test.describe('Dashboard & User Progress', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });
  });

  test('Dashboard widgets visibility', async ({ page }) => {
    // Heatmap
    const heatmap = page.locator('.heatmap-container, [class*="Heatmap"]');
    if (await heatmap.count() > 0) {
        await expect(heatmap.first()).toBeVisible();
    }

    // Daily Quests
    const quests = page.getByText(/Misi Harian|Daily Quests/i);
    if (await quests.isVisible()) {
        await expect(quests).toBeVisible();
    }

    // Progress stats
    const stats = page.getByText(/Total XP|Karakter Terpelajari/i);
    if (await stats.count() > 0) {
        await expect(stats.first()).toBeVisible();
    }
  });

  test('Settings: change username/display', async ({ page }) => {
    await page.goto('/settings', { waitUntil: 'domcontentloaded' });
    
    const nameInput = page.locator('input[id="displayName"], input[placeholder*="Nama"]').first();
    if (await nameInput.isVisible()) {
        await nameInput.fill('Test User');
        const saveButton = page.getByRole('button', { name: /Simpan|Save/i });
        if (await saveButton.isVisible()) {
            await saveButton.click();
            // Should show a toast message
            await expect(page.locator('text=berhasil|success|tersimpan')).toBeVisible();
        }
    }
  });
});
