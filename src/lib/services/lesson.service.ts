/**
 * @file lesson.service.ts
 * @description Server-side orchestrators untuk mengambil data pelajaran (lessons), artikel, dan kategori kursus dari Supabase.
 * Logika hidrasi relasi didelegasikan ke LessonHydrationEngine.
 */



// ======================
// IMPORTS
// ======================
import { createStaticClient } from "@/lib/supabase/server";
import { LibraryItem } from "@/types/library";
import { getLibraryItemBySlug } from "@/actions/library.actions";
import {
  hydrateLessonDetail,
  parseArray,
  type RawLessonRow,
  type LessonRelationFetcher,
  type HydrationVocabRow,
  type HydrationKanjiRow,
  type HydrationGrammarRow,
} from "@/lib/services/lesson-hydration-engine";

// ======================
// SERVER ACTIONS
// ======================

/**
 * Mengambil detail lengkap materi pelajaran bahasa Jepang berdasarkan slug teks.
 * Menghubungkan data pelajaran dengan data kategori kursusnya (course_categories) dari Supabase.
 * 
 * @param {string} slug - Slug unik pelajaran
 * @returns {Promise<any | null>} Objek detail pelajaran, atau null jika gagal
 */
export async function getLessonDetail(slug: string) {
  const supabase = createStaticClient();
  const { data: rawData, error } = await supabase
    .from("lessons")
    .select("*, course_categories(*)")
    .eq("slug", slug)
    .maybeSingle();

  if (!rawData || error) {
    // Fallback ke tabel articles jika data pelajaran tidak ditemukan
    const { data: artData } = await supabase
      .from("articles")
      .select("*, course_categories(*)")
      .eq("slug", slug)
      .maybeSingle();
    if (artData) return { ...artData, category: artData.course_categories };

    if (error) {
      console.error("Gagal mengambil detail pelajaran:", error);
    }
    return null;
  }

  return { ...rawData, category: rawData.course_categories };
}

// ======================
// INTERNAL TYPES
// ======================

/**
 * Representasi item pelajaran minimal.
 */
interface LessonListItem {
  _id: string;
  title: string;
  slug: string;
}

// VocabRow, GrammarRow, ContentBlock — dipindahkan ke lesson-hydration-engine.ts

/**
 * Mengambil seluruh daftar kategori kursus dari Supabase, lalu menggabungkannya secara paralel
 * dengan mengambil daftar pelajaran dari database Supabase dalam satu kueri efisien.
 * Mengelompokkan pelajaran berdasarkan kategori masing-masing untuk rendering katalog Dasbor.
 * 
 * @returns {Promise<Array<any>>} Daftar kategori kursus terformat lengkap beserta daftar preview pelajarannya
 */
export async function getCourseCategories() {
  const supabase = createStaticClient();
  const { data: categories, error } = await supabase
    .from("course_categories")
    .select("*")
    .order("order_number", { ascending: true });

  if (error) {
    console.error("Gagal mengambil kategori kursus:", error);
    return [];
  }

  if (!categories || categories.length === 0) return [];

  // Kumpulkan seluruh slug kategori dan UUID ke dalam satu array
  const categoryIds = categories.flatMap(cat => [cat.slug, cat.id]);

  // Ambil semua data pelajaran dari Supabase lessons
  const { data: dbLessons } = await supabase
    .from("lessons")
    .select("id, title, slug, category_id, order_number, summary")
    .in("category_id", categories.map(c => c.id))
    .order("order_number", { ascending: true });

  // Ambil semua data artikel dari Supabase articles
  const { data: dbArticles } = await supabase
    .from("articles")
    .select("id, title, slug, category_id, order_number, summary")
    .in("category_id", categories.map(c => c.id))
    .order("order_number", { ascending: true });

  // Gabungkan pelajaran dan artikel ke dalam satu array
  const allDbLessons = [
    ...(dbLessons || []),
    ...(dbArticles || [])
  ];

  // Normalisasi struktur data
  const supabaseLessons = allDbLessons.map((l) => ({
    _id: l.id,
    title: l.title,
    slug: l.slug,
    category_id: l.category_id,
    order_number: l.order_number,
    summary: l.summary
  }));

  const allLessons = supabaseLessons;

  // Kelompokkan pelajaran berdasarkan kategori (yang cocok dengan slug atau id di category_id)
  const categoriesWithData = categories.map((cat) => {
    const lessons = allLessons.filter(
      (l: LessonListItem & { category_id?: string }) => l.category_id === cat.id || l.category_id === cat.slug
    );

    return {
      ...cat,
      _id: cat.id,
      lessonCount: lessons.length,
      lessons: lessons.map((l: LessonListItem) => ({
        _id: l._id,
        title: l.title,
        slug: l.slug
      })),
      previews: lessons.slice(0, 4).map((l: LessonListItem) => ({
        _id: l._id,
        title: l.title,
        slug: l.slug
      }))
    };
  });

  return categoriesWithData;
}

