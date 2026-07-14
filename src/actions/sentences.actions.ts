/**
 * @file sentences.actions.ts
 * @description Server Actions terpusat untuk mengambil data kalimat contoh (sentences)
 * dari Supabase. Menyediakan fungsi pengambilan acak, pencarian berdasarkan kata/kanji,
 * dan filter level JLPT — digunakan oleh mini drill, flashcard, grammar detail,
 * kanji detail, dan vocab detail.
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
 * Database sentence record structure.
 */
export interface SentenceRow {
  id: string;
  japanese: string;
  english: string | null;
  indonesia: string | null;
  jlpt_level: string | null;
  furigana: string | null;
}

/**
 * Sentence structure formatted for drill UI.
 */
export interface SentenceDrillItem {
  id: string;
  japanese: string;
  translation: string;
  jlpt_level: string | null;
  furigana: string | null;
}

// ======================
// SERVER ACTIONS
// ======================

/**
 * Mengambil kalimat contoh yang mengandung kata tertentu.
 *
 * @param word - Kata/karakter yang dicari di kolom japanese
 * @param limit - Jumlah maksimal kalimat yang dikembalikan
 * @returns Array SentenceRow yang cocok
 */
export async function getSentencesByWord(
  word: string,
  limit: number = 5
): Promise<SentenceRow[]> {
  // Return empty if query blank.
  if (!word.trim()) return [];

  // Init Supabase client.
  const supabase = createStaticClient();

  // Fetch matching sentences from DB.
  const { data, error } = await supabase
    .from("sentences")
    .select("id, japanese, english, indonesia, jlpt_level, furigana")
    .like("japanese", `%${word.trim()}%`)
    .limit(limit);

  if (error) {
    console.error(`[getSentencesByWord] Gagal mengambil kalimat untuk "${word}":`, error.message);
    return [];
  }

  return (data || []) as SentenceRow[];
}

/**
 * Mengambil kalimat acak untuk mini drill dan flashcard mode.
 * Mengembalikan hanya kalimat yang memiliki terjemahan (indonesia atau english).
 *
 * @param level - Filter JLPT level opsional (misal: "N5", "N4")
 * @param limit - Jumlah kalimat yang dikembalikan
 * @returns Array SentenceDrillItem siap pakai untuk drill/flashcard
 */
export async function getRandomSentencesForDrill(
  level: string = "",
  limit: number = 30
): Promise<SentenceDrillItem[]> {
  const supabase = createStaticClient();

  // Get larger pool for random mix.
  const poolSize = Math.min(limit * 4, 200);

  // Build base query.
  let query = supabase
    .from("sentences")
    .select("id, japanese, english, indonesia, jlpt_level, furigana")
    .not("japanese", "is", null);

  // Filter by JLPT level if set.
  if (level && level !== "all") {
    query = query.eq("jlpt_level", level.toUpperCase());
  }

  // Require translation text.
  query = query.or("indonesia.neq.null,english.neq.null");

  // Fetch pool from DB.
  const { data, error } = await query.limit(poolSize);

  if (error) {
    console.error("[getRandomSentencesForDrill] Gagal mengambil kalimat:", error.message);
    return [];
  }

  if (!data || data.length === 0) return [];

  // Shuffle pool using Fisher-Yates.
  const shuffled = [...data];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // Slice to limit and map to drill format.
  return shuffled.slice(0, limit).map((row) => ({
    id: row.id,
    japanese: row.japanese,
    translation: (row.indonesia as string | null) || (row.english as string | null) || "",
    jlpt_level: row.jlpt_level as string | null,
    furigana: row.furigana as string | null,
  }));
}

/**
 * Mengambil kalimat contoh yang mengandung pola grammar tertentu.
 *
 * @param pattern - Pola grammar (misal: "ている", "なければ")
 * @param limit - Jumlah maksimal kalimat
 * @returns Array SentenceRow yang cocok
 */
export async function getSentencesByGrammarPattern(
  pattern: string,
  limit: number = 4
): Promise<SentenceRow[]> {
  // Return empty if pattern blank.
  if (!pattern.trim()) return [];

  const supabase = createStaticClient();

  // Fetch sentences containing pattern.
  const { data, error } = await supabase
    .from("sentences")
    .select("id, japanese, english, indonesia, jlpt_level, furigana")
    .like("japanese", `%${pattern.trim()}%`)
    .limit(limit);

  if (error) {
    console.error(`[getSentencesByGrammarPattern] Gagal mengambil kalimat untuk "${pattern}":`, error.message);
    return [];
  }

  return (data || []) as SentenceRow[];
}

/**
 * Mengambil kalimat contoh yang mengandung karakter kanji tertentu.
 *
 * @param character - Karakter kanji tunggal
 * @param limit - Jumlah maksimal kalimat
 * @returns Array SentenceRow yang cocok
 */
export async function getSentencesByKanji(
  character: string,
  limit: number = 4
): Promise<SentenceRow[]> {
  // Return empty if kanji blank.
  if (!character.trim()) return [];

  const supabase = createStaticClient();

  // Fetch sentences containing kanji.
  const { data, error } = await supabase
    .from("sentences")
    .select("id, japanese, english, indonesia, jlpt_level, furigana")
    .like("japanese", `%${character.trim()}%`)
    .limit(limit);

  if (error) {
    console.error(`[getSentencesByKanji] Gagal mengambil kalimat untuk "${character}":`, error.message);
    return [];
  }

  return (data || []) as SentenceRow[];
}