/**
 * @file sitemap.ts
 * @description Generator sitemap dinamis untuk SEO.
 * Memetakan rute publik statis dan konten dinamis dari Sanity CMS dan Supabase.
 * @module Sitemap
 */

import { MetadataRoute } from "next";
import { createStaticClient } from "@/lib/supabase/server";
import { sanityClient } from "@/lib/sanity.client";
import { absoluteUrl, encodeRouteSegment, getSiteUrl } from "@/lib/seo";

export const revalidate = 3600;

interface SanitySitemapItem {
  slug: string | null;
  _updatedAt?: string | null;
  _createdAt?: string | null;
  category_id?: string | null;
}

interface SupabaseSitemapItem {
  id?: string | null;
  slug?: string | null;
  character?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

type SitemapEntryInput = {
  path: string;
  lastModified?: string | Date | null;
  changeFrequency?: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority?: number;
};

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
  { path: "/tools", changeFrequency: "monthly", priority: 0.7 },
  { path: "/tools/dictionary", changeFrequency: "monthly", priority: 0.7 },
  { path: "/tools/text-analyzer", changeFrequency: "monthly", priority: 0.65 },
  { path: "/tools/kana", changeFrequency: "monthly", priority: 0.65 },
  { path: "/tools/writing", changeFrequency: "monthly", priority: 0.65 },
  { path: "/tools/conjugation", changeFrequency: "monthly", priority: 0.65 },
  { path: "/tools/particles", changeFrequency: "monthly", priority: 0.65 },
  { path: "/tools/kanji-similarity", changeFrequency: "monthly", priority: 0.65 },
  { path: "/tools/jlpt-drill", changeFrequency: "monthly", priority: 0.65 },
  { path: "/tools/counter-trainer", changeFrequency: "monthly", priority: 0.6 },
  { path: "/tools/sentence-builder", changeFrequency: "monthly", priority: 0.6 },
  { path: "/tools/shadowing", changeFrequency: "monthly", priority: 0.6 },
  { path: "/support", changeFrequency: "monthly", priority: 0.55 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.35 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.35 },
];

function toDate(value?: string | Date | null) {
  if (!value) return new Date();
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

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

async function fetchAllSupabaseRows<T extends SupabaseSitemapItem>(
  table: string,
  select: string,
  orderColumn: string,
) {
  const supabase = createStaticClient();
  const rows: T[] = [];
  const pageSize = 1000;

  for (let from = 0; ; from += pageSize) {
    const { data, error } = await supabase
      .from(table)
      .select(select)
      .order(orderColumn, { ascending: false })
      .range(from, from + pageSize - 1);

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

function addUniqueEntry(
  urls: MetadataRoute.Sitemap,
  seen: Set<string>,
  entry: SitemapEntryInput,
) {
  const fullUrl = `${getSiteUrl()}${entry.path.startsWith("/") ? entry.path : `/${entry.path}`}`;
  if (seen.has(fullUrl)) return;
  seen.add(fullUrl);
  urls.push(createEntry(entry));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const urls: MetadataRoute.Sitemap = [];
  const seen = new Set<string>();
  const supabase = createStaticClient();

  for (const route of STATIC_ROUTES) {
    addUniqueEntry(urls, seen, route);
  }

  const { data: categories } = await supabase
    .from("course_categories")
    .select("id, slug, created_at");

  const categoryMap = new Map<string, string>();

  if (categories) {
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
  }

  try {
    const lessons = await sanityClient.fetch<SanitySitemapItem[]>(
      `*[_type == "lesson" && is_published == true && defined(slug.current)] {
        "slug": slug.current,
        _updatedAt,
        _createdAt,
        category_id
      }`,
      {},
    );

    for (const lesson of lessons || []) {
      if (!lesson.slug || !lesson.category_id) continue;
      const categorySlug = categoryMap.get(lesson.category_id) || lesson.category_id;
      addUniqueEntry(urls, seen, {
        changeFrequency: "monthly",
        lastModified: lesson._updatedAt || lesson._createdAt,
        path: `/courses/${encodeRouteSegment(categorySlug)}/${encodeRouteSegment(lesson.slug)}`,
        priority: 0.78,
      });
    }
  } catch (err) {
    console.error("[Sitemap] Gagal mengambil data pelajaran dari Sanity:", err);
  }

  try {
    const [readings, listenings] = await Promise.all([
      sanityClient.fetch<SanitySitemapItem[]>(
        `*[_type == "readingMaterial" && defined(slug.current)] {
          "slug": slug.current,
          _updatedAt,
          _createdAt
        }`,
        {},
      ),
      sanityClient.fetch<SanitySitemapItem[]>(
        `*[_type == "listeningMaterial" && defined(slug.current)] {
          "slug": slug.current,
          _updatedAt,
          _createdAt
        }`,
        {},
      ),
    ]);

    for (const reading of readings || []) {
      if (!reading.slug) continue;
      addUniqueEntry(urls, seen, {
        changeFrequency: "monthly",
        lastModified: reading._updatedAt || reading._createdAt,
        path: `/library/reading/${encodeRouteSegment(reading.slug)}`,
        priority: 0.72,
      });
    }

    for (const listening of listenings || []) {
      if (!listening.slug) continue;
      addUniqueEntry(urls, seen, {
        changeFrequency: "monthly",
        lastModified: listening._updatedAt || listening._createdAt,
        path: `/library/listening/${encodeRouteSegment(listening.slug)}`,
        priority: 0.72,
      });
    }

  } catch (err) {
    console.error("[Sitemap] Gagal mengambil data editorial dari Sanity:", err);
  }

  const [vocabRows, kanjiRows, grammarRows, cheatsheetRows] = await Promise.all([
    fetchAllSupabaseRows("vocab", "slug, created_at", "created_at"),
    fetchAllSupabaseRows("kanji", "slug, created_at", "created_at"),
    fetchAllSupabaseRows("grammar", "slug, created_at", "created_at"),
    fetchAllSupabaseRows("cheatsheets", "slug, created_at, updated_at", "updated_at"),
  ]);

  for (const item of vocabRows) {
    if (!item.slug) continue;
    addUniqueEntry(urls, seen, {
      changeFrequency: "monthly",
      lastModified: item.created_at,
      path: `/library/vocab/${encodeRouteSegment(item.slug)}`,
      priority: 0.62,
    });
  }

  for (const item of kanjiRows) {
    if (!item.slug) continue;
    addUniqueEntry(urls, seen, {
      changeFrequency: "monthly",
      lastModified: item.created_at,
      path: `/library/kanji/${encodeRouteSegment(item.slug)}`,
      priority: 0.62,
    });
  }

  for (const item of grammarRows) {
    if (!item.slug) continue;
    addUniqueEntry(urls, seen, {
      changeFrequency: "monthly",
      lastModified: item.created_at,
      path: `/library/grammar/${encodeRouteSegment(item.slug)}`,
      priority: 0.66,
    });
  }

  for (const item of cheatsheetRows) {
    if (!item.slug) continue;
    addUniqueEntry(urls, seen, {
      changeFrequency: "monthly",
      lastModified: item.updated_at || item.created_at,
      path: `/library/cheatsheet/${encodeRouteSegment(item.slug)}`,
      priority: 0.58,
    });
  }

  return urls;
}
