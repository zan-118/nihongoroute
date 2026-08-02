import { describe, it, expect, vi } from "vitest";
import { getSupporters } from "@/actions/support.actions";

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn().mockReturnValue({
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue({
            data: [
              {
                id: "supporter-1",
                name: "Fauzan",
                amount: 100000,
                message: "Semangat!",
                tier: "gold",
                source: "saweria",
                created_at: "2026-08-02T00:00:00Z",
              },
            ],
            error: null,
          }),
        }),
      }),
    }),
  }),
}));

describe("Support Actions Integration Test", () => {
  it("harus mengambil daftar donatur dari Supabase via getSupporters", async () => {
    const supporters = await getSupporters();
    expect(supporters).toBeDefined();
    expect(supporters.length).toBe(1);
    expect(supporters[0].name).toBe("Fauzan");
    expect(supporters[0].tier).toBe("gold");
  });
});
