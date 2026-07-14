/**
 * @file page.tsx
 * @description Halaman indeks katalog Kanji. Menangani pengambilan data awal dan pembungkusan KanjiListClient.
 */

// ======================
// IMPOR
// ======================
import { Suspense } from "react";
import { RotateCw } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { getPaginatedKanji } from "@/actions/library.actions";
import KanjiListClient from "@/app/(main)/library/kanji/KanjiListClient";
import type { Metadata } from "next";
import {
  breadcrumbJsonLd,
  createPageMetadata,
  learningResourceJsonLd,
} from "@/lib/seo";

// ======================
// METADATA SEO
// ======================

/**
 * SEO metadata configuration for the Kanji library page.
 */
export const metadata: Metadata = {
  ...createPageMetadata({
    title: "Pustaka Kanji JLPT | NihongoRoute",
    description:
      "Kuasai ribuan kanji JLPT dengan arti, onyomi, kunyomi, mnemonic, kosakata terkait, dan visualisasi stroke order interaktif.",
    path: "/library/kanji",
    keywords: ["kanji JLPT", "belajar kanji", "stroke order kanji", "onyomi kunyomi"],
  }),
};

// ======================
// EKSEKUSI UTAMA
// ======================

/**
 * Kanji library index page component.
 * Fetches initial paginated Kanji data on the server and renders the client list.
 * 
 * @returns React Server Component rendering the Kanji list.
 */
export default async function KanjiListPage() {
  // Fetch initial page of N5 Kanji (24 items) on server to prevent layout shift
  const initialData = await getPaginatedKanji(1, 24, "", "N5");

  return (
    <div className="w-full min-h-screen bg-transparent relative overflow-hidden pt-12 pb-24 px-4 md:px-8">
      {/* Inject structured JSON-LD data for SEO breadcrumbs and learning resources */}
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Beranda", path: "/" },
            { name: "Pustaka", path: "/library" },
            { name: "Kanji", path: "/library/kanji" },
          ]),
          learningResourceJsonLd({
            name: "Pustaka Kanji JLPT",
            description: metadata.description as string,
            path: "/library/kanji",
            educationalLevel: "JLPT N5-N1",
            teaches: "Kanji",
          }),
        ]}
      />
      {/* Efek Latar Belakang */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[500px] bg-primary/10 blur-[120px] rounded-[100%] pointer-events-none opacity-50" />
      <div className="neural-grid" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Stream client component with loading fallback while rendering */}
        <Suspense fallback={
          <div className="h-40 flex flex-col items-center justify-center text-muted-foreground gap-2">
            <RotateCw className="text-primary animate-spin" size={24} />
            <p className="text-xs font-bold uppercase tracking-widest font-mono animate-pulse">Memuat pustaka kanji…</p>
          </div>
        }>
          <KanjiListClient initialData={initialData} />
        </Suspense>
      </div>
    </div>
  );
}