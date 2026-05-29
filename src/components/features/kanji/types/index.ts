/**
 * @file index.ts
 * @description Definisi tipe data (TypeScript) untuk fitur visualisasi coretan dan informasi detail Kanji.
 */

// ==========================================
// TIPE DATA GORESAN & SVG KANJI
// ==========================================
export interface StrokeData {
  path: string;
  index: number;
}

export interface KanjiSvgData {
  character: string;
  strokes: StrokeData[];
  numbers: { x: string; y: string; value: string }[];
  viewBox: string;
}

// ==========================================
// TIPE DATA PENGENDALI PEMUTARAN (PLAYBACK)
// ==========================================
export type PlaybackStatus = "playing" | "paused" | "finished";

export interface KanjiPlaybackControl {
  status: PlaybackStatus;
  speed: number;
  currentStrokeIndex: number;
  showNumbers: boolean;
}

// ==========================================
// TIPE DATA DETAIL KANJI
// ==========================================
export interface KanjiDetail {
  _id: string;
  character: string;
  meaning: string;
  onyomi?: string;
  kunyomi?: string;
  jlpt?: string;
  slug: string;
  examples?: string[];
  strokeOrderSvg?: string;
  radicals?: string[];
  mnemonics?: unknown; // Portable Text

}
