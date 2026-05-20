"use server";

import { createClient } from "@/lib/supabase/server";

export interface LibraryCounts {
  vocab: number;
  kanji: number;
  grammar: number;
}

/**
 * Mengambil jumlah item nyata dari tabel leksikal Supabase secara paralel.
 * Hanya untuk tabel vocab, kanji, dan grammar.
 * Konten editorial (reading, listening, exams) berasal dari Sanity CMS.
 */
export async function getLibraryCounts(): Promise<LibraryCounts> {
  const supabase = await createClient();

  const [vocabResult, kanjiResult, grammarResult] = await Promise.all([
    supabase.from("vocab").select("*", { count: "exact", head: true }),
    supabase.from("kanji").select("*", { count: "exact", head: true }),
    supabase.from("grammar").select("*", { count: "exact", head: true }),
  ]);

  return {
    vocab: vocabResult.count ?? 0,
    kanji: kanjiResult.count ?? 0,
    grammar: grammarResult.count ?? 0,
  };
}
