import { describe, it, expect, vi } from "vitest";
import { getPaginatedKanji, getLibraryKanjiDetail, getKanjiStaticSlugs } from "@/actions/kanji.actions";

vi.mock("@/lib/services/lexical-content-engine", () => ({
  queryLexicalDomain: vi.fn().mockResolvedValue({
    data: [
      {
        id: "kanji-1",
        character: "日",
        slug: "nichi",
        english: "sun, day",
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
        not: vi.fn().mockReturnValue({
          not: vi.fn().mockResolvedValue({
            data: [{ slug: "nichi" }],
          }),
        }),
      }),
    }),
  }),
}));

vi.mock("@/lib/services/content-repository", () => ({
  getContentBySlugOrId: vi.fn().mockImplementation((table: string, slugOrId: string) => {
    if (slugOrId === "nichi") {
      return Promise.resolve({
        id: "kanji-1",
        character: "日",
        slug: "nichi",
        english: "sun, day",
        jlpt_level: "N5",
      });
    }
    return Promise.resolve(null);
  }),
  getStaticSlugs: vi.fn().mockResolvedValue([{ slug: "nichi", character: "日" }]),
  getVocabByCharacter: vi.fn().mockResolvedValue([]),
}));

describe("Kanji Actions Integration Test", () => {
  it("harus mengambil detail kanji via getLibraryKanjiDetail", async () => {
    const kanji = await getLibraryKanjiDetail("nichi");
    expect(kanji).toBeDefined();
    expect(kanji?.character).toBe("日");
  });

  it("harus mengembalikan null untuk slug kanji yang tidak ada", async () => {
    const kanji = await getLibraryKanjiDetail("tidak-ada");
    expect(kanji).toBeNull();
  });

  it("harus mengambil daftar kanji berpaginasi via getPaginatedKanji", async () => {
    const result = await getPaginatedKanji(1, 10);
    expect(result).toBeDefined();
    expect(result.data.length).toBe(1);
    expect(result.data[0].character).toBe("日");
  });

  it("harus mengambil static slugs via getKanjiStaticSlugs", async () => {
    const slugs = await getKanjiStaticSlugs();
    expect(slugs).toBeDefined();
    expect(slugs.length).toBe(1);
  });
});
