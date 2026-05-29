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
  title: "Pusat Peralatan | NihongoRoute",
  description: "Kumpulan alat bantu belajar bahasa Jepang: Kana Master, Flashcards, latihan menulis, dan kamus.",
};

// ======================
// EKSEKUSI UTAMA
// ======================
export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
