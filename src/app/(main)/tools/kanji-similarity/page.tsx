import type { Metadata } from "next";
import KanjiSimilarityClient from "@/components/features/tools/kanji-similarity/KanjiSimilarityClient";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  ...createPageMetadata({
    title: "Kanji Similarity Tool | NihongoRoute",
    description: "Bandingkan pasangan kanji yang mirip dan latih perbedaan bentuk, arti, serta kosakata terkait.",
    path: "/tools/kanji-similarity",
    keywords: ["kanji mirip", "similar kanji", "bedakan kanji", "latihan kanji"],
  }),
};

export default function KanjiSimilarityPage() {
  return <KanjiSimilarityClient />;
}
