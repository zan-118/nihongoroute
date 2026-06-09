import type { Metadata } from "next";
import TextAnalyzerClient from "@/components/features/tools/text-analyzer/TextAnalyzerClient";

export const metadata: Metadata = {
  title: "Text Analyzer | NihongoRoute",
  description: "Analisis teks Jepang untuk menemukan kosakata, kanji, dan pola tata bahasa.",
};

export default function TextAnalyzerPage() {
  return <TextAnalyzerClient />;
}
