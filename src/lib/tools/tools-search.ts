import type { ElementType } from "react";
import { BookOpen, FileText, Hash } from "lucide-react";
import { toHiragana } from "wanakana";
import { createClient } from "@/lib/supabase/client";

export type ToolSearchCategory = "vocab" | "grammar" | "kanji";

export interface ToolSearchItem {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: ElementType;
  category: ToolSearchCategory;
  jlptLevel?: string | null;
  reading?: string | null;
  romaji?: string | null;
  slug?: string | null;
  hinshi?: string[] | null;
  formation?: string | null;
  isCommon?: boolean | null;
}

export interface ToolSearchResult {
  vocab: ToolSearchItem[];
  grammar: ToolSearchItem[];
  kanji: ToolSearchItem[];
}

export interface JapaneseTextStats {
  charCount: number;
  japaneseCharCount: number;
  kanaCount: number;
  kanjiCount: number;
  uniqueKanji: string[];
  tokens: string[];
}

const dictionaryCache = new Map<string, ToolSearchResult>();

function escapePostgrestLike(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/%/g, "\\%")
    .replace(/_/g, "\\_")
    .replace(/"/g, "")
    .replace(/,/g, " ");
}

export function emptyToolSearchResult(): ToolSearchResult {
  return { grammar: [], kanji: [], vocab: [] };
}

export function flattenToolSearchResult(result: ToolSearchResult) {
  return [...result.vocab, ...result.grammar, ...result.kanji];
}

export function getJapaneseTextStats(text: string): JapaneseTextStats {
  const chars = Array.from(text);
  const japaneseChars = chars.filter((char) =>
    /[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}ー々]/u.test(char)
  );
  const kanaChars = chars.filter((char) =>
    /[\p{Script=Hiragana}\p{Script=Katakana}ー]/u.test(char)
  );
  const kanjiChars = chars.filter((char) => /[\p{Script=Han}々]/u.test(char));
  const uniqueKanji = Array.from(new Set(kanjiChars));
  const tokens = Array.from(
    new Set(
      (text.match(/[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}ー々]{2,}/gu) || [])
        .map((token) => token.trim())
        .filter((token) => token.length > 0)
    )
  );

  return {
    charCount: chars.length,
    japaneseCharCount: japaneseChars.length,
    kanaCount: kanaChars.length,
    kanjiCount: kanjiChars.length,
    uniqueKanji,
    tokens,
  };
}

