import type { Metadata } from "next";
import KanjiSimilarityClient from "@/components/features/tools/kanji-similarity/KanjiSimilarityClient";

export const metadata: Metadata = {
  title: "Kanji Similarity Tool | NihongoRoute",
  description: "Bandingkan pasangan kanji yang mirip dan latih perbedaannya.",
};

export default function KanjiSimilarityPage() {
  return <KanjiSimilarityClient />;
}
