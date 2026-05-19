"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * Mengambil daftar referensi cepat (Cheatsheets).
 */
export async function getCheatsheets() {
  const supabase = await createClient();
  
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
    console.error("Failed to fetch cheatsheets:", error);
    return [];
  }
}

/**
 * Mengambil detail satu cheatsheet berdasarkan ID atau Slug.
 */
export async function getCheatsheetByIdOrSlug(idOrSlug: string) {
  const supabase = await createClient();
  
  try {
    const { data: sheet, error } = await supabase
      .from("cheatsheets")
      .select(`
        id, 
        slug, 
        title, 
        category, 
        items
      `)
      .or(`id.eq.${idOrSlug},slug.eq.${idOrSlug}`)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    if (!sheet) return null;

    return {
      _id: sheet.id,
      title: sheet.title,
      category: sheet.category,
      items: sheet.items || [],
      linkedVocab: []
    };
  } catch (error) {
    console.error("Failed to fetch cheatsheet detail:", error);
    return null;
  }
}
