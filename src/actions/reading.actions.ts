/**
 * @file reading.actions.ts
 * @description Server Actions untuk mengambil data materi membaca (reading) dari Sanity CMS.
 * Menyediakan fungsi paginasi dengan filter level JLPT untuk halaman pustaka membaca.
 */

"use server";

// ======================
// IMPORTS
// ======================
import { sanityClient } from "@/lib/sanity.client";
import { PaginatedReadingResponse } from "@/types/library";

// ======================
// TYPES
// ======================
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
 * Mengambil materi membaca (reading) dengan paginasi, pencarian, dan filter level dari Sanity.
 */
export async function getPaginatedReading(
  page: number,
  limit: number,
  search: string = "",
  level: string = ""
): Promise<PaginatedReadingResponse> {
  const offset = (page - 1) * limit;

  try {
    let filter = `_type == "readingMaterial"`;
    if (search) {
      filter += ` && (title match $search || body match $search || difficulty match $search)`;
    }
    if (level && level !== "all") {
      filter += ` && jlpt_level == $level`;
    }

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

    const result = await sanityClient.fetch(query, params);

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
