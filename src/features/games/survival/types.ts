/**
 * @file types.ts
 * @description Deklarasi tipe data dan antarmuka untuk data kartu kosakata dan status permainan bertema kelangsungan hidup (Survival Mode).
 */

// ANTARMUKA & TIPE

/**
 * Vocabulary card data structure.
 */
export interface CardData {
 /** Unique identifier. */
 id: string;
 /** Japanese word text. */
 word: string;
 /** Shorthand meaning dari meanings_jmdict[0].glosses[0] */
 meaning: string;
 /** Romaji reading. */
 romaji?: string | null;
 /** Furigana reading. */
 furigana?: string | null;
 /** JLPT level. */
 jlpt_level?: string | null;
 /** Part of speech tags. */
 hinshi?: string[] | null;
 /** Card type classification. */
 type?: string;
}

/**
 * Game state options for survival mode.
 */
export type SurvivalGameState = "idle" | "playing" | "gameover" | "victory";