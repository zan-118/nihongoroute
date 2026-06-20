/**
 * @file lessons.actions.ts
 * @description Server Actions untuk mengambil data pelajaran (lessons) dan kategori kursus.
 * Menggabungkan data dari Supabase (metadata kategori) dan Sanity CMS (konten pelajaran) secara paralel.
 */

"use server";

// ======================
// IMPORTS
// ======================
import { createStaticClient } from "@/lib/supabase/server";
import { getSanityLessonsByCategory, getSanityLessonsByCategories } from "@/lib/queries";

// ======================
// SERVER ACTIONS
// ======================

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
  const supabase = createStaticClient();
  const { data, error } = await supabase
    .from("lessons")
    .select("*, category:course_categories(*)")
    .eq("slug", slug)
    .single();

  if (error) {
    console.error("Gagal mengambil detail pelajaran:", error);
    return null;
  }
  return data;
}

// ======================
// TYPES
// ======================
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

  // Ambil semua data pelajaran untuk seluruh kategori dalam 1 kueri
  const allLessons = await getSanityLessonsByCategories(categoryIds);

  // Kelompokkan pelajaran berdasarkan kategori (yang cocok dengan slug atau id di category_id)
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
  // Legacy exams table has been dropped. Returning empty array.
  return [];
}
