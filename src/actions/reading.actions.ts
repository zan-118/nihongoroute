/**
 * @file reading.actions.ts
 * @description Server Actions untuk mengambil data materi membaca (reading) dari Supabase.
 * Menyediakan fungsi paginasi dengan filter level JLPT untuk halaman pustaka membaca.
 */

"use server";

// ======================
// IMPORTS
// ======================
import { createStaticClient } from "@/lib/supabase/server";
import { PaginatedReadingResponse, LibraryItem } from "@/types/library";

// ======================
// SERVER ACTIONS
// ======================

/**
 * Fetches paginated reading materials from Supabase with optional search and JLPT level filters.
 * 
 * @param page - Current page number (1-indexed).
 * @param limit - Number of items per page.
 * @param search - Search query string for title, body, or difficulty.
 * @param level - JLPT level filter (e.g., 'N5', 'N4', or 'all').
 * @returns Paginated reading response containing mapped items and total count.
 */
export async function getPaginatedReading(
  page: number,
  limit: number,
  search: string = "",
  level: string = ""
): Promise<PaginatedReadingResponse> {
  // Calculate offset for pagination slicing
  const offset = (page - 1) * limit;
  const supabase = createStaticClient();

  try {
    let query = supabase
      .from("reading")
      .select("*", { count: "exact" });

    if (search) {
      query = query.or(`title.ilike.%${search}%,body.ilike.%${search}%,difficulty.ilike.%${search}%`);
    }
    if (level && level !== "all") {
      query = query.eq("jlpt_level", level.toUpperCase());
    }

    const { data, count, error } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    // Map Supabase schema fields to application-compatible structure
    return {
      data: (data || []).map((r) => ({
        ...r,
        id: r.id,
        difficulty: r.difficulty || r.jlpt_level,
        body: r.body || "",
        audioUrl: r.audio_url,
        imageUrl: r.image_url,
        videoUrl: r.video_url
      })) as PaginatedReadingResponse["data"],
      total: count || 0,
    };
  } catch (error) {
    console.error("Gagal mengambil data paginasi bacaan dari Supabase:", error);
    return { data: [], total: 0 };
  }
}

/**
 * Fetches a single reading material detail by its slug.
 * 
 * @param slug - Unique identifier slug of the reading material.
 * @returns The mapped library item, or null if not found or on error.
 */
export async function getLibraryReadingDetail(slug: string): Promise<LibraryItem | null> {
  const supabase = createStaticClient();
  try {
    const { data, error } = await supabase
      .from("reading")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (error || !data) return null;

    // Map snake_case Supabase fields to camelCase application properties
    return {
      ...data,
      id: data.id,
      difficulty: data.difficulty || data.jlpt_level,
      audioUrl: data.audio_url,
      imageUrl: data.image_url,
      videoUrl: data.video_url
    } as LibraryItem;
  } catch (error) {
    console.error("Gagal mengambil detail bacaan dari Supabase:", error);
    return null;
  }
}