/**
 * @file sitemap.ts
 * @description Generator sitemap dinamis untuk SEO.
 * Memetakan semua rute statis dan dinamis (dari Sanity CMS) agar mudah diindeks.
 * @module Sitemap
 */

// ======================
// IMPORTS
// ======================
import { MetadataRoute } from "next";
import { client } from "@/sanity/lib/client";

// ======================
// MAIN EXECUTION
// ======================

/**
 * Membuat data sitemap untuk aplikasi.
 * Mengambil data level dan lesson dari CMS untuk menghasilkan URL dinamis.
 * 
 * @returns {Promise<MetadataRoute.Sitemap>} Daftar URL untuk sitemap.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.nihongoroute.my.id/";
  const urls: MetadataRoute.Sitemap = [];

  // Rute Statis
  urls.push(
    { url: `${baseUrl}/`, lastModified: new Date() },
    { url: `${baseUrl}/courses`, lastModified: new Date() },
  );

  // Ambil Data Level dari Sanity
  const levelsQuery = `*[_type == "level"] { code }`;
  const levels = await client.fetch(levelsQuery);

  if (levels) {
    for (const level of levels) {
      urls.push({
        url: `${baseUrl}/courses/${level.code}`,
        lastModified: new Date(),
      });
    }
  }

  // Ambil Data Lesson dari Sanity
  const lessonsQuery = `*[_type == "lesson" && is_published == true] {
    "slug": slug.current,
    "level_code": level->code,
    _updatedAt
  }`;
  const lessons = await client.fetch(lessonsQuery);

  if (lessons) {
    for (const lesson of lessons) {
      urls.push({
        url: `${baseUrl}/courses/${lesson.level_code}/${lesson.slug}`,
        lastModified: new Date(lesson._updatedAt),
      });
    }
  }

  return urls;
}

