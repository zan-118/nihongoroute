/**
 * @file queries.ts
 * @description Kueri GROQ universal untuk mengambil konten edukasi statis dari Sanity.
 * @module SanityQueries
 */

import { sanityClient } from "./sanity.client";

/**
 * Mengambil satu dokumen pelajaran (lesson) dari Sanity berdasarkan slug.
 * @param slug - Slug unik pelajaran.
 */
export async function getSanityLessonBySlug(slug: string) {
  const query = `*[_type == "lesson" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    order_number,
    category_id,
    summary,
    estimated_minutes,
    is_premium,
    is_published,
    content_blocks,
    quizzes,
    vocab_list,
    kanji_list,
    grammar_list,
    reading_list,
    listening_list,
    seo
  }`;

  try {
    return await sanityClient.fetch(query, { slug });
  } catch (error) {
    console.error(`[getSanityLessonBySlug] Error fetching lesson from Sanity:`, error);
    return null;
  }
}

/**
 * Mengambil daftar seluruh pelajaran dari Sanity berdasarkan ID/Slug kategori.
 * @param categoryIdOrSlug - Slug kategori (misal: 'n5')
 * @param categoryIdUuid - UUID kategori dari Supabase
 */
export async function getSanityLessonsByCategory(categoryIdOrSlug: string, categoryIdUuid?: string) {
  const query = `*[_type == "lesson" && (category_id == $idOrSlug || category_id == $idUuid)] | order(order_number asc) {
    _id,
    title,
    "slug": slug.current,
    summary,
    order_number
  }`;

  try {
    return await sanityClient.fetch(query, {
      idOrSlug: categoryIdOrSlug,
      idUuid: categoryIdUuid || categoryIdOrSlug
    });
  } catch (error) {
    console.error(`[getSanityLessonsByCategory] Error fetching lessons from Sanity:`, error);
    return [];
  }
}

/**
 * Mengambil satu materi bacaan dari Sanity berdasarkan slug.
 */
export async function getSanityReadingBySlug(slug: string) {
  const query = `*[_type == "readingMaterial" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    jlpt_level,
    difficulty,
    estimated_minutes,
    body,
    hiragana,
    translation,
    "audio_url": coalesce(audio_url.asset->url, audio_url),
    "image_url": coalesce(image_url.asset->url, image_url),
    "video_url": coalesce(video_url.asset->url, video_url),
    quizzes[] {
      ...,
      "audio_url": coalesce(audio_url.asset->url, audio_url),
      "image_url": coalesce(image_url.asset->url, image_url)
    },
    seo
  }`;
  try {
    return await sanityClient.fetch(query, { slug });
  } catch (error) {
    console.error(`[getSanityReadingBySlug] Error fetching reading from Sanity:`, error);
    return null;
  }
}

/**
 * Mengambil satu materi menyimak dari Sanity berdasarkan slug.
 */
export async function getSanityListeningBySlug(slug: string) {
  const query = `*[_type == "listeningMaterial" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    jlpt_level,
    difficulty,
    body,
    hiragana,
    translation,
    audio_url,
    image_url,
    video_url,
    quizzes,
    seo
  }`;
  try {
    return await sanityClient.fetch(query, { slug });
  } catch (error) {
    console.error(`[getSanityListeningBySlug] Error fetching listening from Sanity:`, error);
    return null;
  }
}

/**
 * Mengambil satu ujian (exam) dari Sanity berdasarkan slug.
 */
export async function getSanityExamBySlug(slug: string) {
  const query = `*[_type == "mockExam" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    description,
    time_limit,
    passing_score,
    is_published,
    questions
  }`;
  try {
    return await sanityClient.fetch(query, { slug });
  } catch (error) {
    console.error(`[getSanityExamBySlug] Error fetching exam from Sanity:`, error);
    return null;
  }
}

