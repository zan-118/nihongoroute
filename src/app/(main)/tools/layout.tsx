/**
 * @file layout.tsx
 * @description Layout sekunder untuk grup rute peralatan (Tools), menyediakan metadata SEO.
 */

// ======================
// IMPOR
// ======================
import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

import { ROUTES } from "@/lib/core/routes";
// ======================
// KONFIGURASI METADATA
// ======================
/**
 * SEO metadata configuration for tools route group.
 */
export const metadata: Metadata = {
  ...createPageMetadata({
    title: "Pusat Peralatan Bahasa Jepang | NihongoRoute",
    description:
      "Kumpulan alat bantu belajar bahasa Jepang: Kana Master, kamus terpadu, text analyzer, latihan menulis, konjugasi, partikel, dan flashcards.",
    path:ROUTES.TOOLS.ROOT,
    keywords: [
      "alat belajar bahasa jepang",
      "kana master",
      "text analyzer jepang",
      "latihan menulis jepang",
      "konjugasi jepang",
    ],
  }),
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