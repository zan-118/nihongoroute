import { describe, it, expect, vi } from "vitest";
import {
  getPaginatedGrammar,
  getLibraryGrammarDetail,
  getRandomGrammarArticle,
  getGrammarArticles,
  getGrammarStaticSlugs,
} from "@/actions/grammar.actions";

vi.mock("@/lib/services/lexical-content-engine", () => ({
  queryLexicalDomain: vi.fn().mockResolvedValue({
    data: [
      {
        id: "grammar-1",
        title: "は (wa)",
        slug: "wa",
        meaning: "Partikel penanda topik",
        jlpt_level: "N5",
      },
    ],
    total: 1,
  }),
}));

vi.mock("@/lib/services/content-repository", () => ({
  getContentBySlugOrId: vi.fn().mockImplementation((table: string, slugOrId: string) => {
    if (slugOrId === "wa") {
      return Promise.resolve({
        id: "grammar-1",
        title: "は (wa)",
        slug: "wa",
        meaning: "Partikel penanda topik",
        jlpt_level: "N5",
        examples: [],
        related_grammar: [],
      });
    }
    return Promise.resolve(null);
  }),
  getStaticSlugs: vi.fn().mockResolvedValue([{ slug: "wa" }]),
  getRandomGrammarPool: vi.fn().mockResolvedValue([
    { id: "grammar-1", title: "は (wa)", slug: "wa", jlpt_level: "N5" },
  ]),
  getGrammarListBySlugs: vi.fn().mockResolvedValue([]),
  getGrammarFamilyList: vi.fn().mockResolvedValue([]),
}));

describe("Grammar Actions Integration Test", () => {
  it("harus mengambil detail tata bahasa via getLibraryGrammarDetail", async () => {
    const grammar = await getLibraryGrammarDetail("wa");
    expect(grammar).toBeDefined();
    expect(grammar?.title).toContain("は");
  });

  it("harus mengembalikan null untuk slug yang tidak ada", async () => {
    const grammar = await getLibraryGrammarDetail("tidak-ada");
    expect(grammar).toBeNull();
  });

  it("harus mengambil daftar tata bahasa berpaginasi via getPaginatedGrammar", async () => {
    const result = await getPaginatedGrammar(1, 10);
    expect(result).toBeDefined();
    expect(result.data.length).toBe(1);
    expect(result.data[0].slug).toBe("wa");
  });

  it("harus mengambil artikel tata bahasa acak via getRandomGrammarArticle", async () => {
    const article = await getRandomGrammarArticle("N5");
    expect(article).toBeDefined();
    expect(article?.slug).toBe("wa");
  });
});
