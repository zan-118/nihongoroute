import type { Metadata } from "next";
import KanjiSimilarityClient from "@/components/features/tools/kanji-similarity/KanjiSimilarityClient";
import { createPageMetadata } from "@/lib/seo";

import { ROUTES } from "@/lib/core/routes";
/** Page metadata. SEO config. */
export const metadata: Metadata = {
  ...createPageMetadata({
    title: "Kanji Similarity Tool | NihongoRoute",
    description: "Bandingkan pasangan kanji yang mirip dan latih perbedaan bentuk, arti, serta kosakata terkait.",
    path:ROUTES.TOOLS.KANJI_SIMILARITY,
    keywords: ["kanji mirip", "similar kanji", "bedakan kanji", "latihan kanji"],
  }),
};

/** Kanji Similarity page component. Renders client tool. */
export default function KanjiSimilarityPage() {
  return <KanjiSimilarityClient />;
}