/**
 * @file lesson-hydration-engine.test.ts
 * @description Test suite untuk LessonHydrationEngine — markdown parser, relation hydrators,
 * field normalization, dan quiz mapping. Semua tes berjalan tanpa Supabase (mock fetcher).
 */

import { describe, it, expect, vi } from "vitest";
import {
  parseMarkdownToBlocks,
  parseArray,
  hydrateLessonDetail,
  type LessonRelationFetcher,
  type RawLessonRow,
  type HydrationVocabRow,
  type HydrationKanjiRow,
  type HydrationGrammarRow,
} from "@/lib/services/lesson-hydration-engine";

// ======================================================
// HELPERS
// ======================================================

function createEmptyFetcher(): LessonRelationFetcher {
  return {
    fetchVocabByIds: vi.fn().mockResolvedValue([]),
    fetchVocabByWordsOrSlugs: vi.fn().mockResolvedValue([]),
    fetchKanjiByIds: vi.fn().mockResolvedValue([]),
    fetchKanjiByCharacters: vi.fn().mockResolvedValue([]),
    fetchGrammarByIds: vi.fn().mockResolvedValue([]),
    fetchGrammarByTitlesOrSlugs: vi.fn().mockResolvedValue([]),
    fetchListeningBySlugs: vi.fn().mockResolvedValue([]),
    fetchReadingBySlugs: vi.fn().mockResolvedValue([]),
  };
}

function createMinimalRawLesson(overrides: Partial<RawLessonRow> = {}): RawLessonRow {
  return {
    id: "lesson-001",
    title: "Pelajaran Pertama",
    slug: "pelajaran-pertama",
    _sourceTable: "lessons",
    ...overrides,
  };
}

// ======================================================
// parseMarkdownToBlocks
// ======================================================

describe("parseMarkdownToBlocks", () => {
  it("returns empty array for empty string", () => {
    expect(parseMarkdownToBlocks("")).toEqual([]);
  });

  it("parses heading 1", () => {
    const blocks = parseMarkdownToBlocks("# Judul Utama");
    expect(blocks).toHaveLength(1);
    expect(blocks[0].type).toBe("heading");
    expect(blocks[0].content).toBe("Judul Utama");
    expect(blocks[0].level).toBe(1);
  });

  it("parses heading 2 and heading 3", () => {
    const md = "## Sub Judul\n\n### Sub Sub Judul";
    const blocks = parseMarkdownToBlocks(md);
    expect(blocks).toHaveLength(2);
    expect(blocks[0].level).toBe(2);
    expect(blocks[1].level).toBe(3);
  });

  it("parses bullet list", () => {
    const md = "- item satu\n- item dua\n- item tiga";
    const blocks = parseMarkdownToBlocks(md);
    expect(blocks).toHaveLength(1);
    expect(blocks[0].type).toBe("list");
    expect(blocks[0].listType).toBe("bullet");
    expect(blocks[0].items).toEqual(["item satu", "item dua", "item tiga"]);
  });

  it("parses numbered list", () => {
    const md = "1. pertama\n2. kedua";
    const blocks = parseMarkdownToBlocks(md);
    expect(blocks).toHaveLength(1);
    expect(blocks[0].type).toBe("list");
    expect(blocks[0].listType).toBe("number");
  });

  it("parses blockquote as callout", () => {
    const md = "> **Catatan**\n> Ini penting sekali";
    const blocks = parseMarkdownToBlocks(md);
    expect(blocks).toHaveLength(1);
    expect(blocks[0].type).toBe("callout");
    expect(blocks[0].title).toBe("Catatan");
    expect(blocks[0].content).toBe("Ini penting sekali");
  });

  it("parses table block", () => {
    const md = "| Kanji | Arti |\n|-------|------|\n| 日 | Hari |";
    const blocks = parseMarkdownToBlocks(md);
    expect(blocks).toHaveLength(1);
    expect(blocks[0].type).toBe("table");
    expect(blocks[0].headers).toEqual(["Kanji", "Arti"]);
    expect(blocks[0].rows).toEqual([["日", "Hari"]]);
  });

  it("parses image", () => {
    const md = "![alt text](https://example.com/img.jpg)";
    const blocks = parseMarkdownToBlocks(md);
    expect(blocks).toHaveLength(1);
    expect(blocks[0].type).toBe("image");
    expect(blocks[0].content).toBe("https://example.com/img.jpg");
  });

  it("parses plain text as text block", () => {
    const md = "Ini adalah paragraf biasa.";
    const blocks = parseMarkdownToBlocks(md);
    expect(blocks).toHaveLength(1);
    expect(blocks[0].type).toBe("text");
    expect(blocks[0].content).toBe("Ini adalah paragraf biasa.");
  });

  it("handles mixed content with double-newline separators", () => {
    const md = "# Judul\n\nParagraf satu.\n\n- item a\n- item b";
    const blocks = parseMarkdownToBlocks(md);
    expect(blocks).toHaveLength(3);
    expect(blocks[0].type).toBe("heading");
    expect(blocks[1].type).toBe("text");
    expect(blocks[2].type).toBe("list");
  });
});

