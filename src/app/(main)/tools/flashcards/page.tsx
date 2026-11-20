/**
 * @file app/(main)/tools/flashcards/page.tsx
 * @description Pusat Latihan Flashcard (General Flashcards).
 * Orchestrator untuk pemilihan kategori, mode, dan sesi latihan.
 */

import type { Metadata } from "next";
import FlashcardsClient from "@/features/review/flashcards/FlashcardsClient";
import { breadcrumbJsonLd, createPageMetadata, webApplicationJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { ROUTES } from "@/lib/core/routes";

export const metadata: Metadata = {
  ...createPageMetadata({
    title: "Flashcard Bahasa Jepang Interaktif | NihongoRoute",
    description:
      "Latihan hafalan kosakata dan kanji bahasa Jepang dengan kartu flashcard cerdas, audio pengucapan, dan mode latihan adaptif.",
    path: ROUTES.TOOLS.FLASHCARDS,
    keywords: [
      "flashcard bahasa jepang",
      "flashcards kanji",
      "flashcards kosakata",
      "latihan hafalan jepang",
      "kartu pintar jepang",
    ],
  }),
};

export default function FlashcardsPage() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Beranda", path: "/" },
            { name: "Pusat Peralatan", path: ROUTES.TOOLS.ROOT },
            { name: "Flashcard", path: ROUTES.TOOLS.FLASHCARDS },
          ]),
          webApplicationJsonLd({
            name: "Flashcard Bahasa Jepang",
            description:
              "Modul flashcard pintar untuk menghafal kosakata dan kanji dengan audio dan mode latihan beragam.",
            path: ROUTES.TOOLS.FLASHCARDS,
            applicationCategory: "EducationalApplication",
          }),
        ]}
      />
      <FlashcardsClient />
    </>
  );
}
