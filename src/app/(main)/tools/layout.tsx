/**
 * @file layout.tsx
 * @description Layout sekunder untuk grup rute peralatan (Tools), menyediakan metadata SEO.
 */

// ======================
// IMPOR
// ======================
import type { Metadata } from "next";

// ======================
// KONFIGURASI METADATA
// ======================
/**
 * SEO metadata configuration for tools route group.
 */
export const metadata: Metadata = {
  title: "Pusat Peralatan Bahasa Jepang | NihongoRoute",
  description:
    "Kumpulan alat bantu belajar bahasa Jepang: Kana Master, kamus terpadu, text analyzer, latihan menulis, konjugasi, partikel, dan flashcards.",
};

// ======================
// EKSEKUSI UTAMA
// ======================
/**
 * Layout component for tools section.
 * Passes children directly without extra wrapper markup.
 * 
 * @param props - Component properties.
 * @param props.children - Child elements to render.
 * @returns Rendered children.
 */
export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  // Pass children through directly. Layout acts as metadata provider.
  return children;
}