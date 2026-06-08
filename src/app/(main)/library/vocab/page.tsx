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
import VocabClient from "./VocabClient";
import { getPaginatedVocab } from "@/actions/library.actions";

export const dynamic = "force-dynamic";

// ======================
// METADATA SEO
// ======================
export const metadata = {
  title: "Kamus Kosakata | NihongoRoute",
  description: "Ribuan kosakata bahasa Jepang N5-N2, dilengkapi dengan furigana, fitur pengucapan audio, dan opsi penambahan ke jadwal SRS.",
};

// ======================
// EKSEKUSI UTAMA
// ======================

/**
 * Halaman utama Kamus Kosakata (RSC).
 * Melakukan pra-ambil data halaman pertama daftar kosakata sebelum merender VocabClient dalam Suspense.
 * 
 * @returns {JSX.Element} Halaman direktori pustaka kosakata.
 */
export default async function VocabLibraryPage() {
  const initialData = await getPaginatedVocab(1, 50, "", "all", "all");

  return (
    <main className="w-full bg-transparent px-6 md:px-12 relative overflow-hidden flex flex-col justify-start min-h-screen pt-24 pb-20 transition-colors duration-300">
      {/* Background Neural Overlays */}
      <div className="neural-grid" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgb(var(--destructive-rgb)/0.05)_0%,transparent_70%)] pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto w-full relative z-10 flex flex-col pt-10">
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
