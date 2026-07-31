import type { Metadata } from "next";
import { getLibraryTextForTool } from "@/actions/tools-integration.actions";
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
    path:ROUTES.TOOLS.TEXT_ANALYZER,
    keywords: ["text analyzer Jepang", "analisis teks Jepang", "kanji parser", "grammar parser Jepang"],
  }),
};

/**
 * Force dynamic rendering. Ensure fresh data on request.
 */
export const dynamic = "force-dynamic";

/**
 * Search parameters shape. Handle query strings.
 */
type ToolSearchParams = Record<string, string | string[] | undefined>;

/**
 * Extract first parameter value. Handle array or single string.
 * 
 * @param value - Raw query parameter value.
 * @returns First string value or undefined.
 */
function firstParam(value: string | string[] | undefined) {
  // Extract first item if array. Otherwise return value.
  return Array.isArray(value) ? value[0] : value;
}

/**
 * Text analyzer page component. Fetch initial text from library if source and slug provided. Render client component.
 * 
 * @param props - Component properties.
 * @param props.searchParams - URL search parameters.
 */
export default async function TextAnalyzerPage({
  searchParams,
}: {
  searchParams?: Promise<ToolSearchParams>;
}) {
  // Await search params for Next.js 15 compatibility.
  const params = searchParams ? await searchParams : {};
  const source = firstParam(params.source);
  const slug = firstParam(params.slug);
  // Fetch text from database using source and slug.
  const sourceText = await getLibraryTextForTool({ source, slug });

  return (
    <TextAnalyzerClient
      initialText={sourceText?.text}
      initialSourceTitle={sourceText?.title}
      initialSourceHref={sourceText?.sourceHref}
    />
  );
}