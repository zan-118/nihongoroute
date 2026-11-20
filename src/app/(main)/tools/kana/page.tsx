/**
 * @file page.tsx
 * @description Halaman utama Kana Master — alat latihan penguasaan aksara Hiragana dan Katakana.
 */

import type { Metadata } from "next";
import KanaClient from "@/features/tools/kana/KanaClient";
import { breadcrumbJsonLd, createPageMetadata, webApplicationJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { ROUTES } from "@/lib/core/routes";

export const metadata: Metadata = {
  ...createPageMetadata({
    title: "Kana Master - Latihan Huruf Hiragana & Katakana | NihongoRoute",
    description:
      "Pelajari dan kuasai aksara Hiragana dan Katakana Jepang melalui tabel interaktif, latihan guratan, dan kuis cepat adaptif.",
    path: ROUTES.TOOLS.KANA,
    keywords: [
      "hiragana jepang",
      "katakana jepang",
      "kana master",
      "belajar huruf jepang",
      "tabel hiragana katakana",
      "kuis kana",
    ],
  }),
};

/**
 * Kana Master page route component (Server Component with SEO & JSON-LD).
 */
export default function KanaPage() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Beranda", path: "/" },
            { name: "Pusat Peralatan", path: ROUTES.TOOLS.ROOT },
            { name: "Kana Master", path: ROUTES.TOOLS.KANA },
          ]),
          webApplicationJsonLd({
            name: "Kana Master",
            description:
              "Alat latihan penguasaan aksara Hiragana dan Katakana interaktif dengan visualisasi goresan dan kuis.",
            path: ROUTES.TOOLS.KANA,
            applicationCategory: "EducationalApplication",
          }),
        ]}
      />
      <KanaClient />
    </>
  );
}
