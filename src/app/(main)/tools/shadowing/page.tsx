import type { Metadata } from "next";
import { getIntegratedShadowingPresets } from "@/actions/tools-integration.actions";
import ShadowingRecorderClient from "@/features/tools/shadowing-recorder/ShadowingRecorderClient";
import { createPageMetadata } from "@/lib/seo";

import { ROUTES } from "@/lib/core/routes";
/** Page metadata. Define SEO tags for shadowing tool. */
export const metadata: Metadata = {
  ...createPageMetadata({
    title: "Shadowing Recorder Jepang | NihongoRoute",
    description: "Latihan shadowing bahasa Jepang dengan playback target, rekaman mikrofon, dan preset dari materi listening.",
    path:ROUTES.TOOLS.SHADOWING,
    keywords: ["shadowing bahasa Jepang", "latihan speaking Jepang", "rekaman pronunciation Jepang"],
  }),
};

/** Force dynamic rendering. Ensure fresh data fetch. */
export const dynamic = "force-dynamic";

/** Search parameters for shadowing tool. */
type ToolSearchParams = Record<string, string | string[] | undefined>;

/** Extract first string from search parameter value. Handle array fallback. */
function firstParam(value: string | string[] | undefined) {
  // Return first element if array, else return value directly.
  return Array.isArray(value) ? value[0] : value;
}

/** Build user-friendly label for source context. Format source name and slug. */
function buildContextLabel(source?: string, slug?: string) {
  if (!source && !slug) return undefined;
  // Capitalize first letter of source name.
  const sourceLabel = source ? source.charAt(0).toUpperCase() + source.slice(1) : "Library";
  return slug ? `Konteks dari ${sourceLabel}: ${decodeURIComponent(slug)}` : `Konteks dari ${sourceLabel}`;
}

/** Shadowing tool page component. Fetch presets based on query params. Render client recorder. */
export default async function ShadowingPage({
  searchParams,
}: {
  searchParams?: Promise<ToolSearchParams>;
}) {
  // Await search params promise. Next.js 15 requirement.
  const params = searchParams ? await searchParams : {};
  const source = firstParam(params.source);
  const slug = firstParam(params.slug);
  const level = firstParam(params.level);
  const presets = await getIntegratedShadowingPresets({ source, slug, level });

  return (
    <ShadowingRecorderClient
      initialPresets={presets}
      libraryPresetCount={presets.length}
      contextLabel={buildContextLabel(source, slug)}
    />
  );
}