import { MetadataRoute } from "next";
import { client } from "@/sanity/lib/client";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://nihongopath-nine.vercel.app";
  const urls: MetadataRoute.Sitemap = [];

  urls.push(
    { url: `${baseUrl}/`, lastModified: new Date() },
    { url: `${baseUrl}/jlpt`, lastModified: new Date() },
  );

  const levelsQuery = `*[_type == "level"] { code }`;
  const levels = await client.fetch(levelsQuery);

  if (levels) {
    for (const level of levels) {
      urls.push({
        url: `${baseUrl}/jlpt/${level.code}`,
        lastModified: new Date(),
      });
    }
  }

  const lessonsQuery = `*[_type == "lesson" && is_published == true] {
    "slug": slug.current,
    "level_code": level->code,
    _updatedAt
  }`;
  const lessons = await client.fetch(lessonsQuery);

  if (lessons) {
    for (const lesson of lessons) {
      urls.push({
        url: `${baseUrl}/jlpt/${lesson.level_code}/${lesson.slug}`,
        lastModified: new Date(lesson._updatedAt),
      });
    }
  }

  return urls;
}
