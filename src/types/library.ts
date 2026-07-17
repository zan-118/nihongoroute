/**
 * @file library.ts
 * @description Deklarasi tipe data TypeScript untuk modul perpustakaan luring-ready (pembagian paginasi data kosakata, kanji, materi menyimak, dan bacaan) guna menjamin integrasi antarmuka (UI) NihongoRoute.
 */

// ==========================================
// IMPORT & DEPENDENSI
// ==========================================
import { 
  VocabTable, 
  KanjiTable, 
  ReadingMaterialTable, 
  ListeningMaterialTable, 
  GrammarTable,
  LessonTable,
  ExamTable,
  LibraryContentAIResponse
} from "@/types/database";

// ==========================================
// DEKLARASI TIPE DATA PAGINASI & ITEM
// ==========================================

/**
 * Paginated vocabulary response.
 */
export interface PaginatedVocabResponse {
  /** Vocabulary list with ID and meaning */
  data: (VocabTable & { id: string; meaning: string })[];
  /** Total vocabulary count */
  total: number;
}

/**
 * Paginated kanji response.
 */
export interface PaginatedKanjiResponse {
  /** Kanji list with ID and optional JLPT level */
  data: (KanjiTable & { id: string; jlptLevel?: string })[];
  /** Total kanji count */
  total: number;
}

/**
 * Paginated listening response.
 */
export interface PaginatedListeningResponse {
  /** Listening materials with ID, audio URL, and transcript */
  data: (ListeningMaterialTable & { id: string; audioUrl?: string; transcript?: string })[];
  /** Total listening materials count */
  total: number;
}

/**
 * Listening task item.
 */
export interface ListeningTaskItem {
  id: string;
  title: string;
  slug: string;
  audioUrl?: string;
  transcript?: string;
}

/**
 * Paginated reading response.
 */
export interface PaginatedReadingResponse {
  /** Reading materials with ID, difficulty, body, and category */
  data: (ReadingMaterialTable & { id: string; difficulty?: string; body: string; category?: string })[];
  /** Total reading materials count */
  total: number;
}

/**
 * Grammar article item.
 */
export interface GrammarArticle {
  id: string;
  title: string;
  slug: string;
  jlptLevel?: string;
}

/**
 * Unified library item. Holds properties for vocabulary, kanji, grammar, listening, reading, and lessons.
 */
export interface LibraryItem {
  id?: string;
  _id?: string;
  character?: string;
  word?: string;
  meaning?: string;
  meaning_id?: string;
  title?: string | null;
  summary?: string | null;
  jlptLevel?: string | null;
  jlpt_level?: string | null;
  strokeOrderSvg?: string | null;
  stroke_order_svg?: string | null;
  onyomi?: string | null;
  kunyomi?: string | null;
  radicals?: string[] | null;
  // Support database mnemonic block structure or plain string array
  mnemonics?: import("@/types/database").MnemonicBlock[] | string[] | null;
  // Related vocabulary list
  relatedVocab?: {
    id: string;
    _id?: string;
    word: string;
    furigana: string;
    meaning: string;
    romaji?: string;
    slug?: string;
  }[] | null;
  pitchAccent?: string | null;
  pitch_accent?: string | null;
  usageNotes?: string | null;
  usage_notes?: string | null;
  notes?: string | null;
  formation?: string | null;
  relatedKanji?: unknown;
  synonyms?: unknown;
  antonyms?: unknown;
  examples?: unknown[] | null;
  // Verb/adjective conjugations map
  conjugations?: Record<string, string | null>;
  negative?: string | null;
  past?: string | null;
  pastNegative?: string | null;
  teForm?: string | null;
  adverbial?: string | null;
  image_url?: string | null;
  imageUrl?: string | null;
  content?: string | null;
  dialogue?: unknown;
  vocab_list?: unknown;
  kanji_list?: unknown;
  grammar_list?: unknown;
  listening_list?: unknown;
  reading_list?: unknown;
  articles?: unknown;
  // Quiz questions for lessons
  quizzes?: import("@/lib/utils/lesson-utils").RawQuizItem[] | null;
  questions?: import("@/lib/utils/lesson-utils").RawQuizItem[] | null;
  vocabList?: unknown[];
  kanjiList?: unknown[];
  grammarList?: unknown[];
  listeningList?: unknown[];
  readingList?: unknown[];
  seoTitle?: string | null;
  seoDescription?: string | null;
  levelCode?: string | null;
  grammar_family?: string | null;
  related_grammar?: string[] | null;
  familyGrammarList?: Record<string, unknown>[] | null;
  relatedGrammarList?: Record<string, unknown>[] | null;
  // Catch-all for dynamic properties
  [key: string]: unknown;
}