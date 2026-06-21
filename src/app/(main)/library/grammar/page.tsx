/**
 * @file app/(main)/library/grammar/page.tsx
 * @description Halaman indeks katalog panduan tata bahasa (Bunpou). Menggunakan teknik "Client-Side Fetching" untuk memfilter dan memuat daftar bab dari CMS secara asinkron berdasarkan level yang dipilih.
 * @module Client Component
 */

// ======================
// IMPOR
// ======================
import { Suspense } from "react";
import { RotateCw } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import GrammarClient from "./GrammarClient";
import { getGrammarArticles } from "@/actions/library.actions";
import {
  breadcrumbJsonLd,
  createPageMetadata,
  learningResourceJsonLd,
} from "@/lib/seo";

// ======================
// METADATA SEO
// ======================
export const metadata = {
  ...createPageMetadata({
    title: "Tata Bahasa Jepang JLPT | NihongoRoute",
    description:
      "Katalog tata bahasa Jepang JLPT N5 hingga N1 dengan rumus, arti, catatan penggunaan, contoh kalimat, dan latihan terkait.",
    path: "/library/grammar",
    keywords: ["grammar Jepang", "tata bahasa Jepang", "bunpou JLPT", "pola kalimat Jepang"],
  }),
};

// ======================
// EKSEKUSI UTAMA
// ======================

/**
 * Halaman utama Katalog Panduan Tata Bahasa (Bunpou) (RSC).
 * Melakukan pra-ambil data tata bahasa level N5 di sisi server sebelum dirender oleh GrammarClient.
 * 
 * @returns {JSX.Element} Halaman daftar tata bahasa Jepang.
 */
export default async function GrammarArticlesPage() {
  // Pre-fetch artikel di sisi server
  const grammarData = await getGrammarArticles("n5");


  return (
    <main className="w-full relative overflow-hidden flex flex-1 flex-col pb-24 px-4 md:px-8 lg:px-12 bg-transparent text-foreground transition-colors duration-300">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Beranda", path: "/" },
            { name: "Pustaka", path: "/library" },
            { name: "Tata Bahasa", path: "/library/grammar" },
          ]),
          learningResourceJsonLd({
            name: "Tata Bahasa Jepang JLPT",
            description: metadata.description as string,
            path: "/library/grammar",
            educationalLevel: "JLPT N5-N1",
            teaches: "Tata bahasa Jepang",
          }),
        ]}
      />
      {/* Background Neural Overlays */}
      <div className="neural-grid" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgb(var(--primary-rgb)/0.05)_0%,transparent_70%)] pointer-events-none z-0" />

      <Suspense fallback={
        <div className="h-40 flex flex-col items-center justify-center text-muted-foreground gap-2">
          <RotateCw className="text-primary animate-spin" size={24} />
          <p className="text-xs font-bold uppercase tracking-widest font-mono animate-pulse">Memuat tata bahasa…</p>
        </div>
      }>
        <GrammarClient initialArticles={grammarData} />
      </Suspense>
    </main>
  );
}
