/**
 * @file page.tsx
 * @description Halaman sesi menyimak (Listening Session) dinamis untuk meresolusi materi audio berdasarkan slug.
 */

// ======================
// IMPOR
// ======================
import { cache } from "react";
import { getLibraryItemBySlug } from "@/actions/library.actions";
import { getListeningStaticSlugs } from "@/actions/listening.actions";
import ListeningPageClient from "@/features/library/listening/ListeningPageClient";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  breadcrumbJsonLd,
  createPageMetadata,
  encodeRouteSegment,
  learningResourceJsonLd,
} from "@/lib/seo";

export const dynamicParams = true;
export const revalidate = 3600;

/** Generate static params for listening detail pages (ISR). */
export async function generateStaticParams() {
  return await getListeningStaticSlugs(50);
}

/** Fetch listening item by slug. Cache result. */
const getListeningBySlug = cache((slug: string) => getLibraryItemBySlug("listening", slug));

/** Extract SEO title and description from CMS data object safely. */
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
 * Generate dynamic SEO metadata for listening page.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  // Decode slug to handle special characters in URL.
  const decodedSlug = decodeURIComponent(slug);
  const data = await getListeningBySlug(decodedSlug);
  const seo = getCmsSeo(data);
  return createPageMetadata({
    title: data
      ? seo.title || `${data.title} | Laboratorium Listening NihongoRoute`
      : "Latihan Listening Choukai | NihongoRoute",
    description: data
      ? seo.description || `Latih choukai atau pendengaran bahasa Jepang dengan materi percakapan dan kuis interaktif untuk ${data.title}.`
      : "Laboratorium choukai interaktif dengan audio percakapan, transkrip, dan kuis pemahaman.",
    path: `/library/listening/${encodeRouteSegment(decodedSlug)}`,
    keywords: [
      String(data?.title || ""),
      String(data?.jlpt_level || ""),
      "choukai JLPT",
      "listening bahasa Jepang",
    ].filter(Boolean),
  });
}

// ======================
// EKSEKUSI UTAMA
// ======================

/**
 * Render listening page. Fetch data. Inject JSON-LD. Load client player.
 */
export default async function ListeningPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  // Decode slug to handle special characters in URL.
  const decodedSlug = decodeURIComponent(slug);

  // Fetch listening task data from CMS.
  const data = await getListeningBySlug(decodedSlug);

  // Trigger 404 if data missing.
  if (!data) {
    notFound();
  }

  // Extract SEO metadata from CMS payload.
  const seo = getCmsSeo(data);
  const listeningPath = `/library/listening/${encodeRouteSegment(String(data.slug || decodedSlug))}`;
  const description =
    seo.description ||
    `Latih choukai atau pendengaran bahasa Jepang dengan materi percakapan dan kuis interaktif untuk ${data.title}.`;

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Beranda", path: "/" },
            { name: "Pustaka", path: "/library" },
            { name: "Listening", path: "/library/listening" },
            { name: String(data.title || "Listening"), path: listeningPath },
          ]),
          learningResourceJsonLd({
            name: String(data.title || "Listening NihongoRoute"),
            description,
            path: listeningPath,
            educationalLevel: String(data.jlpt_level || data.difficulty || ""),
            image: typeof data.image_url === "string" ? data.image_url : null,
            teaches: "Menyimak bahasa Jepang",
          }),
        ]}
      />
      <ListeningPageClient data={data as unknown as import("@/features/library/listening/types").ListeningTaskData} />
    </>
  );
}