/**
 * @file sitemap.ts
 * @description Dynamic SEO sitemap generator. Maps static public routes and dynamic content fetched from Supabase.
 * @module Sitemap
 */

import { MetadataRoute } from "next";
import { createStaticClient } from "@/lib/supabase/server";
import { absoluteUrl, encodeRouteSegment, getSiteUrl } from "@/lib/seo";

import { ROUTES } from "@/lib/core/routes";
/**
 * Dynamic content sitemap item structure.
 */
interface ContentSitemapItem {
 slug: string | null;
 _updatedAt?: string | null;
 _createdAt?: string | null;
 category_id?: string | null;
}

/**
 * Supabase sitemap item structure.
 */
interface SupabaseSitemapItem {
 id?: string | null;
 slug?: string | null;
 character?: string | null;
 created_at?: string | null;
 updated_at?: string | null;
}

/**
 * Input parameters for sitemap entry.
 */
type SitemapEntryInput = {
 path: string;
 lastModified?: string | Date | null;
 changeFrequency?: MetadataRoute.Sitemap[number]["changeFrequency"];
 priority?: number;
};

/**
 * Static routes list.
 */
const STATIC_ROUTES: SitemapEntryInput[] = [
 { path: "/", changeFrequency: "weekly", priority: 1 },
 { path: "/courses", changeFrequency: "weekly", priority: 0.9 },
 { path: "/library", changeFrequency: "weekly", priority: 0.9 },
 { path: "/library/vocab", changeFrequency: "weekly", priority: 0.85 },
 { path: "/library/kanji", changeFrequency: "weekly", priority: 0.85 },
 { path: "/library/grammar", changeFrequency: "weekly", priority: 0.85 },
 { path: "/library/reading", changeFrequency: "weekly", priority: 0.8 },
 { path: "/library/listening", changeFrequency: "weekly", priority: 0.8 },
 { path: "/library/cheatsheet", changeFrequency: "monthly", priority: 0.75 },
 { path: "/exams", changeFrequency: "weekly", priority: 0.75 },
 { path:ROUTES.TOOLS.ROOT, changeFrequency: "monthly", priority: 0.7 },
 { path:ROUTES.TOOLS.DICTIONARY, changeFrequency: "monthly", priority: 0.7 },
 { path:ROUTES.TOOLS.TEXT_ANALYZER, changeFrequency: "monthly", priority: 0.65 },
 { path:ROUTES.TOOLS.KANA, changeFrequency: "monthly", priority: 0.65 },
 { path:ROUTES.TOOLS.WRITING, changeFrequency: "monthly", priority: 0.65 },
 { path:ROUTES.TOOLS.CONJUGATION, changeFrequency: "monthly", priority: 0.65 },
 { path:ROUTES.TOOLS.PARTICLES, changeFrequency: "monthly", priority: 0.65 },
 { path:ROUTES.TOOLS.KANJI_SIMILARITY, changeFrequency: "monthly", priority: 0.65 },
 { path:ROUTES.TOOLS.JLPT_DRILL, changeFrequency: "monthly", priority: 0.65 },
 { path:ROUTES.TOOLS.COUNTER_TRAINER, changeFrequency: "monthly", priority: 0.6 },
 { path:ROUTES.TOOLS.SENTENCE_BUILDER, changeFrequency: "monthly", priority: 0.6 },
 { path:ROUTES.TOOLS.SHADOWING, changeFrequency: "monthly", priority: 0.6 },
 { path:ROUTES.TOOLS.DICTATION, changeFrequency: "monthly", priority: 0.65 },
 { path:ROUTES.TOOLS.FLASHCARDS, changeFrequency: "monthly", priority: 0.65 },
 { path:ROUTES.TOOLS.SURVIVAL, changeFrequency: "monthly", priority: 0.65 },
 { path:ROUTES.TOOLS.WEAK_POINTS, changeFrequency: "monthly", priority: 0.65 },
 { path: "/support", changeFrequency: "monthly", priority: 0.55 },
 { path: "/about", changeFrequency: "monthly", priority: 0.5 },
 { path: "/contact", changeFrequency: "monthly", priority: 0.5 },
 { path: "/privacy", changeFrequency: "yearly", priority: 0.35 },
 { path: "/terms", changeFrequency: "yearly", priority: 0.35 },
];

