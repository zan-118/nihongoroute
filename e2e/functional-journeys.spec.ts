import { test, expect } from '@playwright/test';

/**
 * @file functional-journeys.spec.ts
 * @description Master E2E tests for core user journeys to ensure all features
 * work as intended after the UI/UX audit remediations.
 */

test.describe('NihongoRoute Real User Behavior', () => {
  
  test.beforeEach(async ({ page }) => {
    // 1. Start from the very beginning (Landing Page)
    await page.goto('/', { waitUntil: 'networkidle' });
    
    // 2. Clear tour so it doesn't block us
    await page.addInitScript(() => {
      window.localStorage.setItem('nihongoroute_tour_seen', 'true');
    });
  });

  test('User Journey: Navigation and Profile Update', async ({ page }) => {
    // A. Start Learning from Landing
    const startButton = page.getByRole('button', { name: /Mulai Belajar|Masuk/i }).first();
    await startButton.click();
    
    // B. Wait for Dashboard to load (Wait for spinner to disappear)
    await expect(page.locator('.animate-spin').first()).not.toBeVisible({ timeout: 15000 });
    
    // C. Navigate to Settings using Sidebar
    // Note: Sidebar might be collapsed on mobile, so we handle both
    const settingsLink = page.getByRole('link', { name: /Setelan|Settings/i });
    if (await settingsLink.isHidden()) {
        const menuButton = page.getByRole('button', { name: /Menu/i });
        if (await menuButton.isVisible()) await menuButton.click();
    }
    await settingsLink.click();
    
    // D. Update Profile
    const nameInput = page.getByPlaceholder(/Masukkan nama/i).first();
    const newName = 'User Hebat ' + Math.floor(Math.random() * 100);
    await nameInput.fill(newName);
    
    const saveButton = page.getByRole('button', { name: /Simpan/i });
    await saveButton.click();
    
    // E. Verify Toast
    await expect(page.getByText(/Tersimpan|Berhasil/i).first()).toBeVisible();
    
    // F. Go back to Dashboard using Brand Link
    await page.getByRole('link', { name: /NihongoRoute/i }).first().click();
    
    // G. Verify updated name in Hero
    await expect(page.getByText(newName)).toBeVisible();
  });

  test('User Journey: Study Session & Mistake Review', async ({ page }) => {
    // A. From Dashboard, go to Courses
    const exploreButton = page.getByRole('button', { name: /Mulai Belajar/i }).first();
    await exploreButton.click();
    
    const coursesLink = page.getByRole('link', { name: /Materi|Courses/i }).first();
    await coursesLink.click();
    
    // B. Select N5 Track
    await page.getByText(/N5/i).first().click();
    
    // C. Select first Vocabulary module
    const vocabLink = page.locator('a:has-text("Kosakata"), a:has-text("Vocabulary")').first();
    await vocabLink.click();
    
    // D. Start Flashcards
    const startFlashcards = page.getByRole('link', { name: /Flashcards/i }).first();
    await startFlashcards.click();
    
    // E. Interact with card (Flip -> Correct)
    const card = page.locator('.perspective-1500').first();
    await expect(card).toBeVisible();
    await card.click(); // Flip
    await page.getByRole('button', { name: /Hafal/i }).first().click();
    
    // F. Interact with card (Flip -> Mistake)
    await page.waitForTimeout(500); 
    await card.click(); // Flip
    await page.getByRole('button', { name: /Lupa/i }).first().click();
  });
});
