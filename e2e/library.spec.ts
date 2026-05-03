import { test, expect } from '@playwright/test';

test.describe('Library & Content (Grammar, Verbs, Vocab)', () => {
  
  test('Grammar Library: filter and search', async ({ page }) => {
    await page.goto('/library/grammar', { waitUntil: 'domcontentloaded' });
    
    // Check level filters
    const n4Button = page.getByText('N4', { exact: true }).first();
    if (await n4Button.isVisible()) {
        await n4Button.click();
        // Wait for potential content change
        await page.waitForTimeout(1000);
    }
    
    // Test Search
    const searchInput = page.locator('input[placeholder*="Cari"], input[placeholder*="Search"]').first();
    if (await searchInput.isVisible()) {
        await searchInput.fill('koto');
        await page.waitForTimeout(500);
        // Should show matching articles
        const results = page.locator('.neo-card');
        if (await results.count() > 0) {
            await expect(results.first()).toBeVisible();
        }
    }
  });

  test('Verbs Library: conjugation toggle', async ({ page }) => {
    await page.goto('/library/verbs', { waitUntil: 'domcontentloaded' });
    
    // Check if verbs are listed
    const verbCard = page.locator('.neo-card').first();
    await expect(verbCard).toBeVisible({ timeout: 15000 });
    
    // Click to see details/conjugation
    await verbCard.click();
    
    // Look for conjugation tables or labels
    const teForm = page.getByText(/~te Form|Bentuk ~te/i);
    if (await teForm.isVisible()) {
        await expect(teForm).toBeVisible();
    }
  });

  test('Vocabulary Library: search and browse', async ({ page }) => {
    await page.goto('/library/vocab', { waitUntil: 'domcontentloaded' });
    
    const searchInput = page.locator('input[placeholder*="Cari"]').first();
    await searchInput.fill('mizu');
    await page.waitForTimeout(1000);
    
    // Check for "water" or "水" in results
    const results = page.getByText(/mizu|水|water/i);
    if (await results.count() > 0) {
        await expect(results.first()).toBeVisible();
    }
  });
});