// ======================================================
// parseArray
// ======================================================

describe("parseArray", () => {
  it("returns empty array for null/undefined", () => {
    expect(parseArray(null)).toEqual([]);
    expect(parseArray(undefined)).toEqual([]);
  });

  it("returns array as-is if already array", () => {
    expect(parseArray([1, 2, 3])).toEqual([1, 2, 3]);
  });

  it("parses JSON string into array", () => {
    expect(parseArray('["a","b"]')).toEqual(["a", "b"]);
  });

  it("returns empty array for invalid JSON string", () => {
    expect(parseArray("not json")).toEqual([]);
  });
});

// ======================================================
// hydrateLessonDetail
// ======================================================

describe("hydrateLessonDetail", () => {
  it("returns basic LibraryItem structure for minimal lesson", async () => {
    const fetcher = createEmptyFetcher();
    const raw = createMinimalRawLesson();
    const result = await hydrateLessonDetail(raw, fetcher);

    expect(result.id).toBe("lesson-001");
    expect(result._id).toBe("lesson-001");
    expect(result.title).toBe("Pelajaran Pertama");
    expect(result.slug).toBe("pelajaran-pertama");
  });

  it("hydrates vocab list using fetchVocabByIds for UUIDs", async () => {
    const mockVocab: HydrationVocabRow[] = [{
      id: "550e8400-e29b-41d4-a716-446655440000",
      word: "食べる",
      furigana: "たべる",
      romaji: "taberu",
      meaning_id: "makan",
      hinshi: "Verb",
      pitch_accent: null,
      usage_notes: null,
      mnemonic: null,
      slug: "taberu",
    }];

    const fetcher = createEmptyFetcher();
    (fetcher.fetchVocabByIds as ReturnType<typeof vi.fn>).mockResolvedValue(mockVocab);

    const raw = createMinimalRawLesson({
      vocab_list: ["550e8400-e29b-41d4-a716-446655440000"],
    });

    const result = await hydrateLessonDetail(raw, fetcher);
    expect(fetcher.fetchVocabByIds).toHaveBeenCalledWith(["550e8400-e29b-41d4-a716-446655440000"]);
    expect(result.vocabList).toHaveLength(1);
    expect((result.vocabList as Record<string, unknown>[])[0].word).toBe("食べる");
  });

  it("hydrates vocab list using fetchVocabByWordsOrSlugs for non-UUIDs", async () => {
    const mockVocab: HydrationVocabRow[] = [{
      id: "v-1",
      word: "猫",
      furigana: "ねこ",
      romaji: "neko",
      meaning_id: "kucing",
      hinshi: "Noun",
      pitch_accent: null,
      usage_notes: null,
      mnemonic: null,
      slug: "neko",
    }];

    const fetcher = createEmptyFetcher();
    (fetcher.fetchVocabByWordsOrSlugs as ReturnType<typeof vi.fn>).mockResolvedValue(mockVocab);

    const raw = createMinimalRawLesson({ vocab_list: ["猫"] });
    const result = await hydrateLessonDetail(raw, fetcher);

    expect(fetcher.fetchVocabByWordsOrSlugs).toHaveBeenCalled();
    expect((result.vocabList as Record<string, unknown>[])[0].word).toBe("猫");
  });

  it("hydrates kanji list", async () => {
    const mockKanji: HydrationKanjiRow[] = [{
      id: "k-1",
      character: "日",
      meaning: "Hari, Matahari",
      onyomi: "ニチ",
      kunyomi: "ひ",
      jlpt_level: "N5",
      slug: "nichi",
    }];

    const fetcher = createEmptyFetcher();
    (fetcher.fetchKanjiByCharacters as ReturnType<typeof vi.fn>).mockResolvedValue(mockKanji);

    const raw = createMinimalRawLesson({ kanji_list: ["日"] });
    const result = await hydrateLessonDetail(raw, fetcher);

    expect((result.kanjiList as Record<string, unknown>[])[0].character).toBe("日");
  });

  it("hydrates grammar list", async () => {
    const mockGrammar: HydrationGrammarRow[] = [{
      id: "g-1",
      title: "〜ます",
      meaning: "bentuk sopan",
      formation: "Verb-stem + ます",
      formation_furigana: null,
      slug: "masu",
      jlpt_level: "N5",
      examples: [{ japanese: "食べます", indonesian: "saya makan" }],
      notes: null,
    }];

    const fetcher = createEmptyFetcher();
    (fetcher.fetchGrammarByTitlesOrSlugs as ReturnType<typeof vi.fn>).mockResolvedValue(mockGrammar);

    const raw = createMinimalRawLesson({ grammar_list: ["〜ます"] });
    const result = await hydrateLessonDetail(raw, fetcher);

    expect((result.grammarList as Record<string, unknown>[])[0].title).toBe("〜ます");
  });

  it("normalizes quizzes with correctAnswer from correct_answer", async () => {
    const fetcher = createEmptyFetcher();
    const raw = createMinimalRawLesson({
      quizzes: [{ id: "q1", question: "Apa?", correct_answer: 2 }],
    });

    const result = await hydrateLessonDetail(raw, fetcher);
    const quiz = (result.quizzes as Record<string, unknown>[])?.[0];
    expect(quiz?.correctAnswer).toBe(2);
    expect(quiz?._id).toBe("q1");
  });

  it("sets empty relation lists for articles source table", async () => {
    const fetcher = createEmptyFetcher();
    const raw = createMinimalRawLesson({
      _sourceTable: "articles",
      vocab_list: ["should-be-ignored"],
    });

    const result = await hydrateLessonDetail(raw, fetcher);
    // Articles source table forces empty relation lists
    expect(fetcher.fetchVocabByIds).not.toHaveBeenCalled();
    expect(fetcher.fetchVocabByWordsOrSlugs).not.toHaveBeenCalled();
  });

  it("creates fallback items for unmatched vocab entries", async () => {
    const fetcher = createEmptyFetcher();
    // fetchVocabByWordsOrSlugs returns empty — no matches
    const raw = createMinimalRawLesson({ vocab_list: ["不明語"] });

    const result = await hydrateLessonDetail(raw, fetcher);
    const firstVocab = (result.vocabList as Record<string, unknown>[])[0];
    expect(firstVocab.word).toBe("不明語");
    expect(firstVocab.meaning).toBe("Detail pending...");
    expect((firstVocab._id as string).startsWith("temp-")).toBe(true);
  });

  it("handles dialogue field for listening hydration", async () => {
    const fetcher = createEmptyFetcher();
    const raw = createMinimalRawLesson({
      dialogue: [
        { text: "こんにちは", speaker: "田中", translation: "Halo" },
      ],
    });

    const result = await hydrateLessonDetail(raw, fetcher);
    expect(result.listeningList).toHaveLength(1);
    const listening = (result.listeningList as Record<string, unknown>[])[0];
    expect(listening.title).toBe("Skenario Percakapan");
  });

  it("parses markdown content into content_blocks", async () => {
    const fetcher = createEmptyFetcher();
    const raw = createMinimalRawLesson({
      content: "# Judul\n\nParagraf pertama.",
    });

    const result = await hydrateLessonDetail(raw, fetcher);
    expect(result.content_blocks).toHaveLength(2);
  });

  it("handles JSON string in vocab_list", async () => {
    const fetcher = createEmptyFetcher();
    const raw = createMinimalRawLesson({
      vocab_list: '["猫","犬"]' as unknown,
    });

    const result = await hydrateLessonDetail(raw, fetcher);
    expect(fetcher.fetchVocabByWordsOrSlugs).toHaveBeenCalled();
  });
});
