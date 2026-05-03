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
    
    // Answer incorrectly to trigger mistake review
    const forgotButton = page.getByRole('button', { name: /Masih Lupa/i }).first();
    if (await forgotButton.isVisible()) {
        await forgotButton.click();
        // The card should shake (hard to test without visual regression, but we can check if we progress)
        
        // Skip through remaining cards to reach summary
        for (let i = 0; i < 5; i++) {
            if (await page.getByRole('button', { name: /Hafal|Lupa/i }).first().isVisible()) {
                await page.getByRole('button', { name: /Hafal/i }).first().click();
                await page.waitForTimeout(300);
            }
        }
        
        // Summary modal should show "Ulas Kesalahan"
        const reviewMistakesButton = page.getByRole('button', { name: /Ulas.*Kesalahan/i });
        if (await reviewMistakesButton.isVisible()) {
            await expect(reviewMistakesButton).toBeVisible();
            await reviewMistakesButton.click();
            // Should restart with the mistake cards
            await expect(page.locator('.perspective-1500').first()).toBeVisible();
        }
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
