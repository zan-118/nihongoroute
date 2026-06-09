import type { Metadata } from "next";
import { getIntegratedShadowingPresets } from "@/actions/tools-integration.actions";
import ShadowingRecorderClient from "@/components/features/tools/shadowing-recorder/ShadowingRecorderClient";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  ...createPageMetadata({
    title: "Shadowing Recorder Jepang | NihongoRoute",
    description: "Latihan shadowing bahasa Jepang dengan playback target, rekaman mikrofon, dan preset dari materi listening.",
    path: "/tools/shadowing",
    keywords: ["shadowing bahasa Jepang", "latihan speaking Jepang", "rekaman pronunciation Jepang"],
  }),
};

export const dynamic = "force-dynamic";

type ToolSearchParams = Record<string, string | string[] | undefined>;

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function buildContextLabel(source?: string, slug?: string) {
  if (!source && !slug) return undefined;
  const sourceLabel = source ? source.charAt(0).toUpperCase() + source.slice(1) : "Library";
  return slug ? `Konteks dari ${sourceLabel}: ${decodeURIComponent(slug)}` : `Konteks dari ${sourceLabel}`;
}

export default async function ShadowingPage({
  searchParams,
}: {
  searchParams?: Promise<ToolSearchParams>;
}) {
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
