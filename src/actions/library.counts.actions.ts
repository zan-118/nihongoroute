/**
 * @file library.counts.actions.ts
 * @description Server Actions untuk mengambil jumlah item aktual dari seluruh kategori pustaka.
 * Mengambil data leksikal (vocab, kanji, grammar) dari Supabase dan konten editorial
 * (reading, listening, exams) dari Sanity CMS secara paralel.
 */

"use server";

// ======================
// IMPORTS
// ======================
import { createStaticClient } from "@/lib/supabase/server";
import { sanityClient } from "@/lib/sanity.client";

// ======================
// TYPES
// ======================
export interface LibraryCounts {
  vocab: number;
  kanji: number;
  grammar: number;
  reading: number;
  listening: number;
  exams: number;
}

// ======================
// SERVER ACTIONS
// ======================

/**
 * Mengambil jumlah item nyata dari tabel leksikal Supabase dan konten editorial Sanity CMS secara paralel.
 */
export async function getLibraryCounts(): Promise<LibraryCounts> {
  const supabase = createStaticClient();

  const [
    vocabResult,
    kanjiResult,
    grammarResult,
    readingCount,
    listeningCount,
    examsCount
  ] = await Promise.all([
    supabase.from("vocab").select("*", { count: "exact", head: true }),
    supabase.from("kanji").select("*", { count: "exact", head: true }),
    supabase.from("grammar").select("*", { count: "exact", head: true }),
    sanityClient.fetch<number>('count(*[_type == "readingMaterial"])', {}, { cache: "no-store" }).catch(() => 0),
    sanityClient.fetch<number>('count(*[_type == "listeningMaterial"])', {}, { cache: "no-store" }).catch(() => 0),
    sanityClient.fetch<number>('count(*[_type == "mockExam" && is_published == true])', {}, { cache: "no-store" }).catch(() => 0),
  ]);

  return {
    vocab: vocabResult.count ?? 0,
    kanji: kanjiResult.count ?? 0,
    grammar: grammarResult.count ?? 0,
    reading: readingCount ?? 0,
    listening: listeningCount ?? 0,
    exams: examsCount ?? 0,
  };
}
