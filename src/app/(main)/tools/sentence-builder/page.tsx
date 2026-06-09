import type { Metadata } from "next";
import SentenceBuilderClient from "@/components/features/tools/sentence-builder/SentenceBuilderClient";

export const metadata: Metadata = {
  title: "Sentence Builder | NihongoRoute",
  description: "Susun token menjadi kalimat Jepang yang benar untuk melatih pola grammar.",
};

export default function SentenceBuilderPage() {
  return <SentenceBuilderClient />;
}
