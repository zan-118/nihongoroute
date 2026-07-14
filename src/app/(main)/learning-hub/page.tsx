import type { Metadata } from "next";
import LearningHubClient from "@/components/features/ecosystem/LearningHubClient";
import { createPageMetadata } from "@/lib/seo";

/**
 * Page metadata. Disable indexing.
 */
export const metadata: Metadata = {
  ...createPageMetadata({
    title: "Learning Hub | NihongoRoute",
    description:
      "Pusat ekosistem belajar yang menyatukan daily route, titik lemah, rekomendasi, timeline, library, dan tools.",
    path: "/learning-hub",
    noIndex: true,
  }),
};

/**
 * Learning Hub page. Render client dashboard.
 */
export default function LearningHubPage() {
  return <LearningHubClient />;
}