/**
 * @file queries.ts
 * @description Kueri GROQ universal luring-ready untuk menarik konten edukasi statis (Lesson, Reading, Listening, Mock Exam) dari Sanity CMS. Bertindak sebagai split-source data editorial statis NihongoRoute.
 */

// ==========================================
// IMPORT & DEPENDENSI
// ==========================================
import { sanityClient, sanityPublicFetchOptions } from "@/lib/sanity.client";

// ==========================================
// KUERI GROQ SANITY CMS
// ==========================================
/**
 * Fetch single lesson by slug.
 * 
 * @param slug - Lesson slug.
 * @returns Lesson document or null.
 */
export async function getSanityLessonBySlug(slug: string) {
  // GROQ query to fetch complete lesson details
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
    // Bypass cache to get fresh lesson content
    return await sanityClient.fetch(query, { slug }, { cache: "no-store" });
  } catch (error) {
    console.error(`[getSanityLessonBySlug] Gagal mengambil data pelajaran dari Sanity:`, error);
    return null;
  }
}

/**
 * Fetch lessons by category ID or UUID.
 * 
 * @param categoryIdOrSlug - Category slug or ID.
 * @param categoryIdUuid - Optional category UUID.
 * @returns Array of lessons.
 */
export async function getSanityLessonsByCategory(categoryIdOrSlug: string, categoryIdUuid?: string) {
  // Match either slug or UUID to support legacy and new identifiers
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
    }, sanityPublicFetchOptions);
  } catch (error) {
    console.error(`[getSanityLessonsByCategory] Gagal mengambil daftar pelajaran dari Sanity:`, error);
    return [];
  }
}

/**
 * Fetch reading material by slug.
 * 
 * @param slug - Reading slug.
 * @returns Reading document or null.
 */
export async function getSanityReadingBySlug(slug: string) {
  // Resolve asset URLs if they exist as references, fallback to raw string
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
    illustrations,
    quizzes[] {
      ...,
      "audio_url": coalesce(audio_url.asset->url, audio_url),
      "image_url": coalesce(image_url.asset->url, image_url)
    },
    seo
  }`;
  try {
    // Bypass cache to get fresh reading content
    return await sanityClient.fetch(query, { slug }, { cache: "no-store" });
  } catch (error) {
    console.error(`[getSanityReadingBySlug] Gagal mengambil data bacaan dari Sanity:`, error);
    return null;
  }
}

/**
 * Fetch listening material by slug.
 * 
 * @param slug - Listening slug.
 * @returns Listening document or null.
 */
export async function getSanityListeningBySlug(slug: string) {
  // Resolve asset URLs if they exist as references, fallback to raw string
  const query = `*[_type == "listeningMaterial" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    jlpt_level,
    difficulty,
    body,
    timestamps,
    hiragana,
    translation,
    "audio_url": coalesce(audio_url.asset->url, audio_url),
    "image_url": coalesce(image_url.asset->url, image_url),
    "video_url": coalesce(video_url.asset->url, video_url),
    illustrations,
    quizzes[] {
      ...,
      "audio_url": coalesce(audio_url.asset->url, audio_url),
      "image_url": coalesce(image_url.asset->url, image_url)
    },
    seo
  }`;
  try {
    // Bypass cache to get fresh listening content
    return await sanityClient.fetch(query, { slug }, { cache: "no-store" });
  } catch (error) {
    console.error(`[getSanityListeningBySlug] Gagal mengambil data menyimak dari Sanity:`, error);
    return null;
  }
}

/**
 * Fetch mock exam by slug.
 * 
 * @param slug - Exam slug.
 * @returns Exam document or null.
 */
export async function getSanityExamBySlug(slug: string) {
  // Resolve asset URLs if they exist as references, fallback to raw string
  const query = `*[_type == "mockExam" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    description,
    time_limit,
    passing_score,
    levelCode,
    "choukaiAudioUrl": coalesce(choukaiAudio.asset->url, choukaiAudio),
    is_published,
    questions[] {
      _key,
      section,
      questionText,
      "imageUrl": coalesce(imageUrl.asset->url, imageUrl),
      "audioUrl": coalesce(audioUrl.asset->url, audioUrl),
      options,
      correctAnswer
    }
  }`;
  try {
    // Bypass cache to get fresh exam content
    return await sanityClient.fetch(query, { slug }, { cache: "no-store" });
  } catch (error) {
    console.error(`[getSanityExamBySlug] Gagal mengambil data ujian dari Sanity:`, error);
    return null;
  }
}

/**
 * Fetch lessons for multiple categories.
 * 
 * @param categoryIds - Array of category IDs.
 * @returns Array of lessons.
 */
export async function getSanityLessonsByCategories(categoryIds: string[]) {
  // Match lessons belonging to any category in the array
  const query = `*[_type == "lesson" && category_id in $ids] | order(order_number asc) {
    _id,
    title,
    "slug": slug.current,
    summary,
    order_number,
    category_id
  }`;

  try {
    return await sanityClient.fetch(query, { ids: categoryIds }, sanityPublicFetchOptions);
  } catch (error) {
    console.error(`[getSanityLessonsByCategories] Gagal mengambil daftar pelajaran massal dari Sanity:`, error);
    return [];
  }
}