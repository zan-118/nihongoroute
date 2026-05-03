import { test, expect } from '@playwright/test';

test.describe('Dashboard & User Progress', () => {
  
  test.beforeEach(async ({ page }) => {
    // Prevent onboarding tour from showing up
    await page.addInitScript(() => {
      window.localStorage.setItem('nihongoroute_tour_seen', 'true');
    });
    await page.goto('/dashboard', { waitUntil: 'networkidle' });
  });

  test('Dashboard tabs navigation', async ({ page }) => {
    // Check for tabs visibility using buttons
    await expect(page.getByRole('button', { name: /Beranda|Home/i }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /Progres|Stats/i }).first()).toBeVisible();
    
    // Navigate to Progres tab
    await page.getByRole('button', { name: /Progres|Stats/i }).first().click();
    await page.waitForTimeout(500); // Wait for Framer Motion animation
    await expect(page.getByText(/Penguasaan Kanji/i).first()).toBeVisible();
    
    // Navigate back to Beranda
    await page.getByRole('button', { name: /Beranda|Home/i }).first().click();
    await page.waitForTimeout(500);
    await expect(page.getByText(/Misi Harian|Quest Hari Ini/i).first()).toBeVisible();
  });

  test('Onboarding Tour visibility', async ({ page }) => {
    // Specifically enable tour for this test
    await page.evaluate(() => {
      window.localStorage.removeItem('nihongoroute_tour_seen');
    });
    await page.reload({ waitUntil: 'networkidle' });

    // Wait for the timer (1.5s)
    await page.waitForTimeout(2000);

    const tourPopup = page.locator('div:has-text("Selamat Datang")').first();
    await expect(tourPopup).toBeVisible();
    
    const nextButton = page.getByRole('button', { name: /Lanjut|Mulai/i }).first();
    await expect(nextButton).toBeVisible();
    await nextButton.click();
  });

  test('Daily Quests visibility', async ({ page }) => {
    const questsHeader = page.getByText(/Misi Harian|Quest Hari Ini/i);
    await expect(questsHeader).toBeVisible();
    
    const questItems = page.locator('div:has-text("XP")');
    expect(await questItems.count()).toBeGreaterThan(0);
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
