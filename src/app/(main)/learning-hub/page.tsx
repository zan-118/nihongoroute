import type { Metadata } from "next";
import LearningHubClient from "@/components/features/ecosystem/LearningHubClient";

export const metadata: Metadata = {
  title: "Learning Hub | NihongoRoute",
  description:
    "Pusat ekosistem belajar yang menyatukan daily route, titik lemah, rekomendasi, timeline, library, dan tools.",
};

export default function LearningHubPage() {
  return <LearningHubClient />;
}
