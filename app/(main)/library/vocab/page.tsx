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

/**
 * Komponen VocabLibraryPage: Merender antarmuka kamus kosakata melalui VocabClient.
 * 
 * @returns {JSX.Element} Halaman kamus kosakata.
 */
export default function VocabLibraryPage() {
  // ======================
  // RENDER
  // ======================
  return (
    <main className="w-full bg-cyber-bg px-6 md:px-12 relative overflow-hidden flex flex-col justify-start min-h-screen">
      {/* Background Neural Overlays */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(239,68,68,0.05)_0%,transparent_70%)] pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto w-full relative z-10 flex flex-col pt-10">
        <VocabClient />
      </div>
    </main>
  );
}
