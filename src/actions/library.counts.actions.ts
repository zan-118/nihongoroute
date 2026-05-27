"use server";

import { createClient } from "@/lib/supabase/server";
import { sanityClient } from "@/lib/sanity.client";

export interface LibraryCounts {
  vocab: number;
  kanji: number;
  grammar: number;
  reading: number;
  listening: number;
  exams: number;
}

/**
 * Mengambil jumlah item nyata dari tabel leksikal Supabase dan konten editorial Sanity CMS secara paralel.
 */
export async function getLibraryCounts(): Promise<LibraryCounts> {
  const supabase = await createClient();

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
    sanityClient.fetch<number>('count(*[_type == "readingMaterial"])').catch(() => 0),
    sanityClient.fetch<number>('count(*[_type == "listeningMaterial"])').catch(() => 0),
    sanityClient.fetch<number>('count(*[_type == "mockExam" && is_published == true])').catch(() => 0),
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
