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

export interface PaginatedVocabResponse {
  data: (VocabTable & { id: string; meaning: string })[];
  total: number;
}

export interface PaginatedKanjiResponse {
  data: (KanjiTable & { id: string; jlptLevel?: string })[];
  total: number;
}

export interface PaginatedListeningResponse {
  data: (ListeningMaterialTable & { id: string; audioUrl?: string; transcript?: string })[];
  total: number;
}

export interface ListeningTaskItem {
  id: string;
  title: string;
  slug: string;
  audioUrl?: string;
  transcript?: string;
}

export interface PaginatedReadingResponse {
  data: (ReadingMaterialTable & { id: string; difficulty?: string; body: string; category?: string })[];
  total: number;
}

export interface GrammarArticle {
  id: string;
  title: string;
  slug: string;
  jlptLevel?: string;
}export interface LibraryItem {
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
  mnemonics?: import("@/types/database").MnemonicBlock[] | string[] | null;
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
  conjugations?: Record<string, string | null>;
  negative?: string | null;
  past?: string | null;
  pastNegative?: string | null;
  teForm?: string | null;
  adverbial?: string | null;
  image_url?: string | null;
  imageUrl?: string | null;
  content_blocks?: unknown;
  vocab_list?: unknown;
  kanji_list?: unknown;
  grammar_list?: unknown;
  listening_list?: unknown;
  reading_list?: unknown;
  articles?: unknown;
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
  [key: string]: unknown;
}
