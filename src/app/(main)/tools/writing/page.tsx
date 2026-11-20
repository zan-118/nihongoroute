/**
 * @file app/(main)/tools/writing/page.tsx
 * @description Halaman Kanvas Menulis untuk latihan menulis bebas dan terpandu dengan koreksi guratan.
 * @module FreeWritingPage
 */

import type { Metadata } from "next";
import FreeWritingClient from "@/features/tools/stroke-canvas/FreeWritingClient";
import { breadcrumbJsonLd, createPageMetadata, webApplicationJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { ROUTES } from "@/lib/core/routes";

export const metadata: Metadata = {
  ...createPageMetadata({
    title: "Kanvas Menulis Kanji & Kana | NihongoRoute",
    description:
      "Latih ingatan motorik dan urutan guratan (stroke order) Kanji dan Kana secara bebas langsung di atas kanvas digital interaktif.",
    path: ROUTES.TOOLS.WRITING,
    keywords: [
      "latihan menulis kanji",
      "stroke order kanji",
      "kanvas menulis jepang",
      "urutan guratan kanji",
      "latihan kana",
    ],
  }),
};

export default function FreeWritingPage() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Beranda", path: "/" },
            { name: "Pusat Peralatan", path: ROUTES.TOOLS.ROOT },
            { name: "Kanvas Menulis", path: ROUTES.TOOLS.WRITING },
          ]),
          webApplicationJsonLd({
            name: "Kanvas Menulis Kanji & Kana",
            description:
              "Kanvas digital interaktif untuk melatih ingatan motorik dan urutan guratan kanji serta kana.",
            path: ROUTES.TOOLS.WRITING,
            applicationCategory: "EducationalApplication",
          }),
        ]}
      />
      <FreeWritingClient />
    </>
  );
}
