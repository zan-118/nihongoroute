import type { Metadata } from "next";
import { Suspense } from "react";
import { getIntegratedCounterQuestions } from "@/actions/tools-integration.actions";
import CounterTrainerClient from "@/features/tools/counter-trainer/CounterTrainerClient";
import { createPageMetadata } from "@/lib/seo";

import { ROUTES } from "@/lib/core/routes";
/** Page metadata for SEO. */
export const metadata: Metadata = {
  ...createPageMetadata({
    title: "Counter Trainer Jepang | NihongoRoute",
    description: "Latihan memilih counter bahasa Jepang untuk orang, benda, umur, lantai, waktu, dan kategori umum lainnya.",
    path: ROUTES.TOOLS.COUNTER_TRAINER,
    keywords: ["counter bahasa Jepang", "josuushi", "latihan counter Jepang", "angka Jepang"],
  }),
};

/** Counter trainer page component. Fetch questions and render client trainer. */
export default async function CounterTrainerPage() {
  // Fetch default static questions.
  const questions = await getIntegratedCounterQuestions();

  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-background/95">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    }>
      <CounterTrainerClient
        initialQuestions={questions}
        databaseQuestionCount={questions.length}
      />
    </Suspense>
  );
}