/**
 * @file page.tsx
 * @description Halaman indeks daftar materi membaca (Reading List) NihongoRoute.
 * Mengambil data awal dari Sanity CMS dan mendelegasikan rendering ke ReadingListClient.
 */

// ======================
// IMPOR
// ======================
import { getPaginatedReading } from "@/actions/library.actions";
import ReadingListClient from "./ReadingListClient";
import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  breadcrumbJsonLd,
  createPageMetadata,
  learningResourceJsonLd,
} from "@/lib/seo";

// ======================
// METADATA SEO
// ======================

/**
 * SEO metadata configuration.
 */
export const metadata: Metadata = {
  ...createPageMetadata({
    title: "Graded Reading Bahasa Jepang | NihongoRoute",
    description:
      "Tingkatkan kemampuan membaca bahasa Jepang dengan teks interaktif, furigana, daftar kosakata, dan latihan pemahaman sesuai level JLPT.",
    path: "/library/reading",
    keywords: ["graded reading Jepang", "dokkai JLPT", "latihan membaca bahasa Jepang"],
  }),
};

// ======================
// EKSEKUSI UTAMA
// ======================

/**
 * Reading list page component.
 * Fetches initial reading data. Renders client list.
 * 
 * @returns Reading list page layout.
 */
export default async function ReadingListPage() {
  // Fetch first page of reading materials. Limit 9 items.
  const initialData = await getPaginatedReading(1, 9, "");

  return (
    <div className="w-full min-h-screen bg-transparent relative overflow-hidden pt-12 pb-24 px-4 md:px-8">
      {/* Inject JSON-LD structured data for SEO */}
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Beranda", path: "/" },
            { name: "Pustaka", path: "/library" },
            { name: "Graded Reading", path: "/library/reading" },
          ]),
          learningResourceJsonLd({
            name: "Graded Reading Bahasa Jepang",
            description: metadata.description as string,
            path: "/library/reading",
            educationalLevel: "JLPT N5-N1",
            teaches: "Membaca bahasa Jepang",
          }),
        ]}
      />
      {/* Background visual effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[500px] bg-primary/10 blur-[120px] rounded-[100%] pointer-events-none opacity-50" />
      <div className="neural-grid" />

      <div className="max-w-6xl mx-auto relative z-10">
        <ReadingListClient initialData={initialData} />
      </div>
    </div>
  );
}