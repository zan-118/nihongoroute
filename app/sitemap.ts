import { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://nihongopath-nine.vercel.app";

  const urls: MetadataRoute.Sitemap = [];

  /* ============================= */
  /* STATIC ROUTES */
  /* ============================= */

  urls.push(
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/jlpt`,
      lastModified: new Date(),
    },
  );

  /* ============================= */
  /* LEVEL PAGES */
  /* ============================= */

  const { data: levels } = await supabase.from("levels").select("code");

  if (levels) {
    for (const level of levels) {
      urls.push({
        url: `${baseUrl}/jlpt/${level.code}`,
        lastModified: new Date(),
      });
    }
  }

  /* ============================= */
  /* LESSON PAGES */
  /* ============================= */

  const { data: lessons } = await supabase
    .from("lessons")
    .select("slug, level_code, updated_at")
    .eq("is_published", true);

  if (lessons) {
    for (const lesson of lessons) {
      urls.push({
        url: `${baseUrl}/jlpt/${lesson.level_code}/${lesson.slug}`,
        lastModified: lesson.updated_at
          ? new Date(lesson.updated_at)
          : new Date(),
      });
    }
  }

  return urls;
}
