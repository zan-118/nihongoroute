"use server";

import { createClient } from "@/lib/supabase/server";
import { sanityClient } from "@/lib/sanity.client";
import { getSanityLessonsByCategory } from "@/lib/queries";

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

interface SanityQuestionItem {
  _key: string;
  section: string;
  questionText: string;
  imageUrl?: string;
  audioUrl?: string;
  options: string[];
  correctAnswer: number | string;
}

/**
 * Mengambil data kategori kursus beserta pelajaran dan ujian di dalamnya.
 */
export async function getCourseCategoryData(slug: string) {
  const supabase = await createClient();
  
  try {
    // 1. Ambil Kategori (Tetap dari Supabase karena course_categories ada di Supabase)
    const { data: category, error: catError } = await supabase
      .from("course_categories")
      .select("id, title, type, description, slug")
      .eq("slug", slug)
      .single();

    if (catError && catError.code !== "PGRST116") throw catError;
    if (!category) return { category: null, lessons: [], mockExams: [] };

    // 2. Ambil Pelajaran dari Sanity
    const sanityLessons = await getSanityLessonsByCategory(category.slug, category.id);

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
    });

    return {
      category: {
        _id: category.id,
        title: category.title,
        type: category.type,
        description: category.description,
        slug: category.slug
      },
      lessons: (sanityLessons || []).map((l: SanityLessonListItem) => ({
        _id: l._id,
        title: l.title,
        summary: l.summary || "",
        slug: l.slug
      })),
      mockExams: (mockExams || []).map((e: SanityMockExamListItem) => ({
        id: e._id,
        title: e.title,
        timeLimit: e.time_limit ?? 30,
        passingScore: e.passing_score ?? 70,
        slug: e.slug || "",
        levelCode: e.levelCode || "general"
      }))
    };
  } catch (error) {
    console.error("Failed to fetch course category data:", error);
    return { category: null, lessons: [], mockExams: [] };
  }
}

/**
 * Mengambil daftar seluruh ujian simulasi (Mock Exams) dari Sanity.
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

    const data = await sanityClient.fetch(query);

    return (data || []).map((e: SanityMockExamListItem) => ({
      id: e._id,
      slug: e.slug,
      title: e.title,
      description: e.description,
      levelCode: e.levelCode || e.category_id || "general",
      timeLimit: e.time_limit ?? 60,
      passingScore: e.passing_score ?? 90
    }));
  } catch (error) {
    console.error("Failed to fetch exams list from Sanity:", error);
    return [];
  }
}

/**
 * Mengambil detail lengkap satu ujian simulasi berdasarkan Slug.
 */
export async function getExamByIdOrSlug(idOrSlug: string) {
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

    const exam = await sanityClient.fetch(query, { idOrSlug });

    if (!exam) return null;

    // Resolve categorySlug if it's a UUID from Supabase, or use it directly if it's a slug
    let categorySlug = exam.category_id || "general";
    if (categorySlug && categorySlug.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      const supabase = await createClient();
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
      categorySlug,
      levelCode: exam.levelCode || "general",
      choukaiAudioUrl: exam.choukaiAudioUrl || null,
      questions: (exam.questions || []).map((q: any) => ({
        _key: q._key,
        section: q.section,
        questionText: q.questionText,
        imageUrl: q.imageUrl || null,
        audioUrl: q.audioUrl || null,
        options: q.options || [],
        correctAnswer: Number(q.correctAnswer) || 0
      }))
    };
  } catch (error) {
    console.error("Failed to fetch exam detail from Sanity:", error);
    return null;
  }
}
