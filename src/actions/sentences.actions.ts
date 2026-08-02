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
import {
 getSentencesContainingWord,
 getRandomSentencesPool
} from "@/lib/services/content-repository";

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

 try {
 const data = await getSentencesContainingWord(word, limit);
 return data as SentenceRow[];
 } catch (error) {
 const message = error instanceof Error ? error.message : String(error);
 console.error(`[getSentencesByWord] Gagal mengambil kalimat untuk "${word}":`, message);
 return [];
 }
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
 // Get larger pool for random mix.
 const poolSize = Math.min(limit * 4, 200);

 try {
 const data = await getRandomSentencesPool(level, poolSize);
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
 } catch (error) {
 const message = error instanceof Error ? error.message : String(error);
 console.error("[getRandomSentencesForDrill] Gagal mengambil kalimat:", message);
 return [];
 }
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

 try {
 const data = await getSentencesContainingWord(pattern, limit);
 return data as SentenceRow[];
 } catch (error) {
 const message = error instanceof Error ? error.message : String(error);
 console.error(`[getSentencesByGrammarPattern] Gagal mengambil kalimat untuk "${pattern}":`, message);
 return [];
 }
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

 try {
 const data = await getSentencesContainingWord(character, limit);
 return data as SentenceRow[];
 } catch (error) {
 const message = error instanceof Error ? error.message : String(error);
 console.error(`[getSentencesByKanji] Gagal mengambil kalimat untuk "${character}":`, message);
 return [];
 }
}