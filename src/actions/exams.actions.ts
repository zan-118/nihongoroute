/**
 * @file exams.actions.ts
 * @description Server Actions untuk mengambil data kategori kursus, daftar simulasi ujian (Mock Exam),
 * dan detail soal ujian dari Supabase.
 */

"use server";

// ======================
// IMPORTS
// ======================
import { createStaticClient, createClient } from "@/lib/supabase/server";
import { LibraryItem } from "@/types/library";
import {
  getSupabaseExamTemplateBySlug,
  getSupabaseExamTemplatesList,
} from "./jlpt-exams.actions";
import type {
  ExamData,
} from "@/components/features/exams/mock-engine/types";

// ======================
// SERVER ACTIONS
// ======================

/**
 * Database row structure for lessons and articles.
 */
interface DBLessonRow {
  id: string;
  title: string;
  slug: string;
  category_id: string;
  order_number: number | null;
  summary: string | null;
  image_url: string | null;
}

/**
 * Server Action: getCourseCategoryData
 * 
 * Mengambil data kategori kursus beserta pelajaran dan simulasi ujian JLPT yang terkait dari Supabase.
 * 
 * @param slug - Slug unik kategori kursus (misal: "n5", "n4")
 * @returns Mengembalikan objek kategori, daftar pelajaran, dan daftar simulasi ujian
 */
export async function getCourseCategoryData(slug: string) {
  const supabase = await createClient();
  
  try {
    // 1. Ambil Kategori dari Supabase
    const { data: category, error: catError } = await supabase
      .from("course_categories")
      .select("id, title, type, description, slug")
      .eq("slug", slug)
      .single();

    if (catError && catError.code !== "PGRST116") throw catError;
    if (!category) return { category: null, lessons: [], mockExams: [] };

    // 2. Ambil Pelajaran dari Supabase
    let dbLessons: DBLessonRow[] = [];
    if (category.type === "general" || category.type === "article") {
      const { data } = await supabase
        .from("articles")
        .select("id, title, slug, category_id, order_number, summary, image_url")
        .eq("category_id", category.id)
        .order("order_number", { ascending: true });
      dbLessons = (data || []) as unknown as DBLessonRow[];
    } else {
      const { data } = await supabase
        .from("lessons")
        .select("id, title, slug, category_id, order_number, summary, image_url")
        .eq("category_id", category.id)
        .order("order_number", { ascending: true });
      dbLessons = (data || []) as unknown as DBLessonRow[];
    }

    // Map database rows to normalized lesson objects
    const supabaseLessons = dbLessons.map((l) => ({
      _id: l.id,
      title: l.title,
      slug: l.slug,
      category_id: l.category_id,
      order_number: l.order_number,
      summary: l.summary,
      image_url: l.image_url
    }));

    // Sort lessons by order number ascending
    const lessons = supabaseLessons.sort((a, b) => (a.order_number || 0) - (b.order_number || 0));

    // 3. Ambil Ujian dari Supabase berdasarkan category_id / jlpt_level
    const supabaseMockExams = await getSupabaseExamTemplatesList({
      categoryId: category.id,
      jlptLevel: category.slug,
    });

    return {
      category: {
        _id: category.id,
        title: category.title,
        type: category.type,
        description: category.description,
        slug: category.slug
      },
      lessons: (lessons || []).map((l) => ({
        _id: l._id,
        title: l.title,
        summary: l.summary || "",
        slug: l.slug,
        image_url: l.image_url || undefined
      })),
      mockExams: supabaseMockExams
    };
  } catch (error) {
    console.error("Gagal mengambil data kategori kursus:", error);
    return { category: null, lessons: [], mockExams: [] };
  }
}

/**
 * Server Action: getExamsList
 * 
 * Mengambil daftar ringkas seluruh simulasi ujian (Mock Exams) aktif dari Supabase.
 * 
 * @returns Daftar simulasi ujian terformat
 */
export async function getExamsList() {
  try {
    return await getSupabaseExamTemplatesList();
  } catch (error) {
    console.error("Gagal mengambil daftar simulasi ujian dari Supabase:", error);
    return [];
  }
}

/**
 * Server Action: getExamByIdOrSlug
 * 
 * Mengambil detail konten lengkap untuk satu simulasi ujian JLPT/JFT dari Supabase.
 * 
 * @param idOrSlug - ID template atau slug unik simulasi ujian
 * @returns Detail simulasi ujian terformat lengkap, atau null jika tidak ditemukan
 */
export async function getExamByIdOrSlug(idOrSlug: string): Promise<ExamData | null> {
  try {
    return await getSupabaseExamTemplateBySlug(idOrSlug);
  } catch (error) {
    console.error("Gagal mengambil detail simulasi ujian dari Supabase:", error);
    return null;
  }
}

/**
 * Mengambil detail satu simulasi ujian berdasarkan slug.
 * 
 * @param slug - Slug unik simulasi ujian
 * @returns Detail item pustaka ujian, atau null jika gagal
 */
export async function getLibraryExamDetail(slug: string): Promise<LibraryItem | null> {
  const supabase = createStaticClient();
  try {
    const { data } = await supabase
      .from("jlpt_exam_templates")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (!data) return null;

    return {
      id: data.id,
      title: data.title,
      slug: data.slug,
      description: data.description,
      status: data.is_published ? "published" : "draft",
      difficulty: data.jlpt_level,
      estimated_minutes: data.time_limit
    } as unknown as LibraryItem;
  } catch (error) {
    console.error("Gagal mengambil detail ujian dari Supabase:", error);
    return null;
  }
}