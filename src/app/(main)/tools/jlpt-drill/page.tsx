import type { Metadata } from "next";
import { Suspense } from "react";
import { getIntegratedMiniDrillQuestions } from "@/actions/tools-integration.actions";
import JlptMiniDrillClient from "@/features/tools/jlpt-mini-drill/JlptMiniDrillClient";
import { createPageMetadata } from "@/lib/seo";

import { ROUTES } from "@/lib/core/routes";
/** Page metadata for SEO. */
export const metadata: Metadata = {
  ...createPageMetadata({
    title: "JLPT Mini Drill | NihongoRoute",
    description: "Generator latihan cepat JLPT untuk kosakata, kanji, dan grammar dari level N5 sampai N1.",
    path: ROUTES.TOOLS.JLPT_DRILL,
    keywords: ["JLPT drill", "latihan JLPT", "quiz JLPT", "vocab kanji grammar JLPT"],
  }),
};

/** JLPT Mini Drill page component. Fetches default questions and renders client drill interface. */
export default async function JlptMiniDrillPage() {
  // Fetch default questions for static generation
  const questions = await getIntegratedMiniDrillQuestions();

  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-background/95">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    }>
      <JlptMiniDrillClient
        initialQuestions={questions}
        databaseQuestionCount={questions.length}
      />
    </Suspense>
  );
}