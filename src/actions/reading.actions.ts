"use server";

import { sanityClient } from "@/lib/sanity.client";
import { createClient } from "@/lib/supabase/server";
import { PaginatedReadingResponse } from "@/types/library";

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

/**
 * Mengambil materi membaca (reading) dengan paginasi dan filter level dari Sanity.
 */
export async function getPaginatedReading(
  page: number,
  limit: number,
  level: string = ""
): Promise<PaginatedReadingResponse> {
  const supabase = await createClient();
  await supabase.auth.getSession();
  const offset = (page - 1) * limit;

  try {
    let filter = `_type == "readingMaterial"`;
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
    console.error("Failed to fetch paginated reading from Sanity:", error);
    return { data: [], total: 0 };
  }
}
