"use server";

import { sanityClient } from "@/lib/sanity.client";
import { PaginatedListeningResponse, ListeningTaskItem } from "@/types/library";

/**
 * Mengambil materi mendengarkan (listening) dengan paginasi dan filter level dari Sanity.
 */
export async function getPaginatedListening(
  page: number,
  limit: number,
  level: string = ""
): Promise<PaginatedListeningResponse> {
  const offset = (page - 1) * limit;

  try {
    let filter = `_type == "listeningMaterial"`;
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

    const params: any = {
      offset,
      limit: offset + limit
    };

    if (level && level !== "all") {
      params.level = level.toUpperCase();
    }

    const result = await sanityClient.fetch(query, params);

    return {
      data: (result.data || []).map((l: any) => ({
        ...l,
        id: l._id,
        audioUrl: l.audio_url,
        transcript: l.body ? JSON.stringify(l.body) : ''
      })),
      total: result.total || 0,
    };
  } catch (error) {
    console.error("Failed to fetch paginated listening from Sanity:", error);
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
    
    const data = await sanityClient.fetch(query, { level });

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
    console.error("Failed to fetch random listening task from Sanity:", error);
    return null;
  }
}
