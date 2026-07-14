/**
 * @file cheatsheets.actions.ts
 * @description Server Actions to fetch cheatsheet reference data from Supabase.
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
 * Fetches all cheatsheets from the database.
 * Results are sorted by category and title in ascending order.
 * Maps database fields to application domain model.
 *
 * @returns {Promise<Array<{ _id: string; slug: string; title: string; category: string; items: any[]; linkedVocab: any[] }>>} Array of cheatsheets.
 */
export async function getCheatsheets() {
  // Initialize static Supabase client for server-side rendering
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
      // Sort by category first to group items in UI
      .order("category", { ascending: true })
      // Sort by title second for alphabetical consistency
      .order("title", { ascending: true });

    if (error) throw error;

    // Map database schema to application domain model
    return (data || []).map(s => ({
      _id: s.id,
      slug: s.slug,
      title: s.title,
      category: s.category,
      // Fallback to empty array if items column is null
      items: s.items || [],
      // Compatibility field for vocabulary relations
      linkedVocab: []
    }));
  } catch (error) {
    // Log error and return empty array to prevent UI crashes
    console.error("Gagal mengambil daftar cheatsheet:", error);
    return [];
  }
}

/**
 * Fetches a single cheatsheet by its UUID or unique slug.
 * Automatically detects input type to query the correct column.
 *
 * @param {string} idOrSlug - The UUID or unique slug string of the cheatsheet.
 * @returns {Promise<{ _id: string; slug: string; title: string; category: string; items: any[]; linkedVocab: any[] } | null>} The cheatsheet object, or null if not found.
 */
export async function getCheatsheetByIdOrSlug(idOrSlug: string) {
  // Initialize static Supabase client
  const supabase = createStaticClient();
  
  try {
    // Check if input matches standard UUID format
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

    // Query by ID if UUID, otherwise query by slug
    const { data: sheet, error } = await (isUuid 
      ? query.eq("id", idOrSlug) 
      : query.eq("slug", idOrSlug)
    ).single();

    // Ignore PGRST116 error which indicates no rows were returned by single()
    if (error && error.code !== "PGRST116") throw error;
    if (!sheet) return null;

    // Map database record to application domain model
    return {
      _id: sheet.id,
      slug: sheet.slug,
      title: sheet.title,
      category: sheet.category,
      // Fallback to empty array if items column is null
      items: sheet.items || [],
      // Compatibility field for vocabulary relations
      linkedVocab: []
    };
  } catch (error) {
    // Log error and return null to indicate fetch failure
    console.error("Gagal mengambil detail cheatsheet:", error);
    return null;
  }
}