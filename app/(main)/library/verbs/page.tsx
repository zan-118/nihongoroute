/**
 * @file page.tsx
 * @description Halaman indeks direktori konjugasi kata kerja (Matriks Verba). 
 * Menangani penarikan data kata kerja lengkap dari Sanity CMS.
 * @module VerbDictionaryPage
 */

// ======================
// IMPORTS
// ======================
import { client } from "@/sanity/lib/client";
import VerbListClient from "./VerbListClient";

// ======================
// CONFIG / CONSTANTS
// ======================
export const revalidate = 3600;

// ======================
// MAIN EXECUTION
// ======================

/**
 * Komponen VerbDictionaryPage: Menarik data verba dan merender VerbListClient.
 * 
 * @returns {JSX.Element} Antarmuka kamus verba.
 */
export default async function VerbDictionaryPage() {
  // ======================
  // DATABASE OPERATIONS
  // ======================
  const query = `*[_type == "verb_dictionary" && showInFlashcard != false] | order(jisho asc) {
    _id, group, jisho, meaning, masu, furigana, te, nai, ta, teiru, tai, nakereba, kanou, shieki, ukemi, katei, ikou, teshimau, meirei
  }`;

  const verbs = await client.fetch(query);

  // ======================
  // RENDER
  // ======================
  return (
    <main className="w-full bg-cyber-bg px-6 md:px-12 relative overflow-hidden flex flex-col justify-start min-h-screen">
      {/* Background Neural Overlays */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(239,68,68,0.05)_0%,transparent_70%)] pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto w-full relative z-10 flex flex-col pt-10">
        <VerbListClient initialVerbs={verbs} />
      </div>
    </main>
  );
}