function dedupeItems(items: ToolSearchItem[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = `${item.category}:${item.id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function searchToolDictionary(
  query: string,
  options: { limitPerType?: number } = {}
): Promise<ToolSearchResult> {
  const normalizedQuery = query.trim();
  const limitPerType = options.limitPerType ?? 8;
  if (!normalizedQuery) return emptyToolSearchResult();

  const cacheKey = `${normalizedQuery.toLowerCase()}:${limitPerType}`;
  const cached = dictionaryCache.get(cacheKey);
  if (cached) return cached;

  const supabase = createClient();
  const safeQuery = escapePostgrestLike(normalizedQuery);
  const kanaQuery = escapePostgrestLike(toHiragana(normalizedQuery));
  const searchTerm = `%${safeQuery}%`;
  const kanaTerm = `%${kanaQuery}%`;

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

  if (vocabRes.error) console.error("Gagal mencari kosakata:", vocabRes.error.message);
  if (grammarRes.error) console.error("Gagal mencari tata bahasa:", grammarRes.error.message);
  if (kanjiRes.error) console.error("Gagal mencari kanji:", kanjiRes.error.message);

  const result: ToolSearchResult = {
    vocab: ((vocabRes.data || []) as Array<{
      id: string;
      word: string;
      meaning_id?: string | null;
      furigana?: string | null;
      romaji?: string | null;
      hinshi?: string[] | null;
      jlpt_level?: string | null;
      slug?: string | null;
      is_common?: boolean | null;
    }>).map((item) => ({
      id: item.id,
      title: item.word,
      description: item.meaning_id || "Kosakata",
      href: `/library/vocab/${item.slug || item.id}`,
      icon: FileText,
      category: "vocab" as const,
      jlptLevel: item.jlpt_level,
      reading: item.furigana,
      romaji: item.romaji,
      slug: item.slug,
      hinshi: item.hinshi,
      isCommon: item.is_common,
    })),
    grammar: ((grammarRes.data || []) as Array<{
      id: string;
      title: string;
      slug?: string | null;
      meaning?: string | null;
      jlpt_level?: string | null;
      formation?: string | null;
    }>).map((item) => ({
      id: item.id,
      title: item.title,
      description: item.meaning || "Tata bahasa",
      href: `/library/grammar/${item.slug || item.id}`,
      icon: BookOpen,
      category: "grammar" as const,
      jlptLevel: item.jlpt_level,
      slug: item.slug,
      formation: item.formation,
    })),
    kanji: ((kanjiRes.data || []) as Array<{
      id: string;
      character: string;
      meaning?: string | null;
      onyomi?: string | null;
      kunyomi?: string | null;
      romaji?: string | null;
      jlpt_level?: string | null;
      slug?: string | null;
    }>).map((item) => ({
      id: item.id,
      title: item.character,
      description: item.meaning || "Kanji",
      href: `/library/kanji/${item.slug || item.character || item.id}`,
      icon: Hash,
      category: "kanji" as const,
      jlptLevel: item.jlpt_level,
      reading: [item.onyomi, item.kunyomi].filter(Boolean).join(" / "),
      romaji: item.romaji,
      slug: item.slug,
    })),
  };

  if (dictionaryCache.size > 100) {
    const firstKey = dictionaryCache.keys().next().value;
    if (firstKey) dictionaryCache.delete(firstKey);
  }
  dictionaryCache.set(cacheKey, result);
  return result;
}

export async function analyzeTextWithDictionary(text: string) {
  const stats = getJapaneseTextStats(text);
  const supabase = createClient();

  const [vocabByWordRes, vocabByFuriRes, grammarByTitleRes, grammarBySlugRes, kanjiRes] = await Promise.all([
    stats.tokens.length > 0
      ? supabase.from("vocab").select("id, word, meaning_id, furigana, romaji, hinshi, jlpt_level, slug, is_common").in("word", stats.tokens).limit(16)
      : Promise.resolve({ data: null, error: null }),
    stats.tokens.length > 0
      ? supabase.from("vocab").select("id, word, meaning_id, furigana, romaji, hinshi, jlpt_level, slug, is_common").in("furigana", stats.tokens).limit(16)
      : Promise.resolve({ data: null, error: null }),
    stats.tokens.length > 0
      ? supabase.from("grammar").select("id, title, slug, meaning, jlpt_level, formation").in("title", stats.tokens).limit(8)
      : Promise.resolve({ data: null, error: null }),
    stats.tokens.length > 0
      ? supabase.from("grammar").select("id, title, slug, meaning, jlpt_level, formation").in("slug", stats.tokens).limit(8)
      : Promise.resolve({ data: null, error: null }),
    stats.uniqueKanji.length > 0
      ? supabase.from("kanji").select("id, character, meaning, onyomi, kunyomi, romaji, jlpt_level, slug").in("character", stats.uniqueKanji).limit(16)
      : Promise.resolve({ data: null, error: null }),
  ]);

  const rawVocabs = [
    ...(vocabByWordRes?.data || []),
    ...(vocabByFuriRes?.data || [])
  ];
  const uniqueVocabs = Array.from(new Map(rawVocabs.map(v => [v.id, v])).values());

  const rawGrammars = [
    ...(grammarByTitleRes?.data || []),
    ...(grammarBySlugRes?.data || [])
  ];
  const uniqueGrammars = Array.from(new Map(rawGrammars.map(g => [g.id, g])).values());

  const uniqueKanjis = kanjiRes?.data || [];

  return {
    stats,
    results: {
      vocab: uniqueVocabs.map((item) => ({
        id: item.id,
        title: item.word,
        description: item.meaning_id || "Kosakata",
        href: `/library/vocab/${item.slug || item.id}`,
        icon: FileText,
        category: "vocab" as const,
        jlptLevel: item.jlpt_level,
        reading: item.furigana,
        romaji: item.romaji,
        slug: item.slug,
        hinshi: item.hinshi,
        isCommon: item.is_common,
      })).slice(0, 16),
      grammar: uniqueGrammars.map((item) => ({
        id: item.id,
        title: item.title,
        description: item.meaning || "Tata bahasa",
        href: `/library/grammar/${item.slug || item.id}`,
        icon: BookOpen,
        category: "grammar" as const,
        jlptLevel: item.jlpt_level,
        slug: item.slug,
        formation: item.formation,
      })).slice(0, 8),
      kanji: uniqueKanjis.map((item) => ({
        id: item.id,
        title: item.character,
        description: item.meaning || "Kanji",
        href: `/library/kanji/${item.slug || item.character || item.id}`,
        icon: Hash,
        category: "kanji" as const,
        jlptLevel: item.jlpt_level,
        reading: [item.onyomi, item.kunyomi].filter(Boolean).join(" / "),
        romaji: item.romaji,
        slug: item.slug,
      })).slice(0, 16),
    },
  };
}
