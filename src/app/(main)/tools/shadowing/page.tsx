import type { Metadata } from "next";
import ShadowingRecorderClient from "@/components/features/tools/shadowing-recorder/ShadowingRecorderClient";

export const metadata: Metadata = {
  title: "Shadowing Recorder | NihongoRoute",
  description: "Latihan shadowing bahasa Jepang dengan playback target dan rekaman mikrofon.",
};

export default function ShadowingPage() {
  return <ShadowingRecorderClient />;
}