/**
 * Mengambil daftar ujian berdasarkan kategori.
 * 
 * @deprecated Tabel ujian lama telah dihapus. Selalu mengembalikan array kosong.
 * @param {string} categoryId - ID Kategori
 * @returns {Promise<Array<any>>} Array kosong
 */
export async function getExamsByCategory(categoryId: string) {
  // Legacy exams table has been dropped. Returning empty array.
  return [];
}

const isUUID = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);

/**
 * Membuat implementasi LessonRelationFetcher berbasis Supabase.
 * Mengapsulasi semua query relasi ke dalam satu objek fetcher.
 */
function createSupabaseFetcher(): LessonRelationFetcher {
  const supabase = createStaticClient();
  const VOCAB_SELECT = "id, word, furigana, romaji, meaning_id, hinshi, pitch_accent, usage_notes, mnemonic, slug, audio_url";
  const KANJI_SELECT = "id, character, meaning, onyomi, kunyomi, jlpt_level, stroke_order_svg, slug";
  const GRAMMAR_SELECT = "id, title, meaning, formation, formation_furigana, slug, jlpt_level, examples, notes";

  return {
    async fetchVocabByIds(ids) {
      const { data } = await supabase.from("vocab").select(VOCAB_SELECT).in("id", ids);
      return (data || []) as HydrationVocabRow[];
    },
    async fetchVocabByWordsOrSlugs(terms) {
      const [byWord, bySlug] = await Promise.all([
        supabase.from("vocab").select(VOCAB_SELECT).in("word", terms),
        supabase.from("vocab").select(VOCAB_SELECT).in("slug", terms),
      ]);
      const merged = [...(byWord.data || []), ...(bySlug.data || [])];
      return Array.from(new Map(merged.map(item => [item.id, item])).values()) as HydrationVocabRow[];
    },
    async fetchKanjiByIds(ids) {
      const { data } = await supabase.from("kanji").select(KANJI_SELECT).in("id", ids);
      return (data || []) as HydrationKanjiRow[];
    },
    async fetchKanjiByCharacters(chars) {
      const { data } = await supabase.from("kanji").select(KANJI_SELECT).in("character", chars);
      return (data || []) as HydrationKanjiRow[];
    },
    async fetchGrammarByIds(ids) {
      const { data } = await supabase.from("grammar").select(GRAMMAR_SELECT).in("id", ids);
      return (data || []) as HydrationGrammarRow[];
    },
    async fetchGrammarByTitlesOrSlugs(terms) {
      const [byTitle, bySlug] = await Promise.all([
        supabase.from("grammar").select(GRAMMAR_SELECT).in("title", terms),
        supabase.from("grammar").select(GRAMMAR_SELECT).in("slug", terms),
      ]);
      const merged = [...(byTitle.data || []), ...(bySlug.data || [])];
      return Array.from(new Map(merged.map(item => [item.id, item])).values()) as HydrationGrammarRow[];
    },
    async fetchListeningBySlugs(slugs) {
      const { data } = await supabase.from("listening").select("*").in("slug", slugs);
      return (data || []) as Record<string, unknown>[];
    },
    async fetchReadingBySlugs(slugs) {
      const { data } = await supabase.from("reading").select("*").in("slug", slugs);
      return (data || []) as Record<string, unknown>[];
    },
  };
}

/**
 * Mengambil detail satu pelajaran berdasarkan slug atau ID beserta relasinya.
 * Mengambil raw row dari Supabase, lalu mendelegasikan hidrasi ke LessonHydrationEngine.
 *
 * @param slugOrId - Slug atau UUID pelajaran
 * @returns Objek detail pelajaran terformat lengkap, atau null jika tidak ditemukan
 */
