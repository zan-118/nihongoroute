import type { Metadata } from "next";
import ParticleTrainerClient from "@/components/features/tools/particle-trainer/ParticleTrainerClient";

export const metadata: Metadata = {
  title: "Particle Trainer | NihongoRoute",
  description: "Latihan memilih partikel Jepang yang tepat untuk kalimat rumpang.",
};

export default function ParticleTrainerPage() {
  return <ParticleTrainerClient />;
}
