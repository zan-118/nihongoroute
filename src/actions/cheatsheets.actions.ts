/**
 * @file cheatsheets.actions.ts
 * @description Server Actions to fetch cheatsheet reference data from Supabase.
 */

"use server";

// ======================
// IMPORTS
// ======================
import {
  getCheatsheetsList,
  getContentBySlugOrId
} from "@/lib/services/content-repository";
import { CheatsheetTable } from "@/types/database";
import type { SheetItem } from "@/features/library/cheatsheet/CheatsheetView";

// ======================
// SERVER ACTIONS
// ======================

/**
 * Fetches all cheatsheets from the database.
 * Results are sorted by category and title in ascending order.
 * Maps database fields to application domain model.
 *
 * @returns {Promise<Array<{ _id: string; slug: string; title: string; category: string; items: SheetItem[]; linkedVocab: SheetItem[] }>>} Array of cheatsheets.
 */
export async function getCheatsheets() {
  try {
    const data = await getCheatsheetsList();

    // Map database schema to application domain model
    return (data || []).map(s => ({
      _id: s.id,
      slug: s.slug,
      title: s.title,
      category: s.category || "",
      // Fallback to empty array if items column is null
      items: (s.items || []) as unknown as SheetItem[],
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
 * @returns {Promise<{ _id: string; slug: string; title: string; category: string; items: SheetItem[]; linkedVocab: SheetItem[] } | null>} The cheatsheet object, or null if not found.
 */
export async function getCheatsheetByIdOrSlug(idOrSlug: string) {
  try {
    const sheet = await getContentBySlugOrId<CheatsheetTable>("cheatsheets", idOrSlug);

    if (!sheet) return null;

    // Map database record to application domain model
    return {
      _id: sheet.id,
      slug: sheet.slug,
      title: sheet.title,
      category: sheet.category || "",
      // Fallback to empty array if items column is null
      items: (sheet.items || []) as unknown as SheetItem[],
      // Compatibility field for vocabulary relations
      linkedVocab: []
    };
  } catch (error) {
    // Log error and return null to indicate fetch failure
    console.error("Gagal mengambil detail cheatsheet:", error);
    return null;
  }
}

/**
 * Fetch static params for cheatsheet routes (both ID and slug).
 * 
 * @returns Array of objects with id property.
 */
export async function getCheatsheetStaticParams(): Promise<{ id: string }[]> {
  try {
    const sheets = await getCheatsheets();
    return sheets.flatMap((s) => {
      const results = [];
      if (s.slug) results.push({ id: s.slug });
      if (s._id) results.push({ id: s._id });
      return results;
    });
  } catch (error) {
    console.error("Gagal mengambil static params cheatsheet:", error);
    return [];
  }
}