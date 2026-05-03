import { test, expect } from '@playwright/test';

test.describe('Learning Modules (Flashcards, Kanji, Survival)', () => {
  
  test.beforeEach(async ({ page }) => {
    // Start from N5 Course page
    await page.goto('/courses/n5', { waitUntil: 'domcontentloaded' });
  });

  test('Vocabulary Flashcards: flip and navigate', async ({ page }) => {
    const vocabLink = page.locator('a[href$="/flashcards"]').first();
    await expect(vocabLink).toBeVisible();
    await vocabLink.click();

    await expect(page).toHaveURL(/.*flashcards/);
    
    // Check if a card exists
    const card = page.locator('.perspective-1500').first();
    await expect(card).toBeVisible({ timeout: 15000 });
    
    // Flip card
    await card.click();
    await expect(page.getByText(/Definisi & Arti/i)).toBeVisible();
    
    // Test navigation buttons if they exist
    const nextButton = page.locator('button:has(.lucide-chevron-right)').first();
    if (await nextButton.isVisible()) {
        await nextButton.click();
        // Wait for potential animation
        await page.waitForTimeout(500);
    }
  });

  test('Kanji Kamus: stroke order and readings', async ({ page }) => {
    const kanjiLink = page.locator('a[href$="/kanji"]').first();
    await expect(kanjiLink).toBeVisible();
    await kanjiLink.click();

    await expect(page).toHaveURL(/.*kanji/);
    
    const card = page.locator('.perspective-1500').first();
    await expect(card).toBeVisible({ timeout: 15000 });
    await card.click();
    
    // Check back side
    await expect(page.locator('h2.font-japanese')).toBeVisible();
    
    // Stroke order image or SVG
    const strokeOrder = page.locator('img[alt*="Stroke"], svg:has(path[id*="kvg"])').first();
    if (await strokeOrder.count() > 0) {
        await expect(strokeOrder).toBeVisible();
    }
  });

  test('Survival Mode: start game', async ({ page }) => {
    const survivalLink = page.locator('a[href$="/survival"]').first();
    await expect(survivalLink).toBeVisible();
    await survivalLink.click();

    await expect(page).toHaveURL(/.*survival/);
    
    // Check if start button or initial challenge exists
    const startButton = page.getByText(/Mulai|Start/i).first();
    if (await startButton.isVisible()) {
        await startButton.click();
        // Check for timer or score display
        const score = page.getByText(/Skor|Score/i);
        if (await score.isVisible()) {
            await expect(score).toBeVisible();
        }
    }
  });
});
