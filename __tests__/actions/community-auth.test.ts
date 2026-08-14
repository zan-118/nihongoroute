import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: null },
        error: new Error("unauthenticated"),
      }),
    },
  }),
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(),
}));

describe("Community action auth guards", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects unauthenticated post creation", async () => {
    const { createCommunityPost } = await import("@/actions/community.actions");

    await expect(createCommunityPost("Halo", "Umum")).resolves.toEqual({
      success: false,
      error: "Anda harus masuk log terlebih dahulu.",
    });
  });
});
