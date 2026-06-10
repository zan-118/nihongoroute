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
import { JsonLd } from "@/components/seo/JsonLd";
import CheatsheetClient from "./CheatsheetClient";
import { getCheatsheets } from "@/actions/library.actions";
import {
  breadcrumbJsonLd,
  createPageMetadata,
  learningResourceJsonLd,
} from "@/lib/seo";

export const revalidate = 3600;

// ======================
// METADATA SEO
// ======================
export const metadata: Metadata = {
  ...createPageMetadata({
    title: "Cheatsheet Bahasa Jepang | NihongoRoute",
    description:
      "Akses cepat tabel angka, partikel, pola tata bahasa, dan referensi kilat bahasa Jepang untuk dipelajari online atau diunduh sebagai PDF.",
    path: "/library/cheatsheet",
    keywords: ["cheatsheet bahasa Jepang", "referensi Jepang", "partikel Jepang", "tabel JLPT"],
  }),
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
    <main className="w-full bg-transparent px-6 md:px-12 relative overflow-hidden flex flex-col justify-start min-h-screen">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Beranda", path: "/" },
            { name: "Pustaka", path: "/library" },
            { name: "Cheatsheet", path: "/library/cheatsheet" },
          ]),
          learningResourceJsonLd({
            name: "Cheatsheet Bahasa Jepang",
            description: metadata.description as string,
            path: "/library/cheatsheet",
            teaches: sheets.map((sheet) => sheet.title).filter(Boolean),
          }),
        ]}
      />
      {/* Background Neural Overlays */}
      <div className="neural-grid" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgb(var(--destructive-rgb)/0.05)_0%,transparent_70%)] pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto w-full relative z-10 flex flex-col pt-10">
        <CheatsheetClient initialSheets={sheets} />
      </div>
    </main>
  );
}
