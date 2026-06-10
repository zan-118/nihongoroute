/**
 * @file listening.actions.ts
 * @description Server Actions untuk mengambil data materi menyimak (listening) dari Sanity CMS.
 * Menyediakan fungsi paginasi dengan filter level JLPT serta pengambilan satu tugas menyimak acak.
 */

"use server";

// ======================
// IMPORTS
// ======================
import { sanityClient, sanityPublicFetchOptions } from "@/lib/sanity.client";
import { PaginatedListeningResponse, ListeningTaskItem } from "@/types/library";

// ======================
// TYPES
// ======================
interface SanityListeningItem {
  _id: string;
  title: string;
  slug: string;
  jlpt_level: string;
  difficulty: string;
  audio_url: string;
  body?: unknown;
  _createdAt: string;
}

// ======================
// SERVER ACTIONS
// ======================

/**
 * Mengambil materi mendengarkan (listening) dengan paginasi, pencarian, dan filter level dari Sanity.
 */
export async function getPaginatedListening(
  page: number,
  limit: number,
  search: string = "",
  level: string = ""
): Promise<PaginatedListeningResponse> {
  const offset = (page - 1) * limit;

  try {
    let filter = `_type == "listeningMaterial"`;
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
        audio_url,
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

    const result = await sanityClient.fetch(query, params, sanityPublicFetchOptions);

    return {
      data: (result.data || []).map((l: SanityListeningItem) => ({
        ...l,
        id: l._id,
        audioUrl: l.audio_url,
        transcript: l.body ? JSON.stringify(l.body) : ''
      })),
      total: result.total || 0,
    };
  } catch (error) {
    console.error("Gagal mengambil data paginasi menyimak dari Sanity:", error);
    return { data: [], total: 0 };
  }
}

/**
 * Mengambil satu task listening acak berdasarkan JLPT level (Dipakai di Homepage).
 */
export async function getRandomListeningTask(level: string = "N5"): Promise<ListeningTaskItem | null> {
  try {
    const query = `*[
      _type == "listeningMaterial" && jlpt_level == $level
    ] | order(_createdAt desc) [0...10] {
      _id, title, "slug": slug.current, audio_url, body
    }`;
    
    const data = await sanityClient.fetch(query, { level }, sanityPublicFetchOptions);

    if (!data || data.length === 0) return null;

    const randomItem = data[Math.floor(Math.random() * data.length)];
    return {
      id: randomItem._id,
      title: randomItem.title,
      slug: randomItem.slug,
      audioUrl: randomItem.audio_url,
      transcript: randomItem.body ? JSON.stringify(randomItem.body) : ''
    };
  } catch (error) {
    console.error("Gagal mengambil tugas menyimak acak dari Sanity:", error);
    return null;
  }
}
