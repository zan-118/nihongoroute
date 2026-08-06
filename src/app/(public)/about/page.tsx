/**
 * @file page.tsx
 * @description Pure server component route wrapper for public About Us page.
 */

import type { Metadata } from "next";
import AboutView from "@/features/about/AboutView";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, createPageMetadata, webPageJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  ...createPageMetadata({
    title: "Tentang Kami | NihongoRoute",
    description:
      "Mengenal visi NihongoRoute dalam menyediakan platform belajar bahasa Jepang gratis, offline-first, dan bebas iklan untuk seluruh pejuang bahasa di Indonesia.",
    path: "/about",
    keywords: [
      "tentang NihongoRoute",
      "visi NihongoRoute",
      "belajar bahasa jepang gratis",
      "offline-first japanese learning",
      "SRS jepang indonesia",
    ],
  }),
};

/**
 * AboutPage component.
 * Pure route wrapper delegating visual UI rendering to AboutView within PublicLayout.
 */
export default function AboutPage() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Beranda", path: "/" },
            { name: "Tentang Kami", path: "/about" },
          ]),
          webPageJsonLd({
            name: "Tentang NihongoRoute",
            description: metadata.description as string,
            path: "/about",
          }),
        ]}
      />
      <AboutView />
    </>
  );
}
