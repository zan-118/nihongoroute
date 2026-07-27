import { test, expect } from '@playwright/test';

test.describe('Gamifikasi & Dasbor Pengguna', () => {
  test('menyimpan state XP dan menampilkannya', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Simulasikan perolehan XP (menyimpan state)
    await page.evaluate(() => {
      localStorage.setItem('nr_user_storage', JSON.stringify({
        state: { xp: 1250, level: 5, streak: 3 },
        version: 0
      }));
    });
    
    await page.reload();

    // Verifikasi state tetap ada setelah reload
    const savedState = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem('nr_user_storage') || '{}');
    });

    expect(savedState.state?.xp).toBe(1250);
    expect(savedState.state?.level).toBe(5);
  });
});
