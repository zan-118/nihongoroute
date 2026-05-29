/**
 * @file page.tsx
 * @description Halaman indeks katalog Kanji. Menangani pengambilan data awal dan pembungkusan KanjiListClient.
 */

// ======================
// IMPOR
// ======================
import { Suspense } from "react";
import { RotateCw } from "lucide-react";
import { getPaginatedKanji } from "@/actions/library.actions";
import KanjiListClient from "@/app/(main)/library/kanji/KanjiListClient";
import type { Metadata } from "next";

// ======================
// METADATA SEO
// ======================
export const metadata: Metadata = {
  title: "Pustaka Kanji | NihongoRoute",
  description: "Kuasai ribuan kanji dengan visualisasi stroke order yang interaktif dan mudah diingat.",
};

// ======================
// EKSEKUSI UTAMA
// ======================

/**
 * Halaman utama Pustaka Kanji (RSC).
 * Melakukan pra-ambil data halaman pertama daftar kanji sebelum merender KanjiListClient dalam Suspense.
 * 
 * @returns {JSX.Element} Halaman direktori pustaka kanji.
 */
export default async function KanjiListPage() {
  const initialData = await getPaginatedKanji(1, 24, "", "");

  return (
    <div className="w-full min-h-screen bg-background relative overflow-hidden pt-12 pb-24 px-4 md:px-8">
      {/* Efek Latar Belakang */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[500px] bg-primary/10 blur-[120px] rounded-[100%] pointer-events-none opacity-50" />
      <div className="neural-grid" />

      <div className="max-w-6xl mx-auto relative z-10">
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
