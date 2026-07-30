import { describe, it, expect, vi, beforeEach } from "vitest";
import { queryLexicalDomain, getLexicalDetail } from "@/lib/services/lexical-content-engine";

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
          in: vi.fn().mockReturnThis(),
          neq: vi.fn().mockReturnThis(),
          not: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
          limit: vi.fn().mockReturnThis(),
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

describe("LexicalContentEngine Unit Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockData = [];
    mockSingleData = null;
    mockCount = 0;
    mockError = null;
  });

  it("harus query data vocab melalui antarmuka domain queryLexicalDomain", async () => {
    mockData = [
      { id: "1", word: "日本語", meaning_id: "Bahasa Jepang", furigana: "にほんご", romaji: "nihongo", jlpt_level: "N5" },
    ];
    mockCount = 1;

    const result = await queryLexicalDomain({
      type: "vocab",
      filters: { search: "nihongo", level: "N5" },
      pagination: { page: 1, limit: 10 },
    });

    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(result.data[0]).toHaveProperty("word", "日本語");
  });

  it("harus query data kanji dengan filter level JLPT", async () => {
    mockData = [
      { id: "k1", character: "日", meaning: "hari, matahari", onyomi: "NICHI", kunyomi: "hi", jlpt_level: "N5" },
    ];
    mockCount = 1;

    const result = await queryLexicalDomain({
      type: "kanji",
      filters: { level: "N5" },
    });

    expect(result.data).toHaveLength(1);
    expect(result.data[0]).toHaveProperty("character", "日");
  });

  it("harus query data grammar dengan opsi pengurutan bawaan", async () => {
    mockData = [
      { id: "g1", title: "~です", meaning_id: "adalah", jlpt_level: "N5" },
    ];
    mockCount = 1;

    const result = await queryLexicalDomain({
      type: "grammar",
      filters: { search: "desu" },
    });

    expect(result.data).toHaveLength(1);
    expect(result.data[0]).toHaveProperty("title", "~です");
  });

  it("harus mengambil detail item leksikal via getLexicalDetail", async () => {
    mockSingleData = { id: "1", word: "日本語", slug: "nihongo" };

    const item = await getLexicalDetail("vocab", "nihongo");

    expect(item).not.toBeNull();
    expect(item).toHaveProperty("word", "日本語");
  });
});
