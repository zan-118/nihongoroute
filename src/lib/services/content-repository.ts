/**
 * @file content-repository.ts
 * @description Core content repository layer providing generic paginated Supabase table queries and lexical data fetching.
 * @module lib/services
 */

import { createStaticClient } from "@/lib/supabase/server";
import { logger } from "@/lib/core/logger";

export interface PaginatedOptions<TFilter = any> { // eslint-disable-line @typescript-eslint/no-explicit-any
 page: number;
 limit: number;
 filters?: (query: TFilter) => TFilter;
 searchColumns?: string[];
 search?: string;
 orderBy?: { column: string; ascending?: boolean; nullsFirst?: boolean }[];
}

export interface PaginatedResponse<T> {
 data: T[];
 total: number;
 count: number;
 page: number;
 totalPages: number;
}

/**
 * Generic function to fetch paginated content from any Supabase table.
 *
 * @param table - Supabase table name.
 * @param options - Paginated options.
 */
export async function getPaginatedContent<T>(
 table: string,
 options: PaginatedOptions
): Promise<PaginatedResponse<T>> {
 const { page, limit, filters, searchColumns, search, orderBy } = options;
 const offset = (page - 1) * limit;
 const supabase = createStaticClient();

 try {
 let query = supabase.from(table).select("*", { count: "exact" });

 // Apply search filter if search query and columns are provided
 if (search && searchColumns && searchColumns.length > 0) {
 const safeSearch = search
 .replace(/\\/g, '\\\\')
 .replace(/%/g, '\\%')
 .replace(/_/g, '\\_')
 .replace(/"/g, '');
 const orString = searchColumns.map((col) => `${col}.ilike."%${safeSearch}%"`).join(",");
 query = query.or(orString);
 }

 // Apply custom dynamic filters
 if (filters) {
 query = filters(query);
 }

 // Apply sorting
 if (orderBy && orderBy.length > 0) {
 orderBy.forEach((order) => {
 query = query.order(order.column, {
 ascending: order.ascending ?? true,
 nullsFirst: order.nullsFirst,
 });
 });
 }

 // Range pagination
 const { data, count, error } = await query.range(offset, offset + limit - 1);

 if (error) throw error;

 const total = count || 0;
 const totalPages = Math.ceil(total / limit);

 return {
 data: (data || []) as T[],
 total,
 count: total,
 page,
 totalPages,
 };
 } catch (error) {
 logger.error(`Gagal mengambil data paginasi dari tabel ${table}:`, error);
 return {
 data: [],
 total: 0,
 count: 0,
 page,
 totalPages: 0,
 };
 }
}

/**
 * Generic function to retrieve a single record by its slug or ID,
 * with optional Kanji character lookup fallback.
 *
 * @param table - Supabase table name.
 * @param slugOrId - Unique slug or UUID identifier.
 */
export async function getContentBySlugOrId<T>(
 table: string,
 slugOrId: string
): Promise<T | null> {
 const supabase = createStaticClient();
 const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId);

 try {
 if (isUuid) {
 const { data, error } = await supabase
 .from(table)
 .select("*")
 .eq("id", slugOrId)
 .maybeSingle();

 if (error && error.code !== "PGRST116") {
 logger.error(`[getContentBySlugOrId] Error loading ${table} by id:`, error.message);
 }
 return data as T | null;
 }

 const { data: bySlug, error: slugErr } = await supabase
 .from(table)
 .select("*")
 .eq("slug", slugOrId)
 .maybeSingle();

 if (slugErr && slugErr.code !== "PGRST116") {
 logger.error(`[getContentBySlugOrId] Error loading ${table} by slug:`, slugErr.message);
 }
 if (bySlug) {
 return bySlug as T;
 }

 // Kanji character lookup fallback
 if (table === "kanji") {
 const { data: byChar, error: charErr } = await supabase
 .from("kanji")
 .select("*")
 .eq("character", slugOrId)
 .maybeSingle();

 if (charErr && charErr.code !== "PGRST116") {
 logger.error(`[getContentBySlugOrId] Error loading kanji by character:`, charErr.message);
 }
 return byChar as T;
 }

 return null;
 } catch (error) {
 logger.error(`[getContentBySlugOrId] Exception in ${table}:`, error);
 return null;
 }
}

/**
 * Generic function to fetch static slugs for static build generation (ISR).
 */
export async function getStaticSlugs<T = Record<string, unknown>>(
 table: string,
 options: {
 limit: number;
 orderBy?: { column: string; ascending?: boolean };
 select?: string;
 }
): Promise<T[]> {
 const supabase = createStaticClient();
 let query = supabase.from(table).select(options.select || "slug");

 if (options.select?.includes("slug") || !options.select) {
 query = query.not("slug", "is", null);
 }

 if (options.orderBy) {
 query = query.order(options.orderBy.column, { ascending: options.orderBy.ascending ?? true });
 }

 const { data, error } = await query.limit(options.limit);
 if (error) {
 logger.error(`[getStaticSlugs] Gagal mengambil slugs dari ${table}:`, error);
 return [];
 }
 return (data || []) as T[];
}

/**
 * Fetch detailed related kanji items by character array.
 */
