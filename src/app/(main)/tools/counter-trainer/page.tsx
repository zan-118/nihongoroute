import type { Metadata } from "next";
import { getIntegratedCounterQuestions } from "@/actions/tools-integration.actions";
import CounterTrainerClient from "@/components/features/tools/counter-trainer/CounterTrainerClient";

export const metadata: Metadata = {
  title: "Counter Trainer | NihongoRoute",
  description: "Latihan memilih counter bahasa Jepang untuk orang, benda, umur, lantai, dan kategori umum lainnya.",
};

export const dynamic = "force-dynamic";

export default async function CounterTrainerPage() {
  const questions = await getIntegratedCounterQuestions();

  return (
    <CounterTrainerClient
      initialQuestions={questions}
      databaseQuestionCount={questions.length}
    />
  );
}
