import { Page } from '@playwright/test';

/**
 * Mock panggilan API ke Supabase agar kita tidak menabrak database produksi
 * selama uji E2E (sesuai kaidah offline-first dan isolasi test).
 */
export async function mockSupabaseAuth(page: Page) {
  await page.route('**/auth/v1/user', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'test-user-123',
        aud: 'authenticated',
        role: 'authenticated',
        email: 'test@nihongoroute.com',
        user_metadata: {
          full_name: 'Uji Coba',
        }
      })
    });
  });

  // Mock status sesi
  await page.evaluate(() => {
    window.localStorage.setItem('supabase.auth.token', 'test-token');
  });
}

export async function mockSupabaseSync(page: Page) {
  // Mock rpc calls seperti sync_user_progress
  await page.route('**/rest/v1/rpc/sync_user_progress', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        accepted_xp: 1500,
        current_streak: 5,
        new_level: 3,
        streak_frozen: false
      })
    });
  });
}
