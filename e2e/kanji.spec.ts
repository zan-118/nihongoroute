import { test, expect } from '@playwright/test';

/**
 * @file kanji.spec.ts
 * @description End-to-End tests for Kanji display and interaction.
 */

test.describe('Kanji UI/UX Tests', () => {
  
  test('should display Kanji details correctly on flashcard back', async ({ page }) => {
    console.log('Navigating to N5 course page...');
    await page.goto('/courses/n5', { waitUntil: 'domcontentloaded' });
    
    // 2. Click Kanji link
    console.log('Clicking Kamus Kanji link...');
    const kanjiLink = page.getByText('Kamus Kanji', { exact: false });
    await expect(kanjiLink.first()).toBeVisible({ timeout: 15000 });
    await kanjiLink.first().click();
    
    // 3. Wait for cards to load
    console.log('Waiting for Kanji page content...');
    await expect(page.locator('h1')).toContainText(/Kanji/i, { timeout: 15000 });
    
    // 4. Click the card to flip it
    console.log('Flipping the flashcard...');
    const card = page.locator('.perspective-1500').first();
    await expect(card).toBeVisible({ timeout: 15000 });
    await card.click();
    
    // 5. Check for back side content
    console.log('Verifying back side content...');
    await expect(page.getByText(/Definisi & Arti/i)).toBeVisible({ timeout: 10000 });
    await expect(page.locator('h2.font-japanese')).toBeVisible();
    
    console.log('Test passed: Kanji details displayed correctly');
  });

  test('should display lesson vocabulary list', async ({ page }) => {
    console.log('Navigating to N5 course page...');
    await page.goto('/courses/n5', { waitUntil: 'domcontentloaded' });
    
    // 2. Click a lesson link
    console.log('Clicking a lesson link...');
    const lessonLink = page.locator('a[href*="/courses/n5/"]').nth(3); // Pick one that's likely a lesson
    await expect(lessonLink).toBeVisible({ timeout: 15000 });
    await lessonLink.click();
    
    // 3. Wait for content
    console.log('Waiting for lesson page content...');
    await expect(page.locator('h1')).toBeVisible({ timeout: 15000 });
    
    // 4. Check vocabulary cards
    console.log('Checking for vocabulary cards...');
    const vocabCard = page.locator('.neo-card').first();
    await expect(vocabCard).toBeVisible({ timeout: 15000 });
    console.log('Vocabulary card found');
  });
});
