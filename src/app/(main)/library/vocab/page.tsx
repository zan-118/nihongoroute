/**
 * @file page.tsx
 * @description Halaman indeks Kamus Kosakata. 
 * Menangani metadata SEO dan pembungkusan komponen VocabClient.
 * @module VocabLibraryPage
 */

// ======================
// IMPORTS
// ======================
import VocabClient from "./VocabClient";
import { getPaginatedVocab } from "@/actions/library.actions";

// ======================
// CONFIG / CONSTANTS
// ======================
export const metadata = {
  title: "Kamus Kosakata | NihongoRoute",
  description: "Ribuan kosakata bahasa Jepang N5-N2, dilengkapi dengan furigana, fitur pengucapan audio, dan opsi penambahan ke jadwal SRS.",
};

// ======================
// MAIN EXECUTION
// ======================

export default async function VocabLibraryPage() {
  const initialData = await getPaginatedVocab(1, 50, "", "all", "all");

  return (
    <main className="w-full bg-background px-6 md:px-12 relative overflow-hidden flex flex-col justify-start min-h-screen pt-24 pb-20 transition-colors duration-300">
      {/* Background Neural Overlays */}
      <div className="neural-grid" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(var(--destructive-rgb),0.05)_0%,transparent_70%)] pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto w-full relative z-10 flex flex-col pt-10">
        <VocabClient initialData={initialData} />
      </div>
    </main>
  );
}
