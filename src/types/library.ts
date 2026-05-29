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
}


