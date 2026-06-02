/**
 * @file index.ts
 * @description Definisi tipe data (TypeScript) untuk fitur membaca mandiri dan visualisasi terjemahan artikel.
 */

// ==========================================
// TIPE DATA MODE & STATUS MEMBACA
// ==========================================
export type ReadingMode = "kanji" | "furigana" | "hiragana" | "romaji";

export interface ReadingState {
  mode: ReadingMode;
  showTranslation: boolean;
  audioUrl?: string;
  textToSpeak?: string;
  isTTSDisabled?: boolean;
}

// ==========================================
// TIPE DATA PORTABLE TEXT (SANITY CMS)
// ==========================================
export interface PortableTextChild {
  _key: string;
  _type: string;
  text: string;
  marks?: string[];
}

export interface PortableTextBlock {
  _key: string;
  _type: "block";
  children: PortableTextChild[];
  style?: string;
  list?: string;
}

export type PortableTextContent = string | PortableTextBlock[];

// ==========================================
// INTERFACE ARTIKEL BACAAN (READING DATA)
// ==========================================
export interface ReadingData {
  _id?: string;
  id?: string;
  title: string;
  difficulty: string;
  audioUrl?: string;
  isTTSDisabled?: boolean;
  body: PortableTextContent;
  hiragana: PortableTextContent;
  romaji?: PortableTextContent;
  translation: PortableTextContent;
  quizzes?: unknown[];
}
