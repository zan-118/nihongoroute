/**
 * @file layout.tsx
 * @description Layout sekunder untuk grup rute peralatan (Tools), menyediakan metadata SEO.
 */

// IMPOR

import type { Metadata } from "next";
import { breadcrumbJsonLd, createPageMetadata, webApplicationJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { ROUTES } from "@/lib/core/routes";

// KONFIGURASI METADATA

/**
 * SEO metadata configuration for tools route group.
 */
export const metadata: Metadata = {
  ...createPageMetadata({
    title: "Pusat Peralatan Bahasa Jepang | NihongoRoute",
    description:
      "Kumpulan alat bantu belajar bahasa Jepang: Kana Master, kamus terpadu, text analyzer, latihan menulis, konjugasi, partikel, dan flashcards.",
    path: ROUTES.TOOLS.ROOT,
    keywords: [
      "alat belajar bahasa jepang",
      "kana master",
      "text analyzer jepang",
      "latihan menulis jepang",
      "konjugasi jepang",
    ],
  }),
};

// EKSEKUSI UTAMA

/**
 * Layout component for tools section.
 * Injects Breadcrumb and WebApplication structured data schemas for search engines & AI bots.
 * 
 * @param props - Component properties.
 * @param props.children - Child elements to render.
 * @returns Rendered children with SEO schemas.
 */
export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Beranda", path: "/" },
            { name: "Peralatan", path: ROUTES.TOOLS.ROOT },
          ]),
          webApplicationJsonLd({
            name: "Pusat Peralatan Bahasa Jepang NihongoRoute",
            description: metadata.description as string,
            path: ROUTES.TOOLS.ROOT,
            applicationCategory: "EducationalApplication",
          }),
        ]}
      />
      {children}
    </>
  );
}