/**
 * @file app/(main)/tools/survival/page.tsx
 * @description Halaman utama game Mode Bertahan Hidup (Survival Mode).
 * Menyediakan antarmuka pemilihan level JLPT dan jumlah kartu sebelum memulai game.
 */

import type { Metadata } from "next";
import SurvivalClient from "@/features/games/survival/SurvivalClient";
import { breadcrumbJsonLd, createPageMetadata, webApplicationJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { ROUTES } from "@/lib/core/routes";

export const metadata: Metadata = {
  ...createPageMetadata({
    title: "Survival Vocabulary Challenge | NihongoRoute",
    description:
      "Tantangan kecepatan mengingat kosakata bahasa Jepang berbatas waktu dan nyawa. Uji ketajaman hafalan JLPT kamu di arena bertahan hidup.",
    path: ROUTES.TOOLS.SURVIVAL,
    keywords: [
      "survival vocabulary japanese",
      "game kosakata jepang",
      "kuis cepat jepang",
      "tantangan jlpt",
      "belajar kosakata seru",
    ],
  }),
};

export default function SurvivalPage() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Beranda", path: "/" },
            { name: "Pusat Peralatan", path: ROUTES.TOOLS.ROOT },
            { name: "Mode Bertahan Hidup", path: ROUTES.TOOLS.SURVIVAL },
          ]),
          webApplicationJsonLd({
            name: "Survival Vocabulary Challenge",
            description:
              "Game kuis kecepatan mengingat kosakata bahasa Jepang berbatas waktu dan nyawa.",
            path: ROUTES.TOOLS.SURVIVAL,
            applicationCategory: "GameApplication",
          }),
        ]}
      />
      <SurvivalClient />
    </>
  );
}
