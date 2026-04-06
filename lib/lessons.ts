import { supabase } from "./supabase";

export async function getLessonsByLevel(level: string) {
  const { data } = await supabase
    .from("lessons")
    .select("*")
    .eq("level_code", level)
    .eq("is_published", true)
    .order("order_number");

  return data;
}

export async function getLesson(level: string, slug: string) {
  const { data } = await supabase
    .from("lessons")
    .select("*")
    .eq("level_code", level)
    .eq("slug", slug)
    .single();

  return data;
}
