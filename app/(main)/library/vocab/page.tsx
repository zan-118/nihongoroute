/**
 * @file page.tsx
 * @description Halaman indeks Kamus Kosakata. 
 * Menangani metadata SEO dan pembungkusan komponen VocabClient.
 * @module VocabLibraryPage
 */

// ======================
// IMPORTS
// ======================
import { client } from "@/sanity/lib/client";
import VocabClient from "./VocabClient";

// ======================
// CONFIG / CONSTANTS
// ======================
export const metadata = {
  title: "Kamus Kosakata | NihongoRoute",
  description: "Ribuan kosakata bahasa Jepang N5-N2, dilengkapi dengan furigana, fitur pengucapan audio, dan opsi penambahan ke jadwal SRS.",
};

// Mengaktifkan Incremental Static Regeneration (ISR) setiap 1 jam
export const revalidate = 3600;

// ======================
// MAIN EXECUTION
// ======================

export default async function VocabLibraryPage() {
  // Pre-fetch 50 item pertama untuk N5 (default view) di sisi server
  const initialQuery = `*[_type == "vocab" && course_category->slug.current in ["n5", "jlpt-n5"]] | order(romaji asc) [0...50] { _id, word, furigana, romaji, meaning, hinshi }`;
  
  const initialData = await client.fetch(initialQuery);

  return (
    <main className="w-full bg-background px-6 md:px-12 relative overflow-hidden flex flex-col justify-start min-h-screen pt-24 pb-20 transition-colors duration-300">
      {/* Background Neural Overlays */}
      <div className="neural-grid" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(239,68,68,0.05)_0%,transparent_70%)] pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto w-full relative z-10 flex flex-col pt-10">
        <VocabClient initialData={initialData} />
      </div>
    </main>
  );
}
