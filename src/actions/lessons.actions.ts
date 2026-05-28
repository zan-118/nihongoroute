"use server";

import { createClient } from "@/lib/supabase/server";
import { getSanityLessonsByCategory, getSanityLessonsByCategories } from "@/lib/queries";

/**
 * Server Action: getLessonDetail
 * 
 * Mengambil detail lengkap materi pelajaran bahasa Jepang berdasarkan slug teks.
 * Menghubungkan data pelajaran dengan data kategori kursusnya (course_categories) dari Supabase.
 * 
 * @param {string} slug - Slug unik pelajaran
 * @returns {Promise<Object | null>} Objek detail pelajaran, atau null jika gagal
 */
export async function getLessonDetail(slug: string) {
  const supabase = await createClient();
  await supabase.auth.getSession();
  const { data, error } = await supabase
    .from("lessons")
    .select("*, category:course_categories(*)")
    .eq("slug", slug)
    .single();

  if (error) {
    console.error("Failed to fetch lesson detail:", error);
    return null;
  }
  return data;
}

interface SanityLessonListItem {
  _id: string;
  title: string;
  slug: string;
}

/**
 * Server Action: getCourseCategories
 * 
 * Mengambil seluruh daftar kategori kursus dari Supabase, lalu menggabungkannya secara paralel
 * dengan mengambil daftar pelajaran dari Sanity CMS dalam satu kueri efisien.
 * Mengelompokkan pelajaran berdasarkan kategori masing-masing untuk rendering katalog Dasbor.
 * 
 * @returns {Promise<Array>} Daftar kategori kursus terformat lengkap beserta daftar preview pelajarannya
 */
export async function getCourseCategories() {
  const supabase = await createClient();
  await supabase.auth.getSession();
  const { data: categories, error } = await supabase
    .from("course_categories")
    .select("*")
    .order("order_number", { ascending: true });

  if (error) {
    console.error("Failed to fetch course categories:", error);
    return [];
  }

  if (!categories || categories.length === 0) return [];

  // Gather all category slugs and UUIDs in one array
  const categoryIds = categories.flatMap(cat => [cat.slug, cat.id]);

  // Fetch all lessons for all categories in 1 query
  const allLessons = await getSanityLessonsByCategories(categoryIds);

  // Group lessons by category (either slug or id matches category_id)
  const categoriesWithData = categories.map((cat) => {
    const lessons = allLessons.filter(
      (l: SanityLessonListItem & { category_id?: string }) => l.category_id === cat.id || l.category_id === cat.slug
    );

    return {
      ...cat,
      _id: cat.id,
      lessonCount: lessons.length,
      previews: lessons.slice(0, 4).map((l: SanityLessonListItem) => ({
        _id: l._id,
        title: l.title,
        slug: l.slug
      }))
    };
  });

  return categoriesWithData;
}

export async function getExamsByCategory(categoryId: string) {
  const supabase = await createClient();
  await supabase.auth.getSession();
  const { data, error } = await supabase
    .from("exams")
    .select("*")
    .eq("category_id", categoryId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Failed to fetch exams:", error);
    return [];
  }
  return data || [];
}
