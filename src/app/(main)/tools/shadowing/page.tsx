import type { Metadata } from "next";
import { Suspense } from "react";
import { getIntegratedShadowingPresets } from "@/actions/tools-integration.actions";
import ShadowingRecorderClient from "@/features/tools/shadowing-recorder/ShadowingRecorderClient";
import { createPageMetadata } from "@/lib/seo";

import { ROUTES } from "@/lib/core/routes";
/** Page metadata. Define SEO tags for shadowing tool. */
export const metadata: Metadata = {
  ...createPageMetadata({
    title: "Shadowing Recorder Jepang | NihongoRoute",
    description: "Latihan shadowing bahasa Jepang dengan playback target, rekaman mikrofon, dan preset dari materi listening.",
    path: ROUTES.TOOLS.SHADOWING,
    keywords: ["shadowing bahasa Jepang", "latihan speaking Jepang", "rekaman pronunciation Jepang"],
  }),
};

/** Shadowing tool page component. Fetch default presets and render client recorder. */
export default async function ShadowingPage() {
  const presets = await getIntegratedShadowingPresets();

  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-background/95">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    }>
      <ShadowingRecorderClient
        initialPresets={presets}
        libraryPresetCount={presets.length}
      />
    </Suspense>
  );
}