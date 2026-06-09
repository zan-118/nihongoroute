import type { Metadata } from "next";
import { getIntegratedShadowingPresets } from "@/actions/tools-integration.actions";
import ShadowingRecorderClient from "@/components/features/tools/shadowing-recorder/ShadowingRecorderClient";

export const metadata: Metadata = {
  title: "Shadowing Recorder | NihongoRoute",
  description: "Latihan shadowing bahasa Jepang dengan playback target dan rekaman mikrofon.",
};

export const dynamic = "force-dynamic";

export default async function ShadowingPage() {
  const presets = await getIntegratedShadowingPresets();

  return (
    <ShadowingRecorderClient
      initialPresets={presets}
      libraryPresetCount={presets.length}
    />
  );
}
