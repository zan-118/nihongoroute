/**
 * @file dictionary.actions.ts
 * @description Server Actions for lexical search queries in NihongoRoute Integrated Dictionary.
 */

"use server";

import { createStaticClient } from "@/lib/supabase/server";
import { toHiragana } from "wanakana";
import { logger } from "@/lib/core/logger";

export interface SerializedSearchItem {
 id: string;
 title: string;
 description: string;
 href: string;
 category: "vocab" | "grammar" | "kanji";
 jlptLevel?: string | null;
 reading?: string | null;
 romaji?: string | null;
 slug?: string | null;
 hinshi?: string[] | null;
 formation?: string | null;
 isCommon?: boolean | null;
}

export interface SerializedSearchResult {
 vocab: SerializedSearchItem[];
 grammar: SerializedSearchItem[];
 kanji: SerializedSearchItem[];
}

/**
 * Hasil lookup satu kata untuk popup dictionary (Smart Jisho / WordPopover).
 */
export interface DictionaryLookupResult {
 id?: string;
 slug?: string | null;
 word: string;
 furigana?: string | null;
 romaji?: string | null;
 meaning: string;
 jlpt?: string | null;
 hinshi?: string[] | null;
}

/**
 * Server action untuk mencari satu kata di tabel vocab.
 * Exact match dulu (word/furigana), lalu fallback ke substring (ilike).
 *
 * @param text - Kata Jepang yang dipilih pengguna.
 * @returns Hasil lookup pertama atau null jika tidak ditemukan.
 */
export async function lookupDictionaryWordAction(text: string): Promise<DictionaryLookupResult | null> {
 const normalized = text?.trim();
 if (!normalized || normalized.length > 30) return null;

 const supabase = createStaticClient();

 // 1. Cari kecocokan eksak pada word atau furigana.
 let { data, error } = await supabase
  .from("vocab")
  .select("id, slug, word, furigana, romaji, meaning_id, jlpt_level, hinshi")
  .or(`word.eq.${normalized},furigana.eq.${normalized}`)
  .limit(1)
  .maybeSingle();

 if (error) {
  logger.error("[lookupDictionaryWordAction] Query exact match gagal:", error);
  return null;
 }

 // 2. Jika tidak ditemukan, coba substring (ilike).
 if (!data) {
  const safeQuery = escapePostgrestLike(normalized);
  const term = `%${safeQuery}%`;
  const { data: list, error: listError } = await supabase
   .from("vocab")
   .select("id, slug, word, furigana, romaji, meaning_id, jlpt_level, hinshi")
   .or(`word.ilike."${term}",furigana.ilike."${term}"`)
   .limit(1);

  if (listError) {
   logger.error("[lookupDictionaryWordAction] Query substring gagal:", listError);
   return null;
  }
  data = list?.[0] || null;
 }

 if (!data) return null;

 return {
  id: data.id,
  slug: data.slug || data.word || data.id,
  word: data.word,
  furigana: data.furigana,
  romaji: data.romaji,
  meaning: data.meaning_id || "",
  jlpt: data.jlpt_level,
  hinshi: Array.isArray(data.hinshi) ? data.hinshi : null,
 };
}

/**
 * Escape special characters for PostgREST ILIKE queries.
 * @param value Search query string.
 */
function escapePostgrestLike(value: string): string {
 return value
 .replace(/\\/g, "\\\\")
 .replace(/%/g, "\\%")
 .replace(/_/g, "\\_")
 .replace(/"/g, "")
 .replace(/,/g, " ");
}

/**
 * Server action to search vocab, grammar, and kanji tables in Supabase.
 * 
 * @param query - Raw search query string.
 * @param limitPerType - Maximum results per category.
 * @returns Grouped search results.
 */
export async function searchToolDictionaryAction(
 query: string,
 limitPerType: number = 8
): Promise<SerializedSearchResult> {
 const normalizedQuery = query.trim();
 if (!normalizedQuery) {
 return { vocab: [], grammar: [], kanji: [] };
 }

 const supabase = createStaticClient();
 const safeQuery = escapePostgrestLike(normalizedQuery);
 const kanaQuery = escapePostgrestLike(toHiragana(normalizedQuery));
 const searchTerm = `%${safeQuery}%`;
 const kanaTerm = `%${kanaQuery}%`;

 try {
 const [vocabRes, grammarRes, kanjiRes] = await Promise.all([
 supabase
 .from("vocab")
 .select("id, word, meaning_id, furigana, romaji, hinshi, jlpt_level, slug, is_common")
 .or(
 `word.ilike."${searchTerm}",meaning_id.ilike."${searchTerm}",romaji.ilike."${searchTerm}",furigana.ilike."${searchTerm}",word.ilike."${kanaTerm}",furigana.ilike."${kanaTerm}"`
 )
 .limit(limitPerType),
 supabase
 .from("grammar")
 .select("id, title, slug, meaning, jlpt_level, formation")
 .or(`title.ilike."${searchTerm}",slug.ilike."${searchTerm}",meaning.ilike."${searchTerm}",formation.ilike."${searchTerm}"`)
 .limit(Math.max(3, Math.min(limitPerType, 6))),
 supabase
 .from("kanji")
 .select("id, character, meaning, onyomi, kunyomi, romaji, jlpt_level, slug")
 .or(
 `character.ilike."${searchTerm}",meaning.ilike."${searchTerm}",onyomi.ilike."${searchTerm}",kunyomi.ilike."${searchTerm}",romaji.ilike."${searchTerm}",character.ilike."${kanaTerm}",onyomi.ilike."${kanaTerm}",kunyomi.ilike."${kanaTerm}"`
 )
 .limit(Math.max(3, Math.min(limitPerType, 6))),
 ]);

 if (vocabRes.error) throw vocabRes.error;
 if (grammarRes.error) throw grammarRes.error;
 if (kanjiRes.error) throw kanjiRes.error;

 return {
 vocab: (vocabRes.data || []).map((item) => ({
 id: item.id,
 title: item.word || "",
 description: item.meaning_id || "Kosakata",
 href: `/library/vocab/${item.slug || item.id}`,
 category: "vocab" as const,
 jlptLevel: item.jlpt_level,
 reading: item.furigana,
 romaji: item.romaji,
 slug: item.slug,
 hinshi: item.hinshi,
 isCommon: item.is_common,
 })),
 grammar: (grammarRes.data || []).map((item) => ({
 id: item.id,
 title: item.title || "",
 description: item.meaning || "Tata Bahasa",
 href: `/library/grammar/${item.slug || item.id}`,
 category: "grammar" as const,
 jlptLevel: item.jlpt_level,
 formation: item.formation,
 slug: item.slug,
 })),
 kanji: (kanjiRes.data || []).map((item) => ({
 id: item.id,
 title: item.character || "",
 description: item.meaning || "Kanji",
 href: `/library/kanji/${item.slug || item.id}`,
 category: "kanji" as const,
 jlptLevel: item.jlpt_level,
 reading: item.kunyomi || item.onyomi || undefined,
 romaji: item.romaji,
 slug: item.slug,
 })),
 };
 } catch (error) {
 logger.error("[searchToolDictionaryAction] Gagal mencari di database:", error);
 return { vocab: [], grammar: [], kanji: [] };
 }
}
