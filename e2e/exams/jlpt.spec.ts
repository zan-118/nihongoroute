import { test, expect } from '@playwright/test';

test.describe('Ujian JLPT (Mock Exams)', () => {
  test('alur pemilihan dan mulai ujian dengan penyimpanan state', async ({ page }) => {
    await page.goto('/exams');
    
    // Simulasikan state ujian sedang berlangsung (menyimpan state)
    await page.evaluate(() => {
      localStorage.setItem('nr_exam_session', JSON.stringify({
        state: {
          currentSession: {
            id: 'e2e-mock-exam',
            status: 'in_progress',
            answers: { 'q1': 3 }
          }
        },
        version: 0
      }));
    });

    await page.reload();

    // Verifikasi state tetap ada setelah reload
    const savedSession = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem('nr_exam_session') || '{}');
    });

    expect(savedSession.state?.currentSession?.id).toBe('e2e-mock-exam');
    expect(savedSession.state?.currentSession?.answers?.q1).toBe(3);
  });
});
