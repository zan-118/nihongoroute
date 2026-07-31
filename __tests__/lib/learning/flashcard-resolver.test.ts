/**
 * @file flashcard-resolver.test.ts
 * @description Unit test untuk FlashcardResolver — menguji klasifikasi ID,
 * pemformatan kartu vocab, romaji, kanji, dan pengurutan berdasarkan requested order.
 */

import { describe, it, expect } from "vitest";
import {
  classifyFlashcardIds,
  formatVocabCards,
  formatRomajiVocabs,
  formatKanjiCards,
  sortCardsByRequestedOrder,
  type FormattedCard,
} from "@/lib/learning/flashcard-resolver";

describe("FlashcardResolver", () => {
  describe("classifyFlashcardIds", () => {
    it("classifies UUIDs, legacy romaji IDs, kanji characters, and slugs correctly", () => {
      const ids = [
        "f57f436a-80ad-46b3-841d-40cdcf9473d6",
        "n5-verb-taberu",
        "日",
        "taberu-slug",
      ];

      const result = classifyFlashcardIds(ids);

      expect(result.uuids).toEqual(["f57f436a-80ad-46b3-841d-40cdcf9473d6"]);
      expect(result.romajis).toEqual(["taberu"]);
      expect(result.kanjiChars).toEqual(["日"]);
      expect(result.slugs).toEqual(["taberu-slug"]);
    });

    it("strips POS prefixes from legacy romaji IDs", () => {
      const ids = ["n4-pre-noun-adjectival-kono", "n5-noun-hon"];
      const result = classifyFlashcardIds(ids);

      expect(result.romajis).toEqual(["kono", "hon"]);
    });
  });

  describe("formatVocabCards", () => {
    it("formats raw vocab row into FormattedCard", () => {
      const raw = [
        {
          id: "v-1",
          word: "食べる",
          meaning: "makan",
          romaji: "taberu",
          furigana: "たべる",
          jlpt_level: "N5",
          examples: [{ japanese: "ご飯を食べる", indonesian: "makan nasi" }],
          mnemonic: "Mnemonic test",
          usage_notes: "Notes",
          pitch_accent: "1",
          hinshi: "verb",
        },
      ];

      const formatted = formatVocabCards(raw);

      expect(formatted).toHaveLength(1);
      expect(formatted[0]).toEqual({
        _id: "v-1",
        id: "v-1",
        word: "食べる",
        meaning: "makan",
        romaji: "taberu",
        furigana: "たべる",
        jlptLevel: "N5",
        examples: [{ japanese: "ご飯を食べる", indonesian: "makan nasi" }],
        mnemonic: "Mnemonic test",
        usageNotes: "Notes",
        pitchAccent: "1",
        hinshi: "verb",
        category: "vocab",
        docType: "vocab",
      });
    });
  });

  describe("formatRomajiVocabs", () => {
    it("matches legacy IDs with romaji records", () => {
      const raw = [
        {
          id: "v-real-id",
          word: "本",
          meaning: "buku",
          romaji: "hon",
          furigana: "ほん",
          jlpt_level: "N5",
        },
      ];

      const requestedIds = ["n5-noun-hon"];
      const formatted = formatRomajiVocabs(raw, requestedIds);

      expect(formatted).toHaveLength(1);
      expect(formatted[0].id).toBe("n5-noun-hon");
      expect(formatted[0].word).toBe("本");
    });
  });

  describe("formatKanjiCards", () => {
    it("formats raw kanji row into FormattedCard with kanjiDetails", () => {
      const raw = [
        {
          id: "k-1",
          character: "水",
          meaning: "air",
          onyomi: "SUI",
          kunyomi: "mizu",
          jlpt_level: "N5",
          mnemonics: ["Air mengalir", "Garis air"],
          examples: [{ japanese: "水を飲む", indonesian: "minum air" }],
        },
      ];

      const formatted = formatKanjiCards(raw);

      expect(formatted).toHaveLength(1);
      expect(formatted[0].word).toBe("水");
      expect(formatted[0].category).toBe("kanji");
      expect(formatted[0].mnemonic).toBe("Air mengalir\nGaris air");
      expect(formatted[0].kanjiDetails).toEqual({
        onyomi: "SUI",
        kunyomi: "mizu",
      });
    });
  });

  describe("sortCardsByRequestedOrder", () => {
    it("sorts cards based on requested ID order", () => {
      const cards: FormattedCard[] = [
        { id: "id-b", word: "B", meaning: "b", category: "vocab", docType: "vocab" },
        { id: "id-a", word: "A", meaning: "a", category: "vocab", docType: "vocab" },
      ];

      const sorted = sortCardsByRequestedOrder(cards, ["id-a", "id-b"]);

      expect(sorted[0].id).toBe("id-a");
      expect(sorted[1].id).toBe("id-b");
    });
  });
});
