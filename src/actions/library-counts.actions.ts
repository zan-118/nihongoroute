/**
 * @file library-counts.actions.ts
 * @description Server Actions untuk mengambil jumlah item aktual dari seluruh kategori pustaka.
 * Mengambil data leksikal (vocab, kanji, grammar) dari Supabase dan konten editorial
 * (reading, listening, exams) dari Sanity CMS secara paralel.
 */

"use server";

// ======================
// IMPORTS
// ======================
import { createStaticClient } from "@/lib/supabase/server";
import { sanityClient, sanityPublicFetchOptions } from "@/lib/sanity.client";

// ======================
// TYPES
// ======================

/**
 * Library item counts.
 */
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
 * Fetch library item counts.
 * Query Supabase and Sanity CMS in parallel.
 * 
 * @returns Promise resolving to library counts.
 */
export async function getLibraryCounts(): Promise<LibraryCounts> {
  const supabase = createStaticClient();

  // Query Supabase and Sanity in parallel for speed.
  const [
    vocabResult,
    kanjiResult,
    grammarResult,
    readingCount,
    listeningCount,
    examsCount
  ] = await Promise.all([
    // Use head query to get count without data payload.
    supabase.from("vocab").select("*", { count: "exact", head: true }),
    supabase.from("kanji").select("*", { count: "exact", head: true }),
    supabase.from("grammar").select("*", { count: "exact", head: true }),
    // Query Sanity document count. Fallback to 0 if query fail.
    sanityClient.fetch<number>('count(*[_type == "readingMaterial"])', {}, sanityPublicFetchOptions).catch(() => 0),
    sanityClient.fetch<number>('count(*[_type == "listeningMaterial"])', {}, sanityPublicFetchOptions).catch(() => 0),
    sanityClient.fetch<number>('count(*[_type == "mockExam" && is_published == true])', {}, sanityPublicFetchOptions).catch(() => 0),
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