/**
 * @file dictionary.actions.ts
 * @description Server Actions untuk pencarian leksikal pada Kamus Terpadu NihongoRoute.
 */

"use server";

import { createStaticClient } from "@/lib/supabase/server";
import { toHiragana } from "wanakana";

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
        .select("id, word, meaning:meaning_id, furigana, romaji, hinshi, jlpt_level, slug, is_common")
        .or(
          `word.ilike."${searchTerm}",meaning.ilike."${searchTerm}",romaji.ilike."${searchTerm}",furigana.ilike."${searchTerm}",word.ilike."${kanaTerm}",furigana.ilike."${kanaTerm}"`
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
        description: item.meaning || "Kosakata",
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
    console.error("[searchToolDictionaryAction] Gagal mencari di database:", error);
    return { vocab: [], grammar: [], kanji: [] };
  }
}