/**
 * Convert value to Date object. Fallback to current date if invalid.
 */
function toDate(value?: string | Date | null) {
 if (!value) return new Date();
 const date = value instanceof Date ? value : new Date(value);
 // Check if date valid. Return current date if invalid.
 return Number.isNaN(date.getTime()) ? new Date() : date;
}

/**
 * Create formatted sitemap entry.
 */
function createEntry({
 path,
 lastModified,
 changeFrequency,
 priority,
}: SitemapEntryInput): MetadataRoute.Sitemap[number] {
 return {
 changeFrequency,
 lastModified: toDate(lastModified),
 priority,
 url: absoluteUrl(path),
 };
}

/**
 * Fetch all rows from Supabase table using pagination.
 */
async function fetchAllSupabaseRows<T extends SupabaseSitemapItem>(
  table: string,
  select: string,
  orderColumn?: string,
) {
  const supabase = createStaticClient();
  const rows: T[] = [];
  const pageSize = 1000;

  // Loop pages until all rows fetched.
  for (let from = 0; ; from += pageSize) {
    let query = supabase.from(table).select(select);
    if (orderColumn) {
      query = query.order(orderColumn, { ascending: false });
    }

    const { data, error } = await query.range(from, from + pageSize - 1);

    if (error) {
      console.error(`[Sitemap] Gagal mengambil data ${table}:`, error);
      break;
    }

    const page = (data || []) as unknown as T[];
    rows.push(...page);

    if (page.length < pageSize) break;
  }

  return rows;
}

/**
 * Add entry to sitemap list if URL not already added.
 */
function addUniqueEntry(
 urls: MetadataRoute.Sitemap,
 seen: Set<string>,
 entry: SitemapEntryInput,
) {
 const fullUrl = `${getSiteUrl()}${entry.path.startsWith("/") ? entry.path : `/${entry.path}`}`;
 // Prevent duplicate URLs in sitemap.
 if (seen.has(fullUrl)) return;
 seen.add(fullUrl);
 urls.push(createEntry(entry));
}

export const revalidate = 604800;

