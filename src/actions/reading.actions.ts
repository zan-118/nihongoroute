/**
 * @file reading.actions.ts
 * @description Server Actions untuk mengambil data materi membaca (reading) dari Sanity CMS.
 * Menyediakan fungsi paginasi dengan filter level JLPT untuk halaman pustaka membaca.
 */

"use server";

// ======================
// IMPORTS
// ======================
import { sanityClient, sanityPublicFetchOptions } from "@/lib/sanity.client";
import { PaginatedReadingResponse, LibraryItem } from "@/types/library";
import { getSanityReadingBySlug } from "@/lib/queries";

// ======================
// TYPES
// ======================
/**
 * Raw reading material item structure returned from Sanity CMS.
 */
interface SanityReadingItem {
  _id: string;
  title: string;
  slug: string;
  jlpt_level: string;
  difficulty: string;
  estimated_minutes: number;
  body?: unknown;
  _createdAt: string;
}

// ======================
// SERVER ACTIONS
// ======================

/**
 * Fetches paginated reading materials from Sanity CMS with optional search and JLPT level filters.
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

  try {
    // Build dynamic GROQ filter based on search query and JLPT level
    let filter = `_type == "readingMaterial"`;
    if (search) {
      filter += ` && (title match $search || body match $search || difficulty match $search)`;
    }
    if (level && level !== "all") {
      filter += ` && jlpt_level == $level`;
    }

    // GROQ query to fetch paginated data and total count in a single request
    const query = `{
      "data": *[${filter}] | order(_createdAt desc) [$offset...$limit] {
        _id,
        title,
        "slug": slug.current,
        jlpt_level,
        difficulty,
        estimated_minutes,
        body,
        _createdAt
      },
      "total": count(*[${filter}])
    }`;

    // Map query parameters, appending wildcard to search for partial matches
    const params: Record<string, string | number> = {
      offset,
      limit: offset + limit
    };

    if (search) {
      params.search = `${search}*`;
    }
    if (level && level !== "all") {
      params.level = level.toUpperCase();
    }

    const result = await sanityClient.fetch(query, params, sanityPublicFetchOptions);

    // Map Sanity schema fields to application-compatible LibraryItem structure
    return {
      data: (result.data || []).map((r: SanityReadingItem) => ({
        ...r,
        id: r._id,
        difficulty: r.difficulty || r.jlpt_level,
        body: typeof r.body === 'string' ? r.body : JSON.stringify(r.body)
      })),
      total: result.total || 0,
    };
  } catch (error) {
    console.error("Gagal mengambil data paginasi bacaan dari Sanity:", error);
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
    const data = (await getSanityReadingBySlug(slug)) as LibraryItem | null;
    if (!data) return null;

    // Map snake_case Sanity fields to camelCase application properties
    data.audioUrl = data.audio_url;
    data.imageUrl = data.image_url;
    data.videoUrl = data.video_url;

    return data;
  } catch (error) {
    console.error("Gagal mengambil detail bacaan:", error);
    return null;
  }
}