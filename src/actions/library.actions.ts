/**
 * @file library.actions.ts
 * @description Berkas penghubung (barrel/hub) untuk semua Server Actions yang berkaitan dengan pustaka (library).
 * Pernyataan "use server" tidak disertakan di sini agar ekspor tipe data antarmuka tetap bisa dilakukan.
 * Masing-masing berkas aksi individu sudah memiliki deklarasi "use server" di baris paling atas.
 */

import { getLibraryKanjiDetail } from "./kanji.actions";
import { getLibraryVocabDetail } from "./vocab.actions";
import { getLibraryGrammarDetail } from "./grammar.actions";
import { getLibraryReadingDetail } from "./reading.actions";
import { getLibraryListeningDetail } from "./listening.actions";
import { getLibraryLessonDetail } from "./lessons.actions";
import { getLibraryExamDetail } from "./exams.actions";
import { LibraryItem } from "@/types/library";

// ======================
// RE-EXPORTS
// ======================

export * from "@/types/library";
export * from "./kanji.actions";
export * from "./vocab.actions";
export * from "./grammar.actions";
export * from "./reading.actions";
export * from "./listening.actions";
export * from "./lessons.actions";
export * from "./exams.actions";
export * from "./jlpt-exams.actions";
export * from "./cheatsheets.actions";

/**
 * Berkas router helper untuk backward compatibility / penyamaan antarmuka detail library.
 */
export async function getLibraryItemBySlug(
  type: "kanji" | "vocab" | "verb" | "adjective" | "grammar" | "reading" | "listening" | "lessons" | "exams" | "phrase",
  slugOrId: string
): Promise<LibraryItem | null> {
  switch (type) {
    case "kanji":
      return getLibraryKanjiDetail(slugOrId);
    case "vocab":
    case "verb":
    case "adjective":
    case "phrase":
      return getLibraryVocabDetail(slugOrId);
    case "grammar":
      return getLibraryGrammarDetail(slugOrId);
    case "reading":
      return getLibraryReadingDetail(slugOrId);
    case "listening":
      return getLibraryListeningDetail(slugOrId);
    case "lessons":
      return getLibraryLessonDetail(slugOrId);
    case "exams":
      return getLibraryExamDetail(slugOrId);
    default:
      return null;
  }
}
