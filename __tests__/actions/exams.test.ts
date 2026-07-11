import { describe, it, expect, vi } from 'vitest';
import { getSupabaseExamTemplatesList } from '@/actions/jlpt-exams.actions';

vi.mock('@/lib/supabase/server', () => ({
  createStaticClient: vi.fn().mockReturnValue({
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: [
              {
                slug: 'n5-mock',
                title: 'N5 Mock Test',
                jlpt_level: 'N5',
                time_limit_minutes: 105,
                passing_score: 90
              }
            ],
            error: null
          })
        })
      })
    })
  })
}));

describe('JLPT Exams Actions', () => {
  it('harus dapat mengambil daftar template ujian JLPT', async () => {
    const list = await getSupabaseExamTemplatesList();
    expect(list.length).toBeGreaterThan(0);
    expect(list[0].slug).toBe('n5-mock');
    expect(list[0].levelCode).toBe('N5');
  });
});
