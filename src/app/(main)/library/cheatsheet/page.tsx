/**
 * @file page.tsx
 * @description Halaman rute referensi kilat (Cheatsheets). 
 * Menangani penarikan data referensi statis dari Supabase.
 * @module CheatsheetPage
 */

// ======================
// IMPOR
// ======================
import type { Metadata } from "next";
import CheatsheetClient from "./CheatsheetClient";
import { getCheatsheets } from "@/actions/library.actions";

// ======================
// METADATA SEO
// ======================
export const metadata: Metadata = {
  title: "Referensi Cepat & Cheatsheets | NihongoRoute",
  description: "Akses cepat tabel angka, partikel dasar, tata bahasa, dan referensi kilat bahasa Jepang.",
};

// ======================
// EKSEKUSI UTAMA
// ======================

/**
 * Halaman utama Referensi Cepat & Cheatsheets (RSC).
 * Menarik seluruh data cheatsheet dari Supabase dan merender komponen klien.
 * 
 * @returns {JSX.Element} Halaman indeks cheatsheet referensi cepat.
 */
export default async function CheatsheetPage() {
  // ======================
  // OPERASI DATABASE
  // ======================
  const sheets = await getCheatsheets();

  // ======================
  // RENDER UTAMA
  // ======================
  return (
    <main className="w-full bg-background px-6 md:px-12 relative overflow-hidden flex flex-col justify-start min-h-screen">
      {/* Background Neural Overlays */}
      <div className="neural-grid" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(var(--destructive-rgb),0.05)_0%,transparent_70%)] pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto w-full relative z-10 flex flex-col pt-10">
        <CheatsheetClient initialSheets={sheets} />
      </div>
    </main>
  );
}
