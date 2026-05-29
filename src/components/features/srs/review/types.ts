/**
 * @file types.ts
 * @description Deklarasi tipe data dan antarmuka kartu flashcard untuk kebutuhan ulasan hafalan (SRS Review Session).
 */

// ======================
// ANTARMUKA & TIPE
// ======================
export interface FlashcardType {
  id: string;
  word: string;
  /** Shorthand meaning dari meanings_jmdict[0].glosses[0] */
  meaning: string;
  furigana?: string | null;
  romaji?: string | null;
  slug?: string;
  jlpt_level?: string | null;
  audio_url?: string | null;
  hinshi?: string[] | null;
  mnemonic?: string | null;
  examples?: Array<{ japanese: string; indonesian: string }> | null;
}
