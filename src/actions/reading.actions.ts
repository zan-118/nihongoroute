/**
 * @file reading.actions.ts
 * @description Server Actions untuk mengambil data materi membaca (reading) dari Supabase.
 * Menyediakan fungsi paginasi dengan filter level JLPT untuk halaman pustaka membaca.
 */

"use server";

// ======================
// IMPORTS
// ======================
import { PaginatedReadingResponse, LibraryItem } from "@/types/library";
import { ReadingMaterialTable } from "@/types/database";
import {
 getPaginatedContent,
 getContentBySlugOrId,
 getStaticSlugs
} from "@/lib/services/content-repository";
import { logger } from "@/lib/core/logger";

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
 try {
 const response = await getPaginatedContent<ReadingMaterialTable>("reading", {
 page,
 limit,
 search,
 searchColumns: ["title", "body", "difficulty"],
 orderBy: [{ column: "created_at", ascending: false }],
 filters: (query) => {
 if (level && level !== "all") {
 query = query.eq("jlpt_level", level.toUpperCase());
 }
 return query;
 }
 });

 // Map Supabase schema fields to application-compatible structure
 return {
 data: response.data.map((r) => ({
 ...r,
 id: r.id,
 difficulty: r.difficulty || r.jlpt_level,
 body: r.body || "",
 audioUrl: r.audio_url,
 imageUrl: r.image_url,
 videoUrl: r.video_url
 })) as PaginatedReadingResponse["data"],
 total: response.total,
 };
 } catch (error) {
 logger.error("Gagal mengambil data paginasi bacaan dari Supabase:", error);
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
 try {
 const data = await getContentBySlugOrId<ReadingMaterialTable>("reading", slug);

 if (!data) return null;

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
 logger.error("Gagal mengambil detail bacaan dari Supabase:", error);
 return null;
 }
}

/**
 * Fetch top Reading slugs for static build generation (ISR).
 * 
 * @returns Array of object params with slug property.
 */
export async function getReadingStaticSlugs(): Promise<{ slug: string }[]> {
 try {
 const data = await getStaticSlugs("reading", { limit: 1000, select: "slug" });
 return data.map((item) => ({ slug: String(item.slug) })).filter((x) => x.slug);
 } catch (error) {
 logger.error("Gagal mengambil static slugs reading:", error);
 return [];
 }
}
