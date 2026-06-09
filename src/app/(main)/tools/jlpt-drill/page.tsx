import type { Metadata } from "next";
import { getIntegratedMiniDrillQuestions } from "@/actions/tools-integration.actions";
import JlptMiniDrillClient from "@/components/features/tools/jlpt-mini-drill/JlptMiniDrillClient";

export const metadata: Metadata = {
  title: "JLPT Mini Drill | NihongoRoute",
  description: "Generator latihan cepat JLPT untuk vocab, kanji, dan grammar.",
};

export const dynamic = "force-dynamic";

export default async function JlptMiniDrillPage() {
  const questions = await getIntegratedMiniDrillQuestions();

  return (
    <JlptMiniDrillClient
      initialQuestions={questions}
      databaseQuestionCount={questions.length}
    />
  );
}
