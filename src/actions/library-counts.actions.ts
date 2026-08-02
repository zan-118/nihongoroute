/**
 * @file library-counts.actions.ts
 * @description Server Actions untuk mengambil jumlah item aktual dari seluruh kategori pustaka.
 * Mengambil seluruh data leksikal dan editorial (vocab, kanji, grammar, reading, listening, exams) dari Supabase.
 */

"use server";

// ======================
// IMPORTS
// ======================
import { createStaticClient } from "@/lib/supabase/server";

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
 * Query Supabase in parallel for speed.
 * 
 * @returns Promise resolving to library counts.
 */
export async function getLibraryCounts(): Promise<LibraryCounts> {
 const supabase = createStaticClient();

 // Query Supabase in parallel for speed.
 const [
 vocabResult,
 kanjiResult,
 grammarResult,
 readingResult,
 listeningResult,
 examsResult
 ] = await Promise.all([
 // Use head query to get count without data payload.
 supabase.from("vocab").select("*", { count: "exact", head: true }),
 supabase.from("kanji").select("*", { count: "exact", head: true }),
 supabase.from("grammar").select("*", { count: "exact", head: true }),
 supabase.from("reading").select("*", { count: "exact", head: true }),
 supabase.from("listening").select("*", { count: "exact", head: true }),
 supabase.from("jlpt_exam_templates").select("*", { count: "exact", head: true }).eq("is_published", true),
 ]);

 return {
 vocab: vocabResult.count ?? 0,
 kanji: kanjiResult.count ?? 0,
 grammar: grammarResult.count ?? 0,
 reading: readingResult.count ?? 0,
 listening: listeningResult.count ?? 0,
 exams: examsResult.count ?? 0,
 };
}