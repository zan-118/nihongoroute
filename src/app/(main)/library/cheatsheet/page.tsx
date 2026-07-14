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

// ======================
// METADATA SEO
// ======================
/**
 * SEO metadata configuration for cheatsheet page.
 */
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
 * Cheatsheet page component.
 * Fetches cheatsheet data from database. Renders client view with SEO metadata.
 * 
 * @returns Cheatsheet page layout.
 */
export default async function CheatsheetPage() {
  // ======================
  // OPERASI DATABASE
  // ======================
  // Fetch cheatsheet list from database.
  const sheets = await getCheatsheets();

  // ======================
  // RENDER UTAMA
  // ======================
  return (
    <main className="w-full bg-transparent px-6 md:px-12 relative overflow-hidden flex flex-col justify-start min-h-screen">
      {/* Inject structured JSON-LD data for SEO. */}
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
        {/* Render interactive client component with initial data. */}
        <CheatsheetClient initialSheets={sheets} />
      </div>
    </main>
  );
}