export async function getLibraryLessonDetail(slugOrId: string): Promise<LibraryItem | null> {
  const supabase = createStaticClient();

  try {
    // 1. Coba ambil dari tabel lessons
    const query = supabase
      .from("lessons")
      .select("*, course_categories(*)");

    if (isUUID(slugOrId)) {
      query.eq("id", slugOrId);
    } else {
      query.eq("slug", slugOrId);
    }

    const { data: dbLesson, error: dbErr } = await query.maybeSingle();
    if (dbErr) {
      console.error(`[getLibraryLessonDetail] Supabase query error:`, dbErr);
    }

    let rawRow: RawLessonRow | null = null;

    if (dbLesson) {
      rawRow = { ...dbLesson, category: dbLesson.course_categories || dbLesson.category, _sourceTable: "lessons" as const };
    } else {
      // 2. Fallback ke tabel articles
      const { data: dbArticle } = await supabase
        .from("articles")
        .select("*, course_categories(*)")
        .eq(isUUID(slugOrId) ? "id" : "slug", slugOrId)
        .maybeSingle();

      if (dbArticle) {
        rawRow = { ...dbArticle, category: dbArticle.course_categories || dbArticle.category, _sourceTable: "articles" as const };
      }
    }

    if (!rawRow) return null;

    // 3. Delegasikan ke LessonHydrationEngine
    const fetcher = createSupabaseFetcher();
    return await hydrateLessonDetail(rawRow, fetcher);
  } catch (error) {
    console.error(`Gagal mengambil detail pelajaran:`, error);
    return null;
  }
}

/**
 * Fetches lesson data and navigation list from Supabase.
 *
 * @param categoryId - Course category slug.
 * @param slug - Lesson slug.
 * @returns Lesson details and navigation array, or null if category not found.
 */
export async function getLessonData(categoryId: string, slug: string) {
  const supabase = createStaticClient();

  // 1. Ambil Kategori & Pelajaran secara paralel
  const [categoryRes, lesson] = await Promise.all([
    supabase
      .from("course_categories")
      .select("id, title, type")
      .eq("slug", categoryId.toLowerCase())
      .single(),
    getLibraryItemBySlug("lessons", slug)
  ]);

  const category = categoryRes.data;
  if (!category) return null;

  if (lesson) {
    lesson.levelTitle = category.title;
    lesson.categoryType = category.type;
    lesson.levelCode = categoryId;
  }

  // 2. Dapatkan Navigasi
  let dbLessons = [];
  if (category.type === "general" || category.type === "article") {
    const { data } = await supabase
      .from("articles")
      .select("id, title, slug, category_id, order_number, summary")
      .eq("category_id", category.id)
      .order("order_number", { ascending: true });
    dbLessons = data || [];
  } else {
    const { data } = await supabase
      .from("lessons")
      .select("id, title, slug, category_id, order_number, summary")
      .eq("category_id", category.id)
      .order("order_number", { ascending: true });
    dbLessons = data || [];
  }

  // Map database fields to match expected structure.
  const supabaseLessons = dbLessons.map((l) => ({
    _id: l.id,
    title: l.title,
    slug: l.slug,
    category_id: l.category_id,
    order_number: l.order_number,
    summary: l.summary
  }));

  // Sort navigation items by order number ascending.
  const nav = supabaseLessons.sort((a, b) => (a.order_number || 0) - (b.order_number || 0));

  return { lesson, nav };
}

/**
 * Fetch top Lesson/Course category & slug params for static build generation (ISR).
 * Filters explicitly by beginner levels (N5, N4, kana).
 * 
 * @param limit - Maximum number of params to pre-render.
 * @returns Array of objects containing categoryId and slug.
 */
export async function getLessonStaticParams(limit: number = 100): Promise<{ categoryId: string; slug: string }[]> {
  const supabase = createStaticClient();
  try {
    const { data: categories, error: catErr } = await supabase
      .from("course_categories")
      .select("id, slug")
      .in("slug", ["n5", "n4", "hiragana", "katakana"]);

    if (catErr || !categories || categories.length === 0) return [];

    const categoryMap = new Map<string, string>();
    categories.forEach((c) => categoryMap.set(c.id, c.slug));

    const categoryIds = categories.map((c) => c.id);

    const [lessonsRes, articlesRes] = await Promise.all([
      supabase
        .from("lessons")
        .select("slug, category_id")
        .in("category_id", categoryIds)
        .not("slug", "is", null)
        .order("order_number", { ascending: true })
        .limit(limit),
      supabase
        .from("articles")
        .select("slug, category_id")
        .in("category_id", categoryIds)
        .not("slug", "is", null)
        .order("order_number", { ascending: true })
        .limit(limit),
    ]);

    const combined = [...(lessonsRes.data || []), ...(articlesRes.data || [])];
    const results: { categoryId: string; slug: string }[] = [];

    for (const item of combined) {
      const catSlug = categoryMap.get(item.category_id);
      if (catSlug && item.slug) {
        results.push({ categoryId: catSlug, slug: item.slug });
      }
      if (results.length >= limit) break;
    }

    return results;
  } catch (error) {
    console.error("Gagal mengambil static params lessons:", error);
    return [];
  }
}