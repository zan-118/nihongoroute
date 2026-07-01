/**
 * @file kanji.actions.ts
 * @description Server Actions untuk mengambil data kanji dengan paginasi, pencarian teks,
 * dan filter berdasarkan level JLPT dari Supabase.
 */

"use server";

// ======================
// IMPORTS
// ======================
import { createStaticClient } from "@/lib/supabase/server";
import { PaginatedKanjiResponse, LibraryItem } from "@/types/library";

// ======================
// SERVER ACTIONS
// ======================

/**
 * Mengambil kanji dengan paginasi, pencarian, dan filter level.
 */
export async function getPaginatedKanji(
  page: number,
  limit: number,
  search: string = "",
  level: string = ""
): Promise<PaginatedKanjiResponse> {
  const supabase = createStaticClient();
  const offset = (page - 1) * limit;

  try {
    let query = supabase.from("kanji").select("*", { count: "exact" });

    if (search) {
      const safeSearch = search
        .replace(/\\/g, '\\\\')  // hindari backslash terlebih dahulu
        .replace(/%/g, '\\%')    // hindari SQL wildcard %
        .replace(/_/g, '\\_')    // hindari SQL wildcard _
        .replace(/"/g, '');       // hapus tanda kutip untuk sintaks PostgREST
      query = query.or(`character.ilike."%${safeSearch}%",meaning.ilike."%${safeSearch}%",onyomi.ilike."%${safeSearch}%",kunyomi.ilike."%${safeSearch}%",romaji.ilike."%${safeSearch}%"`);
    }

    if (level && level !== "all") {
      query = query.eq("jlpt_level", level.toUpperCase());
    }

    const { data, count, error } = await query
      .order("character", { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return {
      data: (data || []).map(k => ({ ...k, _id: k.id, jlptLevel: k.jlpt_level })),
      total: count || 0,
    };
  } catch (error) {
    console.error("Gagal mengambil data paginasi kanji:", error);
    return { data: [], total: 0 };
  }
}

const isUUID = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);

/**
 * Mengambil detail satu Kanji berdasarkan slug, ID, atau karakter.
 */
export async function getLibraryKanjiDetail(slugOrId: string): Promise<LibraryItem | null> {
  const supabase = createStaticClient();

  try {
    let data: LibraryItem | null = null;

    if (isUUID(slugOrId)) {
      const { data: d, error } = await supabase.from("kanji").select("*").eq("id", slugOrId).single();
      if (error && error.code !== "PGRST116") console.error(`[getLibraryKanjiDetail] Galat pengambilan data kanji ID:`, error.message, error.code);
      data = d ?? null;
    } else {
      // Coba cari berdasarkan kolom slug ASCII terlebih dahulu
      const { data: bySlug, error: slugErr } = await supabase.from("kanji").select("*").eq("slug", slugOrId).single();
      if (bySlug) {
        data = bySlug;
      } else {
        // Fallback ke kolom character untuk backward compatibility
        const { data: d, error } = await supabase.from("kanji").select("*").eq("character", slugOrId).single();
        if (error && error.code !== "PGRST116") console.error(`[getLibraryKanjiDetail] Galat pengambilan data kanji:`, error.message, error.code);
        data = d ?? null;
      }
    }

    if (!data) return null;

    // Normalisasi bidang properti untuk frontend
    data.jlptLevel = data.jlpt_level;
    data.strokeOrderSvg = data.stroke_order_svg;

    // Ambil kosakata terkait — cari kata yang mengandung karakter kanji ini
    try {
      const { data: related } = await supabase
        .from("vocab")
        .select("id, word, furigana, meaning_id, slug")
        .like("word", `%${data.character}%`)
        .limit(6);
      data.relatedVocab = (related || []).map((v: { id: string; word: string; furigana: string | null; meaning_id: string; slug: string }) => ({
        ...v,
        _id: v.id,
        meaning: v.meaning_id,
        furigana: v.furigana || "",
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
