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
 * Mengambil satu dokumen pelajaran (lesson) dari Sanity berdasarkan slug.
 * 
 * @param {string} slug - Slug unik pelajaran target
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
    return await sanityClient.fetch(query, { slug }, { cache: "no-store" });
  } catch (error) {
    console.error(`[getSanityLessonBySlug] Gagal mengambil data pelajaran dari Sanity:`, error);
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
    }, sanityPublicFetchOptions);
  } catch (error) {
    console.error(`[getSanityLessonsByCategory] Gagal mengambil daftar pelajaran dari Sanity:`, error);
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
    illustrations,
    quizzes[] {
      ...,
      "audio_url": coalesce(audio_url.asset->url, audio_url),
      "image_url": coalesce(image_url.asset->url, image_url)
    },
    seo
  }`;
  try {
    return await sanityClient.fetch(query, { slug }, { cache: "no-store" });
  } catch (error) {
    console.error(`[getSanityReadingBySlug] Gagal mengambil data bacaan dari Sanity:`, error);
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
    return await sanityClient.fetch(query, { slug }, { cache: "no-store" });
  } catch (error) {
    console.error(`[getSanityListeningBySlug] Gagal mengambil data menyimak dari Sanity:`, error);
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
    return await sanityClient.fetch(query, { slug }, { cache: "no-store" });
  } catch (error) {
    console.error(`[getSanityExamBySlug] Gagal mengambil data ujian dari Sanity:`, error);
    return null;
  }
}

/**
 * Mengambil daftar pelajaran dari Sanity secara massal berdasarkan daftar ID/Slug kategori.
 * @param categoryIds - Array berisi ID/Slug kategori
 */
export async function getSanityLessonsByCategories(categoryIds: string[]) {
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
