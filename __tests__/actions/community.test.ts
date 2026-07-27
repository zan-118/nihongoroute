import { describe, it, expect, vi } from 'vitest';
import { getCommunityPosts } from '@/actions/community.actions';

vi.mock('@/lib/supabase/server', () => {
  return {
    createClient: vi.fn().mockResolvedValue({
      from: vi.fn((table: string) => {
        if (table === 'community_posts') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockResolvedValue({
              data: [
                {
                  id: 'post-1',
                  user_id: 'user-1',
                  content: 'Halo dunia!',
                  created_at: '2025-01-01T00:00:00Z',
                  likes_users: ['user-2'],
                  comments_count: 0,
                  category: 'Umum'
                }
              ],
              error: null
            })
          };
        } else if (table === 'leaderboard_profiles') {
          return {
            select: vi.fn().mockReturnThis(),
            in: vi.fn().mockResolvedValue({
              data: [
                {
                  id: 'user-1',
                  full_name: 'Budi',
                  avatar_url: null,
                  level: 2
                }
              ],
              error: null
            })
          };
        }
        return {
          select: vi.fn().mockReturnThis()
        };
      })
    })
  };
});

describe('Community Actions', () => {
  it('harus mengambil daftar postingan komunitas', async () => {
    const posts = await getCommunityPosts();
    expect(posts.length).toBe(1);
    expect(posts[0].id).toBe('post-1');
    expect(posts[0].likes_users).toContain('user-2');
    expect(posts[0].author?.full_name).toBe('Budi');
  });
});
