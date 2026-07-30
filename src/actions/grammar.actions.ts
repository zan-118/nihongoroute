/**
 * @file grammar.actions.ts
 * @description Server Actions untuk mengambil data tata bahasa (grammar) dari Supabase.
 * Menyediakan fungsi paginasi, filter JLPT level, pengambilan artikel acak, serta daftar lengkap grammar.
 */

"use server";

// ======================
// IMPORTS
// ======================
import { GrammarTable } from "@/types/database";
import { LibraryItem } from "@/types/library";
import { queryLexicalDomain } from "@/lib/services/lexical-content-engine";
import {
  getContentBySlugOrId,
  getStaticSlugs,
  getGrammarListBySlugs,
  getGrammarFamilyList,
  getRandomGrammarPool
} from "@/lib/services/content-repository";

// ======================
// SERVER ACTIONS
// ======================

/**
 * Fetch paginated grammar records from database using LexicalContentEngine domain seam.
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
  try {
    const response = await queryLexicalDomain<GrammarTable>({
      type: "grammar",
      filters: { level },
      pagination: { page, limit },
    });

    return {
      data: response.data.map(g => ({ ...g, _id: g.id, jlptLevel: g.jlpt_level ?? null })),
      total: response.total
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
  try {
    const data = await getRandomGrammarPool(level, 10);
    if (!data || data.length === 0) return null;

    // Select random item from pool.
    const randomItem = data[Math.floor(Math.random() * data.length)];
    return {
      _id: randomItem.id,
      title: randomItem.title,
      slug: randomItem.slug,
      jlptLevel: randomItem.jlpt_level
    };
  } catch (error) {
    console.error("Gagal mengambil artikel tata bahasa acak:", error);
    return null;
  }
}

/**
 * Fetch all grammar articles for specific JLPT level without pagination.
 * 
 * @param level - Target JLPT level.
 * @returns Array of grammar articles.
 */
export async function getGrammarArticles(level: string = "") {
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
  try {
    const data = await getContentBySlugOrId<LibraryItem>("grammar", slugOrId);

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
      const related = await getGrammarListBySlugs(data.related_grammar);
      data.relatedGrammarList = related || [];
    } else {
      data.relatedGrammarList = [];
    }

    // Fetch other items in same grammar family.
    if (data.grammar_family) {
      const family = await getGrammarFamilyList(data.grammar_family, data.id as string);
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

/**
 * Fetch top grammar slugs for static build generation (ISR).
 * 
 * @param limit - Maximum number of slugs to pre-render.
 * @returns Array of object params with slug property.
 */
export async function getGrammarStaticSlugs(limit: number = 100): Promise<{ slug: string }[]> {
  try {
    const data = await getStaticSlugs("grammar", { limit, select: "slug" });
    return data.map((item) => ({ slug: String(item.slug) })).filter((x) => x.slug);
  } catch (error) {
    console.error("Gagal mengambil static slugs grammar:", error);
    return [];
  }
}