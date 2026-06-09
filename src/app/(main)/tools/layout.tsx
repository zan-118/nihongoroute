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
export const metadata: Metadata = {
  title: "Pusat Peralatan Bahasa Jepang | NihongoRoute",
  description:
    "Kumpulan alat bantu belajar bahasa Jepang: Kana Master, kamus terpadu, text analyzer, latihan menulis, konjugasi, partikel, dan flashcards.",
};

// ======================
// EKSEKUSI UTAMA
// ======================
export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
