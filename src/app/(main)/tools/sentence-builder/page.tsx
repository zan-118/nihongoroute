import type { Metadata } from "next";
import SentenceBuilderClient from "@/components/features/tools/sentence-builder/SentenceBuilderClient";
import { createPageMetadata } from "@/lib/seo";

/**
 * SEO metadata for Sentence Builder page.
 */
export const metadata: Metadata = {
  ...createPageMetadata({
    title: "Japanese Sentence Builder | NihongoRoute",
    description: "Susun token menjadi kalimat Jepang yang benar untuk melatih pola grammar, urutan kata, dan pemahaman struktur kalimat.",
    path: "/tools/sentence-builder",
    keywords: ["sentence builder Jepang", "latihan kalimat Jepang", "grammar Jepang", "susun kalimat Jepang"],
  }),
};

/**
 * Sentence Builder page component.
 * Renders client-side sentence builder tool.
 */
export default function SentenceBuilderPage() {
  return <SentenceBuilderClient />;
}