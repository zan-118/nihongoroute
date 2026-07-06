/**
 * @file exams.actions.ts
 * @description Server Actions untuk mengambil data kategori kursus, daftar simulasi ujian (Mock Exam),
 * dan detail soal ujian dari Sanity CMS serta Supabase (arsitektur split-source).
 */

"use server";

// ======================
// IMPORTS
// ======================
import { createStaticClient } from "@/lib/supabase/server";
import { sanityClient, sanityPublicFetchOptions } from "@/lib/sanity.client";
import { getSanityExamBySlug } from "@/lib/queries";
import { LibraryItem } from "@/types/library";
import {
  getSupabaseExamTemplateBySlug,
  getSupabaseExamTemplatesList,
} from "./jlpt-exams.actions";
import type {
  ExamData,
  ExamQuestion,
} from "@/components/features/exams/mock-engine/types";

// ======================
// TYPES
// ======================
interface SanityLessonListItem {
  _id: string;
  title: string;
  summary?: string;
  slug: string;
}

interface SanityMockExamListItem {
  _id: string;
  title: string;
  time_limit?: number;
  passing_score?: number;
  slug: string;
  category_id?: string;
  description?: string;
  levelCode?: string;
}

interface MockExamListItem {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  levelCode: string;
  timeLimit: number;
  passingScore: number;
  source?: "sanity" | "supabase";
}

import { ExamPortableTextBlock } from "@/components/features/exams/mock-engine/ExamQuestionText";

interface SanityQuestionItem {
  _key: string;
  section: string;
  questionText: string | ExamPortableTextBlock[];
  imageUrl?: string;
  audioUrl?: string;
  options: string[];
  correctAnswer: number | string;
}

function normalizeExamSection(section: string): ExamQuestion["section"] {
  if (
    section === "vocabulary" ||
    section === "grammar" ||
    section === "reading" ||
    section === "listening"
  ) {
    return section;
  }

  return "vocabulary";
}

// ======================
// SERVER ACTIONS
// ======================

/**
 * Server Action: getCourseCategoryData
 * 
 * Mengambil data kategori kursus beserta pelajaran dan simulasi ujian JLPT yang terkait.
 * Menghubungkan basis data Supabase (untuk metadata kategori) dengan Sanity CMS 
 * (untuk konten pelajaran statis dan modul ujian) secara paralel menggunakan arsitektur split-source.
 * 
 * @param {string} slug - Slug unik kategori kursus (misal: "n5", "n4")
 * @returns {Promise<Object>} Mengembalikan objek kategori, daftar pelajaran, dan daftar simulasi ujian
 */
export async function getCourseCategoryData(slug: string) {
  const supabase = createStaticClient();
  
  try {
    // 1. Ambil Kategori (Tetap dari Supabase karena course_categories ada di Supabase)
    const { data: category, error: catError } = await supabase
      .from("course_categories")
      .select("id, title, type, description, slug")
      .eq("slug", slug)
      .single();

    if (catError && catError.code !== "PGRST116") throw catError;
    if (!category) return { category: null, lessons: [], mockExams: [] };

    // 2. Ambil Pelajaran secara hibrida (Supabase & Sanity)
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

    const supabaseLessons = dbLessons.map((l) => ({
      _id: l.id,
      title: l.title,
      slug: l.slug,
      category_id: l.category_id,
      order_number: l.order_number,
      summary: l.summary
    }));

    const lessons = supabaseLessons.sort((a, b) => (a.order_number || 0) - (b.order_number || 0));

    // 3. Ambil Ujian dari Sanity berdasarkan category_id
    const mockExamsQuery = `*[_type == "mockExam" && (category_id == $categoryId || category_id == $categorySlug) && is_published == true] | order(_createdAt desc) {
      _id,
      title,
      time_limit,
      passing_score,
      "slug": slug.current,
      levelCode
    }`;
    const mockExams = await sanityClient.fetch(mockExamsQuery, { 
      categoryId: category.id,
      categorySlug: category.slug
    }, sanityPublicFetchOptions);

    const sanityMockExams: MockExamListItem[] = (mockExams || []).map((e: SanityMockExamListItem) => ({
      id: e._id,
      title: e.title,
      timeLimit: e.time_limit ?? 30,
      passingScore: e.passing_score ?? 70,
      slug: e.slug || "",
      levelCode: e.levelCode || "general",
      source: "sanity"
    }));
    const supabaseMockExams = await getSupabaseExamTemplatesList({
      categoryId: category.id,
      jlptLevel: category.slug,
    });
    const legacyKeys = new Set(
      sanityMockExams.map((exam) => exam.slug || exam.id).filter(Boolean)
    );
    const mergedMockExams = [
      ...sanityMockExams,
      ...supabaseMockExams.filter(
        (exam) => !legacyKeys.has(exam.slug || exam.id)
      ),
    ];

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
        slug: l.slug
      })),
      mockExams: mergedMockExams
    };
  } catch (error) {
    console.error("Gagal mengambil data kategori kursus:", error);
    return { category: null, lessons: [], mockExams: [] };
  }
}

