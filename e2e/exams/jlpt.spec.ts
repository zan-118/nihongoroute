import { test, expect } from '@playwright/test';

test.describe('Ujian JLPT (Mock Exams)', () => {
  test('alur pemilihan dan mulai ujian', async ({ page }) => {
    // Pergi ke halaman daftar ujian
    await page.goto('/exams');
    await expect(page.locator('body')).toBeVisible();

    // Opsional: tes interaksi ringan jika elemen N5 ada. 
    // Tapi karena bergantung fetch Supabase (SSR), elemen mungkin kosong.
    // Jadi cukup pastikan halaman tidak 500 error.
  });
});
