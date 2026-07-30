/**
 * @file kanji.actions.ts
 * @description Server Actions untuk mengambil data kanji dengan paginasi, pencarian teks,
 * dan filter berdasarkan level JLPT dari Supabase.
 */

"use server";

// ======================
// IMPORTS
// ======================
import { PaginatedKanjiResponse, LibraryItem } from "@/types/library";
import { KanjiTable } from "@/types/database";
import {
  getPaginatedContent,
  getContentBySlugOrId,
  getStaticSlugs,
  getVocabByCharacter
} from "@/lib/services/content-repository";

// ======================
// SERVER ACTIONS
// ======================

/**
 * Fetch kanji list with pagination, search, and JLPT filter.
 * @param page Page number.
 * @param limit Items per page.
 * @param search Search query.
 * @param level JLPT level.
 * @returns Paginated kanji data.
 */
export async function getPaginatedKanji(
  page: number,
  limit: number,
  search: string = "",
  level: string = ""
): Promise<PaginatedKanjiResponse> {
  try {
    const response = await getPaginatedContent<KanjiTable>("kanji", {
      page,
      limit,
      search,
      searchColumns: ["character", "meaning", "onyomi", "kunyomi", "romaji"],
      orderBy: [{ column: "character", ascending: true }],
      filters: (query) => {
        if (level && level !== "all") {
          query = query.eq("jlpt_level", level.toUpperCase());
        }
        return query;
      }
    });

    return {
      data: response.data.map(k => ({ ...k, _id: k.id, jlptLevel: k.jlpt_level })),
      total: response.total
    };
  } catch (error) {
    console.error("Gagal mengambil data paginasi kanji:", error);
    return { data: [], total: 0 };
  }
}

/**
 * Check if string is valid UUID.
 * @param s Input string.
 * @returns True if UUID.
 */
const isUUID = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);

/**
 * Fetch single kanji detail by slug, ID, or character.
 * @param slugOrId Kanji identifier.
 * @returns Kanji detail or null.
 */
export async function getLibraryKanjiDetail(slugOrId: string): Promise<LibraryItem | null> {
  try {
    const data = await getContentBySlugOrId<LibraryItem>("kanji", slugOrId);

    if (!data) return null;

    // Normalisasi bidang properti untuk frontend
    data.jlptLevel = data.jlpt_level;
    data.strokeOrderSvg = data.stroke_order_svg;

    // Ambil kosakata terkait — cari kata yang mengandung karakter kanji ini
    try {
      const related = await getVocabByCharacter(data.character as string, 6);
      data.relatedVocab = related.map((v: { id: string; word: string; furigana: string | null; meaning_id: string; slug: string }) => ({
        id: v.id,
        _id: v.id,
        word: v.word,
        meaning: v.meaning_id,
        furigana: v.furigana || "",
        slug: v.slug
      }));
    } catch {
      data.relatedVocab = [];
    }

    return data;
  } catch (error) {
    console.error("Gagal mengambil detail kanji:", error);
    return null;
  }
}

/**
 * Fetch top Kanji slugs for static build generation (ISR).
 * 
 * @param limit - Maximum number of slugs to pre-render.
 * @returns Array of object params with slug property.
 */
export async function getKanjiStaticSlugs(limit: number = 200): Promise<{ slug: string }[]> {
  try {
    const data = await getStaticSlugs("kanji", { limit, select: "slug, character" });
    return data
      .map((item) => ({ slug: String(item.slug || item.character || "") }))
      .filter((x) => x.slug);
  } catch (error) {
    console.error("Gagal mengambil static slugs kanji:", error);
    return [];
  }
}