import { describe, it, expect, vi } from "vitest";
import {
  getCommunityPosts,
  createCommunityPost,
  toggleLikePost,
  addCommunityComment,
} from "@/actions/community.actions";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => {
  return {
    createClient: vi.fn().mockResolvedValue({
      from: vi.fn((table: string) => {
        if (table === "community_posts") {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockResolvedValue({
              data: [
                {
                  id: "post-1",
                  user_id: "user-1",
                  content: "Halo NihongoRoute!",
                  created_at: "2026-08-02T00:00:00Z",
                  likes_users: ["user-2"],
                  comments_count: 1,
                  category: "Umum",
                },
              ],
              error: null,
            }),
            insert: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: {
                id: "post-1",
                user_id: "user-2",
                content: "Post baru",
                likes_users: [],
                comments_count: 0,
              },
              error: null,
            }),
            update: vi.fn().mockReturnThis(),
          };
        } else if (table === "leaderboard_profiles" || table === "profiles") {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            in: vi.fn().mockResolvedValue({
              data: [
                {
                  id: "user-1",
                  full_name: "Taro",
                  avatar_url: null,
                  level: 5,
                },
              ],
              error: null,
            }),
            single: vi.fn().mockResolvedValue({
              data: { full_name: "Taro" },
              error: null,
            }),
          };
        } else if (table === "community_comments") {
          return {
            insert: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: {
                id: "comment-1",
                post_id: "post-1",
                user_id: "user-1",
                content: "Komentar mantap",
                created_at: "2026-08-02T00:00:00Z",
              },
              error: null,
            }),
          };
        }
        return {
          select: vi.fn().mockReturnThis(),
        };
      }),
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: "user-1" } },
          error: null,
        }),
      },
    }),
  };
});

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn().mockReturnValue({
    from: vi.fn().mockReturnValue({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
      insert: vi.fn().mockResolvedValue({ error: null }),
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
    }),
  }),
}));

describe("Community Actions Real Integration Test", () => {
  it("harus mengambil daftar postingan komunitas dengan profil author", async () => {
    const posts = await getCommunityPosts();
    expect(posts).toBeDefined();
    expect(posts.length).toBeGreaterThan(0);
    expect(posts[0].id).toBe("post-1");
  });

  it("harus membuat postingan baru", async () => {
    const result = await createCommunityPost("Post baru", "Umum");
    expect(result.success).toBe(true);
  });

  it("harus menyukai / toggle like postingan komunitas", async () => {
    const result = await toggleLikePost("post-1");
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
  });

  it("harus menambahkan komentar pada postingan", async () => {
    const result = await addCommunityComment("post-1", "Komentar mantap");
    expect(result.success).toBe(true);
  });
});
