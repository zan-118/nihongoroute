/**
 * @file index.ts
 * @description Definisi tipe data (TypeScript) untuk fitur visualisasi coretan dan informasi detail Kanji.
 */

// ==========================================
// TIPE DATA GORESAN & SVG KANJI
// ==========================================

/**
 * Individual stroke path data.
 */
export interface StrokeData {
  /** SVG path data string. */
  path: string;
  /** Zero-based stroke order index. */
  index: number;
}

/**
 * SVG structure for rendering kanji strokes.
 */
export interface KanjiSvgData {
  /** Target kanji character. */
  character: string;
  /** List of stroke paths. */
  strokes: StrokeData[];
  /** Coordinates for stroke order numbers. */
  numbers: { x: string; y: string; value: string }[];
  /** SVG viewBox attribute value. */
  viewBox: string;
}

// ==========================================
// TIPE DATA PENGENDALI PEMUTARAN (PLAYBACK)
// ==========================================

/**
 * Stroke animation playback state.
 */
export type PlaybackStatus = "playing" | "paused" | "finished";

/**
 * Animation playback controller state.
 */
export interface KanjiPlaybackControl {
  /** Current playback status. */
  status: PlaybackStatus;
  /** Animation speed multiplier. */
  speed: number;
  /** Index of active stroke. */
  currentStrokeIndex: number;
  /** Toggle visibility of stroke numbers. */
  showNumbers: boolean;
}

// ==========================================
// TIPE DATA DETAIL KANJI
// ==========================================

/**
 * Detailed kanji metadata.
 */
export interface KanjiDetail {
  /** Database identifier. */
  _id: string;
  /** Target kanji character. */
  character: string;
  /** English meaning. */
  meaning: string;
  /** Onyomi reading in katakana. */
  onyomi?: string;
  /** Kunyomi reading in hiragana. */
  kunyomi?: string;
  /** JLPT level. */
  jlpt?: string;
  /** URL slug. */
  slug: string;
  /** Usage examples. */
  examples?: string[];
  /** Raw SVG string for stroke order. */
  strokeOrderSvg?: string;
  /** Radical components. */
  radicals?: string[];
  /** Mnemonic data in Portable Text format. */
  mnemonics?: unknown; // Portable Text
}