/**
 * @file cheatsheets.actions.ts
 * @description Server Actions untuk mengambil data referensi cepat (Cheatsheets) dari Supabase.
 * Menyediakan fungsi untuk mengambil daftar lengkap maupun detail satu cheatsheet berdasarkan ID atau slug.
 */

"use server";

// ======================
// IMPORTS
// ======================
import { createStaticClient } from "@/lib/supabase/server";

// ======================
// SERVER ACTIONS
// ======================

/**
 * Mengambil daftar referensi cepat (Cheatsheets).
 */
export async function getCheatsheets() {
  const supabase = createStaticClient();
  
  try {
    const { data, error } = await supabase
      .from("cheatsheets")
      .select(`
        id, 
        slug, 
        title, 
        category, 
        items
      `)
      .order("category", { ascending: true })
      .order("title", { ascending: true });

    if (error) throw error;

    return (data || []).map(s => ({
      _id: s.id,
      slug: s.slug,
      title: s.title,
      category: s.category,
      items: s.items || [],
      linkedVocab: []
    }));
  } catch (error) {
    console.error("Gagal mengambil daftar cheatsheet:", error);
    return [];
  }
}

/**
 * Mengambil detail satu cheatsheet berdasarkan ID atau Slug.
 */
export async function getCheatsheetByIdOrSlug(idOrSlug: string) {
  const supabase = createStaticClient();
  
  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
    const query = supabase
      .from("cheatsheets")
      .select(`
        id, 
        slug, 
        title, 
        category, 
        items
      `);

    const { data: sheet, error } = await (isUuid 
      ? query.eq("id", idOrSlug) 
      : query.eq("slug", idOrSlug)
    ).single();

    if (error && error.code !== "PGRST116") throw error;
    if (!sheet) return null;

    return {
      _id: sheet.id,
      slug: sheet.slug,
      title: sheet.title,
      category: sheet.category,
      items: sheet.items || [],
      linkedVocab: []
    };
  } catch (error) {
    console.error("Gagal mengambil detail cheatsheet:", error);
    return null;
  }
}
