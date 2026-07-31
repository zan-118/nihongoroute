/**
 * @file srs-review.ts
 * @description Deklarasi tipe data dan antarmuka kartu flashcard untuk kebutuhan ulasan hafalan (SRS Review Session).
 */

// ======================
// ANTARMUKA & TIPE
// ======================

/**
 * Flashcard data structure for SRS review.
 */
export interface FlashcardType {
  /** Unique identifier. */
  id: string;
  /** Target Japanese word. */
  word: string;
  /** Shorthand meaning dari meanings_jmdict[0].glosses[0] */
  meaning: string;
  /** Kana reading. */
  furigana?: string | null;
  /** Latin alphabet reading. */
  romaji?: string | null;
  /** URL slug. */
  slug?: string;
  /** JLPT level. */
  jlpt_level?: string | null;
  /** Audio file link. */
  audio_url?: string | null;
  /** Part of speech tags. */
  hinshi?: string[] | null;
  /** Memory aid. */
  mnemonic?: string | null;
  /** Example sentences with translations. */
  examples?: Array<{ japanese: string; indonesian: string }> | null;
}
