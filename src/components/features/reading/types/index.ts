/**
 * @file index.ts
 * @description Definisi tipe data (TypeScript) untuk fitur membaca mandiri dan visualisasi terjemahan artikel.
 */

// ==========================================
// TIPE DATA MODE & STATUS MEMBACA
// ==========================================

/**
 * Reading display mode. Control text representation.
 */
export type ReadingMode = "kanji" | "furigana" | "hiragana" | "romaji";

/**
 * State for reading interface. Track mode, translation, audio, source metadata.
 */
export interface ReadingState {
  /** Active reading mode */
  mode: ReadingMode;
  /** Toggle translation visibility */
  showTranslation: boolean;
  /** Optional audio source URL */
  audioUrl?: string;
  /** Text for text-to-speech engine */
  textToSpeak?: string;
  /** Flag to disable text-to-speech */
  isTTSDisabled?: boolean;
  /** Source identifier */
  sourceId?: string;
  /** Source display title */
  sourceTitle?: string;
  /** Source external link */
  sourceHref?: string;
}

// ==========================================
// TIPE DATA PORTABLE TEXT (SANITY CMS)
// ==========================================

/**
 * Child node in Sanity Portable Text. Represent text segment.
 */
export interface PortableTextChild {
  _key: string;
  _type: string;
  text: string;
  marks?: string[];
}

/**
 * Block node in Sanity Portable Text. Represent paragraph or list item.
 */
export interface PortableTextBlock {
  _key: string;
  _type: "block";
  children: PortableTextChild[];
  style?: string;
  list?: string;
}

/**
 * Content format for Sanity Portable Text. Raw string or block array.
 */
export type PortableTextContent = string | PortableTextBlock[];

// ==========================================
// INTERFACE ARTIKEL BACAAN (READING DATA)
// ==========================================

/**
 * Reading article data. Contain text variants, audio, metadata.
 */
export interface ReadingData {
  _id?: string;
  id?: string;
  slug?: string;
  title: string;
  difficulty: string;
  jlpt_level?: string;
  audioUrl?: string;
  isTTSDisabled?: boolean;
  /** Body text in kanji/mixed form */
  body: PortableTextContent;
  /** Body text in hiragana form */
  hiragana: PortableTextContent;
  /** Body text in romaji form */
  romaji?: PortableTextContent;
  /** Body text translation */
  translation: PortableTextContent;
  quizzes?: unknown[];
  illustrations?: { title?: string; content: string }[];
  /** Article cover image */
  image_url?: string | { _type: string; asset: { _type: string; _ref: string } };
}