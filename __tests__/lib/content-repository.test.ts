import { describe, it, expect, vi, beforeEach } from "vitest";
import { getPaginatedContent, getContentBySlugOrId } from "@/lib/services/content-repository";
import { VocabTable } from "@/types/database";

let mockData: Record<string, unknown>[] = [];
let mockSingleData: Record<string, unknown> | null = null;
let mockCount: number = 0;
let mockError: Error | null = null;

vi.mock("@/lib/supabase/server", () => {
  return {
    createStaticClient: vi.fn().mockImplementation(() => ({
      from: vi.fn().mockImplementation(() => {
        const builder = {
          select: vi.fn().mockReturnThis(),
          or: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          neq: vi.fn().mockReturnThis(),
          not: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
          limit: vi.fn().mockImplementation(() => {
            return Promise.resolve({ data: mockData, error: mockError });
          }),
          range: vi.fn().mockImplementation(() => {
            return Promise.resolve({ data: mockData, count: mockCount, error: mockError });
          }),
          maybeSingle: vi.fn().mockImplementation(() => {
            return Promise.resolve({ data: mockSingleData, error: mockError });
          }),
        };
        return builder;
      }),
    })),
  };
});

describe("Content Repository Unit Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockData = [];
    mockSingleData = null;
    mockCount = 0;
    mockError = null;
  });

  describe("getPaginatedContent", () => {
    it("harus mengembalikan data paginasi dengan benar", async () => {
      mockData = [{ id: "1", word: "nihongo" }, { id: "2", word: "route" }];
      mockCount = 2;

      const result = await getPaginatedContent<VocabTable>("vocab", {
        page: 1,
        limit: 10,
      });

      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.count).toBe(2);
      expect(result.page).toBe(1);
      expect(result.totalPages).toBe(1);
    });

    it("harus menangani error query Supabase secara aman", async () => {
      mockError = new Error("Database query failed");

      const result = await getPaginatedContent<VocabTable>("vocab", {
        page: 1,
        limit: 10,
      });

      expect(result.data).toHaveLength(0);
      expect(result.total).toBe(0);
      expect(result.count).toBe(0);
    });
  });

  describe("getContentBySlugOrId", () => {
    it("harus mengambil data berdasarkan slug", async () => {
      mockSingleData = { id: "uuid-123", slug: "test-slug", title: "Test Title" };

      const result = await getContentBySlugOrId<VocabTable>("vocab", "test-slug");

      expect(result).not.toBeNull();
      expect(result.id).toBe("uuid-123");
      expect(result.slug).toBe("test-slug");
    });

    it("harus mengambil data berdasarkan UUID", async () => {
      mockSingleData = { id: "f57f436a-80ad-46b3-841d-40cdcf9473d6", title: "Test UUID" };

      const result = await getContentBySlugOrId<VocabTable>("vocab", "f57f436a-80ad-46b3-841d-40cdcf9473d6");

      expect(result).not.toBeNull();
      expect(result?.id).toBe("f57f436a-80ad-46b3-841d-40cdcf9473d6");
    });

    it("harus melakukan fallback pencarian karakter kanji jika slug tidak cocok", async () => {
      mockSingleData = { id: "kanji-1", character: "日", meaning: "sun" };

      const result = await getContentBySlugOrId<any>("kanji", "日");

      expect(result).not.toBeNull();
      expect(result?.character).toBe("日");
    });

    it("harus mengembalikan null jika data tidak ditemukan dan terjadi error", async () => {
      mockError = new Error("Not found");
      const result = await getContentBySlugOrId<any>("vocab", "non-existent");
      expect(result).toBeNull();
    });
  });

  describe("getStaticSlugs", () => {
    it("harus mengembalikan daftar slug statis", async () => {
      const { getStaticSlugs } = await import("@/lib/services/content-repository");
      mockData = [{ slug: "taber-1" }, { slug: "nom-2" }];

      const slugs = await getStaticSlugs("vocab", { limit: 10 });
      expect(slugs).toBeDefined();
      expect(slugs).toHaveLength(2);
    });
  });
});

