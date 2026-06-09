import type { Metadata } from "next";
import { getLibraryTextForTool } from "@/actions/tools-integration.actions";
import TextAnalyzerClient from "@/components/features/tools/text-analyzer/TextAnalyzerClient";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  ...createPageMetadata({
    title: "Japanese Text Analyzer | NihongoRoute",
    description: "Analisis teks Jepang untuk menemukan kosakata, kanji, dan pola tata bahasa penting.",
    path: "/tools/text-analyzer",
    keywords: ["text analyzer Jepang", "analisis teks Jepang", "kanji parser", "grammar parser Jepang"],
  }),
};

export const dynamic = "force-dynamic";

type ToolSearchParams = Record<string, string | string[] | undefined>;

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function TextAnalyzerPage({
  searchParams,
}: {
  searchParams?: Promise<ToolSearchParams>;
}) {
  const params = searchParams ? await searchParams : {};
  const source = firstParam(params.source);
  const slug = firstParam(params.slug);
  const sourceText = await getLibraryTextForTool({ source, slug });

  return (
    <TextAnalyzerClient
      initialText={sourceText?.text}
      initialSourceTitle={sourceText?.title}
      initialSourceHref={sourceText?.sourceHref}
    />
  );
}
