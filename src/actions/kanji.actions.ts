/**
 * @file kanji.actions.ts
 * @description Server Actions untuk mengambil data kanji dengan paginasi, pencarian teks,
 * dan filter berdasarkan level JLPT dari Supabase.
 */

"use server";

// ======================
// IMPORTS
// ======================
import { createClient } from "@/lib/supabase/server";
import { PaginatedKanjiResponse } from "@/types/library";

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
  const supabase = await createClient();
  await supabase.auth.getSession();
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