export async function getRelatedKanjis(characters: string[]) {
 const supabase = createStaticClient();
 const { data, error } = await supabase
 .from("kanji")
 .select("id, character, meaning, onyomi, kunyomi, slug")
 .in("character", characters);
 if (error) {
 logger.error("[getRelatedKanjis] Error:", error);
 return [];
 }
 return data || [];
}

/**
 * Fetch detailed synonyms/antonyms from vocab table by words array.
 */
export async function getRelatedVocabByWords(words: string[]) {
 const supabase = createStaticClient();
 const { data, error } = await supabase
 .from("vocab")
 .select("id, word, meaning_id, romaji, slug")
 .in("word", words);
 if (error) {
 logger.error("[getRelatedVocabByWords] Error:", error);
 return [];
 }
 return data || [];
}

/**
 * Fetch dynamic sample sentences containing word query.
 */
export async function getSentencesContainingWord(word: string, limit: number) {
 const supabase = createStaticClient();
 const { data, error } = await supabase
 .from("sentences")
 .select("id, japanese, english, indonesia, jlpt_level, furigana")
 .like("japanese", `%${word.trim()}%`)
 .limit(limit);
 if (error) {
 logger.error("[getSentencesContainingWord] Error:", error);
 return [];
 }
 return data || [];
}

/**
 * Fetch related grammar items by slug array.
 */
export async function getGrammarListBySlugs(slugs: string[]) {
 const supabase = createStaticClient();
 const { data, error } = await supabase
 .from("grammar")
 .select("id, title, slug, jlpt_level, meaning")
 .in("slug", slugs);
 if (error) {
 logger.error("[getGrammarListBySlugs] Error:", error);
 return [];
 }
 return data || [];
}

/**
 * Fetch other grammar items belonging to the same grammar family.
 */
export async function getGrammarFamilyList(family: string, excludeId: string) {
 const supabase = createStaticClient();
 const { data, error } = await supabase
 .from("grammar")
 .select("id, title, slug, jlpt_level, meaning")
 .eq("grammar_family", family)
 .neq("id", excludeId);
 if (error) {
 logger.error("[getGrammarFamilyList] Error:", error);
 return [];
 }
 return data || [];
}

/**
 * Fetch vocab items containing kanji character for detail page sidebar.
 */
export async function getVocabByCharacter(character: string, limit: number) {
  if (!character) return [];
  const supabase = createStaticClient();
 const { data, error } = await supabase
 .from("vocab")
 .select("id, word, furigana, meaning_id, slug")
 .like("word", `%${character}%`)
 .limit(limit);
 if (error) {
 logger.error("[getVocabByCharacter] Error:", error);
 return [];
 }
 return data || [];
}

/**
 * Fetch a pool of listening materials for a specific JLPT level.
 */
export async function getRandomListeningPool(level: string, limit: number) {
 const supabase = createStaticClient();
 const { data, error } = await supabase
 .from("listening")
 .select("id, title, slug, audio_url, body")
 .eq("jlpt_level", level.toUpperCase())
 .order("created_at", { ascending: false })
 .limit(limit);
 if (error) {
 logger.error("[getRandomListeningPool] Error:", error);
 return [];
 }
 return data || [];
}

/**
 * Fetch a pool of grammar items for a specific JLPT level.
 */
export async function getRandomGrammarPool(level: string, limit: number) {
 const supabase = createStaticClient();
 const { data, error } = await supabase
 .from("grammar")
 .select("id, title, slug, jlpt_level")
 .eq("jlpt_level", level.toUpperCase())
 .limit(limit);
 if (error) {
 logger.error("[getRandomGrammarPool] Error:", error);
 return [];
 }
 return data || [];
}

/**
 * Fetch all cheatsheet records from database.
 */
export async function getCheatsheetsList() {
 const supabase = createStaticClient();
 const { data, error } = await supabase
 .from("cheatsheets")
 .select("id, slug, title, category, items")
 .order("category", { ascending: true })
 .order("title", { ascending: true });
 if (error) {
 logger.error("[getCheatsheetsList] Error:", error);
 return [];
 }
 return data || [];
}

/**
 * Fetch a random common expression from the database.
 */
export async function getRandomExpressionData() {
 const supabase = createStaticClient();
 const { count } = await supabase
 .from("expressions")
 .select("*", { count: "exact", head: true })
 .eq("common", true);

 if (!count || count === 0) return null;

 const randomOffset = Math.floor(Math.random() * count);
 const { data, error } = await supabase
 .from("expressions")
 .select("id, text, reading, meanings, indonesia, jlpt_level")
 .eq("common", true)
 .range(randomOffset, randomOffset)
 .single();

 if (error) {
 logger.error("[getRandomExpressionData] Error:", error);
 return null;
 }
 return data;
}

/**
 * Fetch a pool of sentences for random shuffle in drill mode.
 */
export async function getRandomSentencesPool(level: string, poolSize: number) {
 const supabase = createStaticClient();
 let query = supabase
 .from("sentences")
 .select("id, japanese, english, indonesia, jlpt_level, furigana")
 .not("japanese", "is", null);

 if (level && level !== "all") {
 query = query.eq("jlpt_level", level.toUpperCase());
 }

 query = query.or("indonesia.neq.null,english.neq.null");

 const { data, error } = await query.limit(poolSize);
 if (error) {
 logger.error("[getRandomSentencesPool] Error:", error);
 return [];
 }
 return data || [];
}