/**
 * Server Action: getExamsList
 * 
 * Mengambil daftar ringkas seluruh simulasi ujian (Mock Exams) aktif dari Sanity CMS.
 * 
 * @returns {Promise<Array>} Daftar simulasi ujian terformat
 */
export async function getExamsList() {
  try {
    const query = `*[_type == "mockExam" && is_published == true] | order(_createdAt desc) {
      _id,
      "slug": slug.current,
      title,
      description,
      time_limit,
      passing_score,
      category_id,
      levelCode
    }`;

    const data = await sanityClient.fetch(query, {}, sanityPublicFetchOptions);
    const sanityExams: MockExamListItem[] = (data || []).map((e: SanityMockExamListItem) => ({
      id: e._id,
      slug: e.slug,
      title: e.title,
      description: e.description,
      levelCode: e.levelCode || e.category_id || "general",
      timeLimit: e.time_limit ?? 60,
      passingScore: e.passing_score ?? 90,
      source: "sanity"
    }));
    const supabaseExams = await getSupabaseExamTemplatesList();
    const legacyKeys = new Set(
      sanityExams.map((exam) => exam.slug || exam.id).filter(Boolean)
    );

    return [
      ...sanityExams,
      ...supabaseExams.filter((exam) => !legacyKeys.has(exam.slug || exam.id)),
    ];
  } catch (error) {
    console.error("Gagal mengambil daftar simulasi ujian dari Sanity:", error);
    return [];
  }
}

/**
 * Server Action: getExamByIdOrSlug
 * 
 * Mengambil detail konten lengkap untuk satu simulasi ujian JLPT/JFT dari Sanity CMS.
 * Mengimplementasikan GROQ Asset Coalesce Expansion untuk mengambil file audio/gambar asli Sanity,
 * serta Resolusi Dinamis UUID Kategori dari Supabase PostgreSQL untuk mencegah 404 client routing.
 * 
 * @param {string} idOrSlug - ID dokumen Sanity atau slug unik simulasi ujian
 * @returns {Promise<Object | null>} Detail simulasi ujian terformat lengkap, atau null jika tidak ditemukan
 */
export async function getExamByIdOrSlug(idOrSlug: string): Promise<ExamData | null> {
  const supabase = createStaticClient();
  try {
    const query = `*[_type == "mockExam" && (slug.current == $idOrSlug || _id == $idOrSlug)][0] {
      _id, 
      title, 
      time_limit, 
      passing_score, 
      "slug": slug.current,
      category_id,
      levelCode,
      "choukaiAudioUrl": coalesce(choukaiAudio.asset->url, choukaiAudio),
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

    const exam = await sanityClient.fetch(query, { idOrSlug }, { cache: "no-store" });

    if (!exam) return getSupabaseExamTemplateBySlug(idOrSlug);

    // Selesaikan categorySlug jika berupa UUID dari Supabase, atau gunakan langsung jika berupa slug
    let categorySlug = exam.category_id || "general";
    if (categorySlug && categorySlug.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      const { data, error } = await supabase
        .from("course_categories")
        .select("slug")
        .eq("id", categorySlug)
        .single();
      if (data?.slug && !error) {
        categorySlug = data.slug;
      }
    }

    return {
      id: exam._id,
      title: exam.title,
      timeLimit: exam.time_limit ?? 60,
      passingScore: exam.passing_score ?? 90,
      source: "sanity",
      slug: exam.slug || null,
      categorySlug,
      levelCode: exam.levelCode || "general",
      choukaiAudioUrl: exam.choukaiAudioUrl || null,
      questions: (exam.questions || []).map((q: { _key: string; section: string; questionText: string; imageUrl?: string; audioUrl?: string; options?: string[]; correctAnswer?: number | string }) => ({
        _key: q._key,
        section: normalizeExamSection(q.section),
        questionText: q.questionText,
        imageUrl: q.imageUrl || null,
        audioUrl: q.audioUrl || null,
        options: q.options || [],
        correctAnswer: Number(q.correctAnswer) || 0
      }))
    };
  } catch (error) {
    console.error("Gagal mengambil detail simulasi ujian dari Sanity:", error);
    return null;
  }
}

/**
 * Mengambil detail satu simulasi ujian berdasarkan slug.
 */
export async function getLibraryExamDetail(slug: string): Promise<LibraryItem | null> {
  try {
    return (await getSanityExamBySlug(slug)) as LibraryItem | null;
  } catch (error) {
    console.error("Gagal mengambil detail ujian:", error);
    return null;
  }
}
