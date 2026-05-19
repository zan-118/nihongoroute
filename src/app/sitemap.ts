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
import { createClient } from "@/lib/supabase/server";

interface SitemapLesson {
  slug: string;
  created_at: string;
  course_categories: {
    slug: string;
  } | null;
}

// ======================
// MAIN EXECUTION
// ======================

/**
 * Membuat data sitemap untuk aplikasi.
 * Mengambil data level dan lesson dari Supabase untuk menghasilkan URL dinamis.
 * 
 * @returns {Promise<MetadataRoute.Sitemap>} Daftar URL untuk sitemap.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.nihongoroute.my.id/";
  const urls: MetadataRoute.Sitemap = [];
  const supabase = await createClient();

  // Rute Statis
  urls.push(
    { url: `${baseUrl}/`, lastModified: new Date() },
    { url: `${baseUrl}/courses`, lastModified: new Date() },
  );

  // Ambil Data Kategori dari Supabase
  const { data: categories } = await supabase
    .from("course_categories")
    .select("slug");

  if (categories) {
    for (const category of categories) {
      urls.push({
        url: `${baseUrl}/courses/${category.slug}`,
        lastModified: new Date(),
      });
    }
  }

  // Ambil Data Lesson dari Supabase
  const { data: lessons } = await (supabase
    .from("lessons")
    .select(`
      slug,
      created_at,
      course_categories (
        slug
      )
    `)
    .eq("is_published", true) as any);

  if (lessons) {
    for (const lesson of (lessons as SitemapLesson[])) {
      const categorySlug = lesson.course_categories?.slug;
      if (categorySlug) {
        urls.push({
          url: `${baseUrl}/courses/${categorySlug}/${lesson.slug}`,
          lastModified: new Date(lesson.created_at),
        });
      }
    }
  }

  return urls;
}
