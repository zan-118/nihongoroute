"use server";

import { createClient } from "@/lib/supabase/server";
import { sanityClient } from "@/lib/sanity.client";
import { getSanityLessonsByCategory } from "@/lib/queries";

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
    const mockExamsQuery = `*[_type == "mockExam" && category_id == $categoryId && is_published == true] | order(_createdAt desc) {
      _id,
      title,
      time_limit,
      passing_score,
      "slug": slug.current
    }`;
    const mockExams = await sanityClient.fetch(mockExamsQuery, { categoryId: category.id });

    return {
      category: {
        _id: category.id,
        title: category.title,
        type: category.type,
        description: category.description,
        slug: category.slug
      },
      lessons: (sanityLessons || []).map((l: any) => ({
        _id: l._id,
        title: l.title,
        summary: l.summary || "",
        slug: l.slug
      })),
      mockExams: (mockExams || []).map((e: any) => ({
        id: e._id,
        title: e.title,
        timeLimit: e.time_limit ?? 30,
        passingScore: e.passing_score ?? 70,
        slug: e.slug || ""
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
      category_id
    }`;

    const data = await sanityClient.fetch(query);

    // Karena kategori kursus ada di Supabase, kita bisa fetch daftar kategori untuk join,
    // atau jika levelCode bisa di-infer dari slug kategori, kita fetch Supabase kategori.
    // Tapi untuk sementara, kita kembalikan category_id sebagai levelCode.
    return (data || []).map((e: any) => ({
      id: e._id,
      slug: e.slug,
      title: e.title,
      description: e.description,
      levelCode: e.category_id || "general",
      timeLimit: e.time_limit,
      passingScore: e.passing_score
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
      questions
    }`;

    const exam = await sanityClient.fetch(query, { idOrSlug });

    if (!exam) return null;

    return {
      id: exam._id,
      title: exam.title,
      timeLimit: exam.time_limit,
      passingScore: exam.passing_score,
      categorySlug: exam.category_id, // Kita map sementara ke categorySlug, idealnya kita query DB ke course_categories
      questions: (exam.questions || []).map((q: any) => ({
        _key: q._key,
        section: q.section,
        questionText: q.questionText,
        imageUrl: q.imageUrl,
        audioUrl: q.audioUrl,
        options: q.options || [],
        correctAnswer: Number(q.correctAnswer) || 0
      }))
    };
  } catch (error) {
    console.error("Failed to fetch exam detail from Sanity:", error);
    return null;
  }
}
