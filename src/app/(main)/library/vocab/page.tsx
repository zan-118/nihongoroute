/**
 * @file page.tsx
 * @description Halaman indeks Kamus Kosakata. 
 * Menangani metadata SEO dan pembungkusan komponen VocabClient.
 * @module VocabLibraryPage
 */

// ======================
// IMPOR
// ======================
import { Suspense } from "react";
import { RotateCw } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import VocabClient from "./VocabClient";
import { getPaginatedVocab } from "@/actions/library.actions";
import {
  breadcrumbJsonLd,
  createPageMetadata,
  learningResourceJsonLd,
} from "@/lib/seo";

// ======================
// METADATA SEO
// ======================
/**
 * SEO metadata configuration for the vocabulary library page.
 */
export const metadata = {
  ...createPageMetadata({
    title: "Kamus Kosakata Bahasa Jepang | NihongoRoute",
    description:
      "Ribuan kosakata bahasa Jepang JLPT N5-N1 dilengkapi furigana, romaji, arti Indonesia, audio, contoh kalimat, dan latihan SRS.",
    path: "/library/vocab",
    keywords: ["kosakata bahasa Jepang", "vocab JLPT", "kamus Jepang Indonesia", "furigana"],
  }),
};

// ======================
// EKSEKUSI UTAMA
// ======================

/**
 * Halaman utama Kamus Kosakata (RSC).
 * Melakukan pra-ambil data halaman pertama daftar kosakata sebelum merender VocabClient dalam Suspense.
 * 
 * @returns {Promise<JSX.Element>} Halaman direktori pustaka kosakata.
 */
export default async function VocabLibraryPage() {
  // Fetch initial page of N5 vocabulary items on server to reduce initial client load time
  const initialData = await getPaginatedVocab(1, 50, "", "N5", "all");

  return (
    <main className="w-full bg-transparent px-6 md:px-12 relative overflow-hidden flex flex-col justify-start min-h-screen pt-24 pb-20 transition-colors duration-300">
      {/* Inject structured JSON-LD data for search engine optimization */}
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Beranda", path: "/" },
            { name: "Pustaka", path: "/library" },
            { name: "Kosakata", path: "/library/vocab" },
          ]),
          learningResourceJsonLd({
            name: "Kamus Kosakata Bahasa Jepang",
            description: metadata.description as string,
            path: "/library/vocab",
            educationalLevel: "JLPT N5-N1",
            teaches: "Kosakata bahasa Jepang",
          }),
        ]}
      />
      {/* Background Neural Overlays */}
      <div className="neural-grid" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgb(var(--destructive-rgb)/0.05)_0%,transparent_70%)] pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto w-full relative z-10 flex flex-col pt-10">
        {/* Stream client component with initial server-fetched data */}
        <Suspense fallback={
          <div className="h-40 flex flex-col items-center justify-center text-muted-foreground gap-2">
            <RotateCw className="text-primary animate-spin" size={24} />
            <p className="text-xs font-bold uppercase tracking-widest font-mono animate-pulse">Memuat kamus kosakata…</p>
          </div>
        }>
          <VocabClient initialData={initialData} />
        </Suspense>
      </div>
    </main>
  );
}