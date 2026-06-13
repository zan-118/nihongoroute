/**
 * @file page.tsx
 * @description Halaman sesi menyimak (Listening Session) dinamis untuk meresolusi materi audio berdasarkan slug.
 */

// ======================
// IMPOR
// ======================
import { cache } from "react";
import { getLibraryItemBySlug } from "@/actions/library.actions";
import ListeningPageClient from "./ListeningPageClient";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  breadcrumbJsonLd,
  createPageMetadata,
  encodeRouteSegment,
  learningResourceJsonLd,
} from "@/lib/seo";

// ======================
// KONFIGURASI STATIC GENERATION (ISR/SSG)
// ======================
export async function generateStaticParams() {
  return []; // Halaman detail di-generate secara statis on-demand (ISR) menggunakan ID ASCII (UUID/Slug)
}

const getListeningBySlug = cache((slug: string) => getLibraryItemBySlug("listening", slug));

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
 * Menghasilkan metadata SEO dinamis untuk halaman latihan menyimak spesifik.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
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
 * Halaman detail latihan menyimak (RSC) untuk mengambil data materi audio dari CMS Sanity, kemudian merender modul player ListeningPageClient.
 */
export default async function ListeningPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  const data = await getListeningBySlug(decodedSlug);


  if (!data) {
    notFound();
  }

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
      <ListeningPageClient data={data as unknown as import("@/components/features/listening/types").ListeningTaskData} />
    </>
  );
}
