import type { Metadata } from "next";
import ConjugationTrainerClient from "@/components/features/tools/conjugation-trainer/ConjugationTrainerClient";

export const metadata: Metadata = {
  title: "Verb Conjugation Trainer | NihongoRoute",
  description: "Latihan konjugasi verba Jepang untuk bentuk masu, te, nai, ta, dan lainnya.",
};

export default function ConjugationTrainerPage() {
  return <ConjugationTrainerClient />;
}
