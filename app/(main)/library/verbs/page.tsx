/**
 * @file app/(main)/library/verbs/page.tsx
 * @description Halaman indeks direktori konjugasi kata kerja (Matriks Verba). Rute peladen statis yang menangani penarikan data dasar kata kerja, bentuk Masu, Te, Nai, dan Potensial dari Sanity CMS.
 * @module Server Component
 */

import { client } from "@/sanity/lib/client";
import VerbListClient from "./VerbListClient";

// Konfigurasi revalidasi statis berkala setiap 1 jam untuk memperbarui daftar kosakata dari CMS.
export const revalidate = 3600;

/**
 * Komponen Induk Layar Kamus Verba.
 * Menyediakan struktur kontainer utama dan mendelegasikan daftar lengkap array kata kerja ke klien.
 * 
 * @returns {JSX.Element} Grid interaktif kartu konjugasi kata kerja.
 */
export default async function VerbDictionaryPage() {
  const query = `*[_type == "verb_dictionary" && showInFlashcard != false] | order(jisho asc) {
    _id, group, jisho, meaning, masu, furigana, te, nai, ta, teiru, tai, nakereba, kanou, shieki, ukemi, katei, ikou, teshimau, meirei
  }`;

  const verbs = await client.fetch(query);

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
