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
 * Mengambil daftar tata bahasa dengan paginasi dan filter level.
 */
export async function getPaginatedGrammar(
  page: number,
  limit: number,
  level: string = ""
): Promise<{ data: (GrammarTable & { _id: string; jlptLevel: string | null })[]; total: number }> {
  const supabase = createStaticClient();
  const offset = (page - 1) * limit;

  try {
    let query = supabase.from("grammar").select("*", { count: "exact" });

    if (level && level !== "all") {
      query = query.eq("jlpt_level", level.toUpperCase());
    }

    const { data, count, error } = await query
      .order("order_number", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return {
      data: (data || []).map(g => ({ ...g, _id: g.id, jlptLevel: g.jlpt_level })),
      total: count || 0,
    };
  } catch (error) {
    console.error("Gagal mengambil data paginasi tata bahasa:", error);
    return { data: [], total: 0 };
  }
}

/**
 * Mengambil artikel Grammar acak berdasarkan JLPT level (Dipakai di Homepage).
 */
export async function getRandomGrammarArticle(level: string = "N5") {
  const supabase = createStaticClient();
  
  const { data, error } = await supabase
    .from("grammar")
    .select("id, title, slug, jlpt_level")
    .eq("jlpt_level", level)
    .limit(10); // Ambil pool 10 terbaru

  if (error || !data || data.length === 0) return null;

  const randomItem = data[Math.floor(Math.random() * data.length)];
  return {
    _id: randomItem.id,
    title: randomItem.title,
    slug: randomItem.slug,
    jlptLevel: randomItem.jlpt_level
  };
}

/**
 * Mengambil semua artikel Grammar berdasarkan JLPT level (tanpa paginasi).
 */
export async function getGrammarArticles(level: string = "") {
  const supabase = createStaticClient();
  const { data } = await getPaginatedGrammar(1, 1000, level);
  return data;
}

const isUUID = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);

/**
 * Mengambil detail satu tata bahasa berdasarkan slug atau ID.
 */
export async function getLibraryGrammarDetail(slugOrId: string): Promise<LibraryItem | null> {
  const supabase = createStaticClient();

  try {
    let data: LibraryItem | null = null;

    // Coba slug terlebih dahulu, lalu kembali ke id sebagai fallback
    const { data: bySlug, error: slugErr } = await supabase.from("grammar").select("*").eq("slug", slugOrId).single();
    if (slugErr && slugErr.code !== "PGRST116") {
      console.error(`[getLibraryGrammarDetail] Galat pengambilan slug grammar:`, slugErr.message, slugErr.code);
    }
    if (bySlug) {
      data = bySlug;
    } else if (isUUID(slugOrId)) {
      const { data: byId, error: idErr } = await supabase.from("grammar").select("*").eq("id", slugOrId).single();
      if (idErr && idErr.code !== "PGRST116") console.error(`[getLibraryGrammarDetail] Galat pengambilan ID grammar:`, idErr.message);
      data = byId ?? null;
    }

    if (!data) return null;

    data._id = data.id;

    // Tangani contoh kalimat secara aman
    if (typeof data.examples === "string") {
      try {
        data.examples = JSON.parse(data.examples);
      } catch {
        data.examples = [];
      }
    }
    data.examples = Array.isArray(data.examples) ? data.examples : [];
    
    // Ambil daftar grammar terkait jika ada
    if (Array.isArray(data.related_grammar) && data.related_grammar.length > 0) {
      const { data: related } = await supabase
        .from("grammar")
        .select("id, title, slug, jlpt_level, meaning")
        .in("slug", data.related_grammar);
      data.relatedGrammarList = related || [];
    } else {
      data.relatedGrammarList = [];
    }

    // Ambil anggota keluarga grammar jika ada
    if (data.grammar_family) {
      const { data: family } = await supabase
        .from("grammar")
        .select("id, title, slug, jlpt_level, meaning")
        .eq("grammar_family", data.grammar_family)
        .neq("id", data.id); // Kecualikan item saat ini
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
