"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * Mengambil daftar tata bahasa dengan paginasi dan filter level.
 */
export async function getPaginatedGrammar(
  page: number,
  limit: number,
  level: string = ""
): Promise<{ data: any[]; total: number }> {
  const supabase = await createClient();
  const offset = (page - 1) * limit;

  try {
    let query = supabase.from("grammar").select("*", { count: "exact" });

    if (level && level !== "all") {
      query = query.eq("jlpt_level", level.toUpperCase());
    }

    const { data, count, error } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return {
      data: (data || []).map(g => ({ ...g, _id: g.id, jlptLevel: g.jlpt_level })),
      total: count || 0,
    };
  } catch (error) {
    console.error("Failed to fetch paginated grammar:", error);
    return { data: [], total: 0 };
  }
}

/**
 * Mengambil artikel Grammar acak berdasarkan JLPT level (Dipakai di Homepage).
 */
export async function getRandomGrammarArticle(level: string = "N5") {
  const supabase = await createClient();
  
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
  const { data } = await getPaginatedGrammar(1, 1000, level);
  return data;
}
