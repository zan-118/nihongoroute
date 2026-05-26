"use server";

import { createClient } from "@/lib/supabase/server";
import { getSanityLessonsByCategory, getSanityLessonsByCategories } from "@/lib/queries";

export async function getLessonDetail(slug: string) {
  const supabase = await createClient();
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

export async function getCourseCategories() {
  const supabase = await createClient();
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
      (l: any) => l.category_id === cat.id || l.category_id === cat.slug
    );

    return {
      ...cat,
      _id: cat.id,
      lessonCount: lessons.length,
      previews: lessons.slice(0, 4).map((l: any) => ({
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
