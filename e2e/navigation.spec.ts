import { test, expect } from '@playwright/test';

test.describe('Main Navigation & Page Loading', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
  });

  test('should load the landing page and navigate to courses', async ({ page }) => {
    await expect(page).toHaveTitle(/NihongoRoute/i);
    
    // Find a link to courses or "Mulai Belajar"
    const startButton = page.getByText(/Mulai Gratis|Belajar Sekarang/i).first();
    if (await startButton.isVisible()) {
        await startButton.click();
        await expect(page).toHaveURL(/.*courses|.*dashboard/);
    }
  });

  test('should navigate through the sidebar', async ({ page }) => {
    // Go to dashboard first
    await page.goto('/dashboard');
    
    // Check Sidebar links
    const sidebarLinks = [
        { name: /Materi|Pusat Belajar/i, url: '/courses' },
        { name: /Pustaka/i, url: '/library' },
        { name: /Ujian/i, url: '/exams' },
        { name: /Hafalan/i, url: '/review' },
    ];

    for (const link of sidebarLinks) {
        const el = page.getByRole('link', { name: link.name }).first();
        if (await el.isVisible()) {
            await el.click();
            await expect(page).toHaveURL(new RegExp(`.*${link.url}`));
            // Go back or stay on the new page is fine, but let's go back to dashboard to test the next link
            await page.goto('/dashboard');
        }
    }
  });

  test('should toggle dark mode', async ({ page }) => {
    const themeToggle = page.locator('button[aria-label*="theme"], button:has(.lucide-sun), button:has(.lucide-moon)').first();
    if (await themeToggle.isVisible()) {
        const initialHtmlClass = await page.locator('html').getAttribute('class');
        await themeToggle.click();
        const newHtmlClass = await page.locator('html').getAttribute('class');
        expect(initialHtmlClass).not.toBe(newHtmlClass);
    }
  });
});