/**
 * Generate dynamic sitemap. Fetch data from Supabase.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const urls: MetadataRoute.Sitemap = [];
  const seen = new Set<string>();
  const supabase = createStaticClient();

  // Add static routes first.
  for (const route of STATIC_ROUTES) {
    addUniqueEntry(urls, seen, route);
  }

  // Fetch all dynamic content concurrently.
  const [
    categoriesResult,
    lessonsResult,
    articlesResult,
    readingsResult,
    listeningsResult,
    grammarRows,
    cheatsheetRows,
    kanjiRows,
    vocabRows
  ] = await Promise.all([
    supabase.from("course_categories").select("id, slug, created_at"),
    supabase
      .from("lessons")
      .select("slug, category_id, created_at")
      .eq("is_published", true)
      .then(({ data, error }) => {
        if (error) {
          console.error("[Sitemap] Gagal mengambil data pelajaran dari Supabase:", error);
          return [];
        }
        return (data || []).map((row) => ({
          slug: row.slug,
          category_id: row.category_id,
          _createdAt: row.created_at,
          _updatedAt: row.created_at,
        })) as ContentSitemapItem[];
      }),
    supabase
      .from("articles")
      .select("slug, category_id, created_at")
      .eq("is_published", true)
      .then(({ data, error }) => {
        if (error) {
          console.error("[Sitemap] Gagal mengambil data artikel dari Supabase:", error);
          return [];
        }
        return (data || []).map((row) => ({
          slug: row.slug,
          category_id: row.category_id,
          _createdAt: row.created_at,
          _updatedAt: row.created_at,
        })) as ContentSitemapItem[];
      }),
    fetchAllSupabaseRows("reading", "slug, created_at", "created_at"),
    fetchAllSupabaseRows("listening", "slug, created_at", "created_at"),
    fetchAllSupabaseRows("grammar", "slug, created_at", "created_at"),
    fetchAllSupabaseRows("cheatsheets", "slug, created_at, updated_at", "updated_at"),
    supabase
      .from("kanji")
      .select("slug, created_at")
      .not("jlpt_level", "is", null)
      .not("slug", "is", null)
      .then(({ data, error }) => {
        if (error) {
          console.error("[Sitemap] Gagal mengambil data kanji dari Supabase:", error);
          return [];
        }
        return (data || []) as unknown as SupabaseSitemapItem[];
      }),
    supabase
      .from("vocab")
      .select("slug, created_at")
      .in("jlpt_level", ["N5", "N4"])
      .not("slug", "is", null)
      .then(({ data, error }) => {
        if (error) {
          console.error("[Sitemap] Gagal mengambil data vocab dari Supabase:", error);
          return [];
        }
        return (data || []) as unknown as SupabaseSitemapItem[];
      }),
  ]);

 const categories = categoriesResult.data || [];
 const categoryMap = new Map<string, string>();

 // Map categories to map for fast lookup.
 for (const category of categories) {
 if (!category.slug) continue;
 categoryMap.set(category.id, category.slug);
 addUniqueEntry(urls, seen, {
 changeFrequency: "weekly",
 lastModified: category.created_at,
 path: `/courses/${encodeRouteSegment(category.slug)}`,
 priority: 0.82,
 });
 }

 // Combine lessons and articles for processing.
 const allLessons = [
 ...(lessonsResult || []),
 ...(articlesResult || [])
 ];

 // Add lesson and article entries.
 for (const lesson of allLessons) {
 if (!lesson.slug || !lesson.category_id) continue;
 const categorySlug = categoryMap.get(lesson.category_id) || lesson.category_id;
 addUniqueEntry(urls, seen, {
 changeFrequency: "monthly",
 lastModified: lesson._updatedAt || lesson._createdAt,
 path: `/courses/${encodeRouteSegment(categorySlug)}/${encodeRouteSegment(lesson.slug)}`,
 priority: 0.78,
 });
 }

 // Add reading entries.
 for (const reading of readingsResult || []) {
 if (!reading.slug) continue;
 addUniqueEntry(urls, seen, {
 changeFrequency: "monthly",
 lastModified: reading.updated_at || reading.created_at,
 path: `/library/reading/${encodeRouteSegment(reading.slug)}`,
 priority: 0.72,
 });
 }

 // Add listening entries.
 for (const listening of listeningsResult || []) {
 if (!listening.slug) continue;
 addUniqueEntry(urls, seen, {
 changeFrequency: "monthly",
 lastModified: listening.updated_at || listening.created_at,
 path: `/library/listening/${encodeRouteSegment(listening.slug)}`,
 priority: 0.72,
 });
 }

 // Add grammar entries.
 for (const item of grammarRows) {
 if (!item.slug) continue;
 addUniqueEntry(urls, seen, {
 changeFrequency: "monthly",
 lastModified: item.created_at,
 path: `/library/grammar/${encodeRouteSegment(item.slug)}`,
 priority: 0.66,
 });
 }

 // Add cheatsheet entries.
 for (const item of cheatsheetRows) {
 if (!item.slug) continue;
 addUniqueEntry(urls, seen, {
 changeFrequency: "monthly",
 lastModified: item.updated_at || item.created_at,
 path: `/library/cheatsheet/${encodeRouteSegment(item.slug)}`,
 priority: 0.58,
 });
 }

 // Add kanji entries.
 for (const item of kanjiRows) {
 if (!item.slug) continue;
 addUniqueEntry(urls, seen, {
 changeFrequency: "weekly",
 lastModified: item.updated_at || item.created_at,
 path: `/library/kanji/${encodeRouteSegment(item.slug)}`,
 priority: 0.85,
 });
 }

 // Add vocab entries.
 for (const item of vocabRows) {
 if (!item.slug) continue;
 addUniqueEntry(urls, seen, {
 changeFrequency: "weekly",
 lastModified: item.updated_at || item.created_at,
 path: `/library/vocab/${encodeRouteSegment(item.slug)}`,
 priority: 0.85,
 });
 }

 return urls;
}