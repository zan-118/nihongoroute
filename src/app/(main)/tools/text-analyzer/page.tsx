import type { Metadata } from "next";
import { Suspense } from "react";
import TextAnalyzerClient from "@/features/tools/text-analyzer/TextAnalyzerClient";
import { createPageMetadata } from "@/lib/seo";

import { ROUTES } from "@/lib/core/routes";
/**
 * Page metadata. Configure SEO for Japanese text analyzer tool.
 */
export const metadata: Metadata = {
  ...createPageMetadata({
    title: "Japanese Text Analyzer | NihongoRoute",
    description: "Analisis teks Jepang untuk menemukan kosakata, kanji, dan pola tata bahasa penting.",
    path: ROUTES.TOOLS.TEXT_ANALYZER,
    keywords: ["text analyzer Jepang", "analisis teks Jepang", "kanji parser", "grammar parser Jepang"],
  }),
};

/**
 * Text analyzer page component. Fetch initial text from library if source and slug provided. Render client component.
 */
export default async function TextAnalyzerPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-background/95">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    }>
      <TextAnalyzerClient />
    </Suspense>
  );
}