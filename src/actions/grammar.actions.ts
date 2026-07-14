/**
 * @file grammar.actions.ts
 * @description Server Actions untuk mengambil data tata bahasa (grammar) dari Supabase.
 * Menyediakan fungsi paginasi, filter JLPT level, pengambilan artikel acak, serta daftar lengkap grammar.
 */

"use server";

// ======================
// IMPORTS
// ======================
import { createStaticClient } from "@/lib/supabase/server";
import { GrammarTable } from "@/types/database";
import { LibraryItem } from "@/types/library";

// ======================
// SERVER ACTIONS
// ======================

/**
 * Fetch paginated grammar records from database.
 * Filter by JLPT level if specified.
 * 
 * @param page - Current page number.
 * @param limit - Records per page.
 * @param level - JLPT level filter.
 * @returns Paginated grammar list and total count.
 */
export async function getPaginatedGrammar(
  page: number,
  limit: number,
  level: string = ""
): Promise<{ data: (GrammarTable & { _id: string; jlptLevel: string | null })[]; total: number }> {
  const supabase = createStaticClient();
  // Calculate offset for pagination.
  const offset = (page - 1) * limit;

  try {
    let query = supabase.from("grammar").select("*", { count: "exact" });

    // Apply JLPT level filter if active.
    if (level && level !== "all") {
      query = query.eq("jlpt_level", level.toUpperCase());
    }

    const { data, count, error } = await query
      .order("order_number", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return {
      // Map database fields to application schema.
      data: (data || []).map(g => ({ ...g, _id: g.id, jlptLevel: g.jlpt_level })),
      total: count || 0,
    };
  } catch (error) {
    console.error("Gagal mengambil data paginasi tata bahasa:", error);
    return { data: [], total: 0 };
  }
}

/**
 * Fetch random grammar article for specific JLPT level.
 * Used for homepage recommendations.
 * 
 * @param level - Target JLPT level.
 * @returns Random grammar article metadata or null.
 */
export async function getRandomGrammarArticle(level: string = "N5") {
  const supabase = createStaticClient();
  
  const { data, error } = await supabase
    .from("grammar")
    .select("id, title, slug, jlpt_level")
    .eq("jlpt_level", level)
    .limit(10); // Fetch pool of 10 latest items.

  if (error || !data || data.length === 0) return null;

  // Select random item from pool.
  const randomItem = data[Math.floor(Math.random() * data.length)];
  return {
    _id: randomItem.id,
    title: randomItem.title,
    slug: randomItem.slug,
    jlptLevel: randomItem.jlpt_level
  };
}

/**
 * Fetch all grammar articles for specific JLPT level without pagination.
 * 
 * @param level - Target JLPT level.
 * @returns Array of grammar articles.
 */
export async function getGrammarArticles(level: string = "") {
  const supabase = createStaticClient();
  const { data } = await getPaginatedGrammar(1, 1000, level);
  return data;
}

/**
 * Validate if string is valid UUID v4.
 * 
 * @param s - String to validate.
 * @returns True if valid UUID.
 */
const isUUID = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);

/**
 * Fetch detailed grammar item by slug or ID.
 * Resolves related grammar and family grammar items.
 * 
 * @param slugOrId - Slug or UUID of grammar item.
 * @returns Detailed grammar item or null.
 */
export async function getLibraryGrammarDetail(slugOrId: string): Promise<LibraryItem | null> {
  const supabase = createStaticClient();

  try {
    let data: LibraryItem | null = null;

    // Try fetching by slug first.
    const { data: bySlug, error: slugErr } = await supabase.from("grammar").select("*").eq("slug", slugOrId).single();
    if (slugErr && slugErr.code !== "PGRST116") {
      console.error(`[getLibraryGrammarDetail] Galat pengambilan slug grammar:`, slugErr.message, slugErr.code);
    }
    if (bySlug) {
      data = bySlug;
    } else if (isUUID(slugOrId)) {
      // Fallback to ID lookup if input is UUID.
      const { data: byId, error: idErr } = await supabase.from("grammar").select("*").eq("id", slugOrId).single();
      if (idErr && idErr.code !== "PGRST116") console.error(`[getLibraryGrammarDetail] Galat pengambilan ID grammar:`, idErr.message);
      data = byId ?? null;
    }

    if (!data) return null;

    data._id = data.id;

    // Parse JSON string examples safely.
    if (typeof data.examples === "string") {
      try {
        data.examples = JSON.parse(data.examples);
      } catch {
        data.examples = [];
      }
    }
    data.examples = Array.isArray(data.examples) ? data.examples : [];
    
    // Fetch related grammar items by slug.
    if (Array.isArray(data.related_grammar) && data.related_grammar.length > 0) {
      const { data: related } = await supabase
        .from("grammar")
        .select("id, title, slug, jlpt_level, meaning")
        .in("slug", data.related_grammar);
      data.relatedGrammarList = related || [];
    } else {
      data.relatedGrammarList = [];
    }

    // Fetch other items in same grammar family.
    if (data.grammar_family) {
      const { data: family } = await supabase
        .from("grammar")
        .select("id, title, slug, jlpt_level, meaning")
        .eq("grammar_family", data.grammar_family)
        .neq("id", data.id); // Exclude current item.
      data.familyGrammarList = family || [];
    } else {
      data.familyGrammarList = [];
    }

    return data;
  } catch (error) {
    console.error("Gagal mengambil detail tata bahasa:", error);
    return null;
  }
}