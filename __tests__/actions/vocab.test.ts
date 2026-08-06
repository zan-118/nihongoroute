import { describe, it, expect, vi } from "vitest";
import { getPaginatedVocab, getLibraryVocabDetail, getVocabStaticSlugs } from "@/actions/vocab.actions";

vi.mock("@/lib/services/lexical-content-engine", () => ({
  queryLexicalDomain: vi.fn().mockResolvedValue({
    data: [
      {
        id: "vocab-1",
        word: "食べる",
        slug: "taberu",
        furigana: "たべる",
        meaning_id: "makan",
        jlpt_level: "N5",
      },
    ],
    total: 1,
  }),
}));

vi.mock("@/lib/supabase/server", () => ({
  createStaticClient: vi.fn().mockReturnValue({
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        in: vi.fn().mockReturnValue({
          not: vi.fn().mockResolvedValue({
            data: [{ slug: "taberu" }],
          }),
        }),
      }),
    }),
  }),
}));

vi.mock("@/lib/services/content-repository", () => ({
  getContentBySlugOrId: vi.fn().mockImplementation((table: string, slugOrId: string) => {
    if (slugOrId === "taberu") {
      return Promise.resolve({
        id: "vocab-1",
        word: "食べる",
        slug: "taberu",
        furigana: "たべる",
        meaning_id: "makan",
        pitch_accent: "0",
        jlpt_level: "N5",
        related_kanji: [],
        synonyms: [],
        antonyms: [],
        examples: [],
        conjugations: {},
      });
    }
    return Promise.resolve(null);
  }),
  getStaticSlugs: vi.fn().mockResolvedValue([{ slug: "taberu" }]),
  getRelatedKanjis: vi.fn().mockResolvedValue([]),
  getRelatedVocabByWords: vi.fn().mockResolvedValue([]),
}));

describe("Vocab Actions Integration Test", () => {
  it("harus mengambil detail kosakata via getLibraryVocabDetail", async () => {
    const vocab = await getLibraryVocabDetail("taberu");
    expect(vocab).toBeDefined();
    expect(vocab?.word).toBe("食べる");
  });

  it("harus mengembalikan null untuk slug yang tidak ada", async () => {
    const vocab = await getLibraryVocabDetail("tidak-ada");
    expect(vocab).toBeNull();
  });

  it("harus mengambil data paginasi kosakata via getPaginatedVocab", async () => {
    const result = await getPaginatedVocab(1, 10);
    expect(result).toBeDefined();
    expect(result.data.length).toBe(1);
    expect(result.data[0].slug).toBe("taberu");
  });

  it("harus mengambil static slugs via getVocabStaticSlugs", async () => {
    const slugs = await getVocabStaticSlugs();
    expect(slugs).toBeDefined();
    expect(slugs.length).toBe(1);
    expect(slugs[0].slug).toBe("taberu");
  });
});
