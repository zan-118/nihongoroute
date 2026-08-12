import type { Metadata } from "next";
import { getIntegratedShadowingPresets } from "@/actions/tools-integration.actions";
import ShadowingRecorderClient from "@/features/tools/shadowing-recorder/ShadowingRecorderClient";
import { createPageMetadata } from "@/lib/seo";
import { buildContextLabel, firstParam, type ToolSearchParams } from "@/lib/core/utils";

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