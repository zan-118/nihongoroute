/**
 * @file sitemap.ts
 * @description Generator sitemap dinamis untuk SEO.
 * Memetakan semua rute statis dan dinamis (dari Sanity CMS & Supabase) agar mudah diindeks.
 * @module Sitemap
 */

// ======================
// IMPOR
// ======================
import { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { sanityClient } from "@/lib/sanity.client";

// ======================
// TIPE DATA
// ======================
interface SanitySitemapItem {
  slug: string;
  _updatedAt: string;
  category_id?: string;
}

// ======================
// EKSEKUSI UTAMA
// ======================

/**
 * Membuat data sitemap dinamis untuk aplikasi.
 * Mengambil data level dari Supabase dan lessons/materials dari Sanity CMS.
 * 
 * @returns {Promise<MetadataRoute.Sitemap>} Daftar URL terdaftar untuk sitemap SEO.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.nihongoroute.my.id";
  const urls: MetadataRoute.Sitemap = [];
  const supabase = await createClient();

  // 1. Rute Statis Utama
  urls.push(
    { url: `${baseUrl}/`, lastModified: new Date() },
    { url: `${baseUrl}/courses`, lastModified: new Date() },
  );

  // 2. Ambil Data Kategori dari Supabase (dan simpan untuk pemetaan UUID -> Slug)
  const { data: categories } = await supabase
    .from("course_categories")
    .select("id, slug");

  const categoryMap = new Map<string, string>();

  if (categories) {
    for (const category of categories) {
      categoryMap.set(category.id, category.slug);
      urls.push({
        url: `${baseUrl}/courses/${category.slug}`,
        lastModified: new Date(),
      });
    }
  }

  // 3. Ambil Data Pelajaran (Lessons) dari Sanity CMS
  try {
    const lessons = await sanityClient.fetch<SanitySitemapItem[]>(`
      *[_type == "lesson" && is_published == true] {
        "slug": slug.current,
        _updatedAt,
        category_id
      }
    `);

    if (lessons) {
      for (const lesson of lessons) {
        if (lesson.category_id) {
          // category_id bisa berupa UUID Supabase atau langsung slug kaku
          const categorySlug = categoryMap.get(lesson.category_id) || lesson.category_id;
          urls.push({
            url: `${baseUrl}/courses/${categorySlug}/${lesson.slug}`,
            lastModified: new Date(lesson._updatedAt),
          });
        }
      }
    }
  } catch (err) {
    console.error("[Sitemap] Gagal mengambil data pelajaran dari Sanity:", err);
  }

  // 4. Ambil Data Materi Membaca (Reading) dari Sanity CMS
  try {
    const readings = await sanityClient.fetch<SanitySitemapItem[]>(`
      *[_type == "readingMaterial"] {
        "slug": slug.current,
        _updatedAt
      }
    `);

    if (readings) {
      for (const r of readings) {
        urls.push({
          url: `${baseUrl}/library/reading/${r.slug}`,
          lastModified: new Date(r._updatedAt),
        });
      }
    }
  } catch (err) {
    console.error("[Sitemap] Gagal mengambil data bacaan dari Sanity:", err);
  }

  // 5. Ambil Data Materi Menyimak (Listening) dari Sanity CMS
  try {
    const listenings = await sanityClient.fetch<SanitySitemapItem[]>(`
      *[_type == "listeningMaterial"] {
        "slug": slug.current,
        _updatedAt
      }
    `);

    if (listenings) {
      for (const l of listenings) {
        urls.push({
          url: `${baseUrl}/library/listening/${l.slug}`,
          lastModified: new Date(l._updatedAt),
        });
      }
    }
  } catch (err) {
    console.error("[Sitemap] Gagal mengambil data menyimak dari Sanity:", err);
  }

  return urls;
}
