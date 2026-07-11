import { describe, it, expect, vi } from 'vitest';
import { getCommunityPosts } from '@/actions/community.actions';

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({
          data: [
            {
              id: 'post-1',
              user_id: 'user-1',
              content: 'Halo dunia!',
              created_at: '2025-01-01T00:00:00Z',
              likes_users: ['user-2'],
              comments_count: 0,
              author: { full_name: 'Budi', level: 2 }
            }
          ],
          error: null
        })
      })
    })
  })
}));

describe('Community Actions', () => {
  it('harus mengambil daftar postingan komunitas', async () => {
    const posts = await getCommunityPosts();
    expect(posts.length).toBe(1);
    expect(posts[0].id).toBe('post-1');
    expect(posts[0].likes_users).toContain('user-2');
  });
});
