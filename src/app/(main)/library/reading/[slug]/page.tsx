/**
 * @file page.tsx
 * @description Halaman detail graded reading (Dokkai) dinamis untuk meresolusi materi membaca berdasarkan slug.
 */

// ======================
// IMPOR
// ======================
import { cache } from "react";
import { getLibraryItemBySlug } from "@/actions/library.actions";
import { getReadingStaticSlugs } from "@/actions/reading.actions";
import ReadingPageClient from "./ReadingPageClient";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  articleJsonLd,
  breadcrumbJsonLd,
  createPageMetadata,
  encodeRouteSegment,
} from "@/lib/seo";

export const dynamicParams = true;
export const revalidate = 3600;

/** Generate static params for reading detail pages (ISR). */
export async function generateStaticParams() {
  return await getReadingStaticSlugs(50);
}

/** Fetch reading item by slug. Cache result to avoid duplicate requests. */
const getReadingBySlug = cache((slug: string) => getLibraryItemBySlug("reading", slug));

/** Extract SEO title and description from CMS data safely. */
function getCmsSeo(data: unknown) {
  const seo = data && typeof data === "object" && "seo" in data
    ? (data as { seo?: { title?: string; description?: string } }).seo
    : undefined;

  return {
    description: seo?.description,
    title: seo?.title,
  };
}

// ======================
// METADATA SEO
// ======================

/**
 * Generate dynamic SEO metadata for reading page.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  // Decode slug. Handle Japanese characters in URL.
  const decodedSlug = decodeURIComponent(slug);
  const data = await getReadingBySlug(decodedSlug);
  const seo = getCmsSeo(data);
  return createPageMetadata({
    title: data
      ? seo.title || `${data.title} | Graded Reading NihongoRoute`
      : "Latihan Membaca Dokkai | NihongoRoute",
    description: data
      ? seo.description || `Tingkatkan kemampuan membaca dokkai bahasa Jepang dengan teks interaktif ber-furigana untuk ${data.title}.`
      : "Koleksi teks membaca bahasa Jepang dengan furigana dinamis, daftar kosakata terjemahan, dan latihan pemahaman.",
    path: `/library/reading/${encodeRouteSegment(decodedSlug)}`,
    type: "article",
    keywords: [
      String(data?.title || ""),
      String(data?.jlpt_level || ""),
      "dokkai JLPT",
      "graded reading bahasa Jepang",
    ].filter(Boolean),
  });
}

// ======================
// EKSEKUSI UTAMA
// ======================

/**
 * Render reading page. Fetch data from CMS. Render client component.
 */
export default async function ReadingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  // Decode slug. Handle Japanese characters in URL.
  const decodedSlug = decodeURIComponent(slug);

  const data = await getReadingBySlug(decodedSlug);

  // Trigger 404 if reading item not found.
  if (!data) {
    notFound();
  }

  // Extract SEO metadata from CMS payload.
  const seo = getCmsSeo(data);
  const readingPath = `/library/reading/${encodeRouteSegment(String(data.slug || decodedSlug))}`;
  const description =
    seo.description ||
    `Tingkatkan kemampuan membaca dokkai bahasa Jepang dengan teks interaktif ber-furigana untuk ${data.title}.`;

  return (
    <>
      {/* Inject SEO structured data */}
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Beranda", path: "/" },
            { name: "Pustaka", path: "/library" },
            { name: "Graded Reading", path: "/library/reading" },
            { name: String(data.title || "Reading"), path: readingPath },
          ]),
          articleJsonLd({
            headline: String(data.title || "Graded Reading NihongoRoute"),
            description,
            path: readingPath,
            datePublished: typeof data._createdAt === "string" ? data._createdAt : null,
            dateModified: typeof data._updatedAt === "string" ? data._updatedAt : null,
            educationalLevel: String(data.jlpt_level || data.difficulty || ""),
            image: typeof data.image_url === "string" ? data.image_url : null,
          }),
        ]}
      />
      <ReadingPageClient data={data as unknown as import("@/components/features/reading/types").ReadingData} />
    </>
  );
}