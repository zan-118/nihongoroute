import type { Metadata } from "next";
import ParticleTrainerClient from "@/components/features/tools/particle-trainer/ParticleTrainerClient";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  ...createPageMetadata({
    title: "Particle Trainer Jepang | NihongoRoute",
    description: "Latihan memilih partikel Jepang yang tepat untuk kalimat rumpang, seperti wa, ga, wo, ni, de, to, kara, dan made.",
    path: "/tools/particles",
    keywords: ["partikel Jepang", "particle trainer", "latihan wa ga wo", "grammar Jepang"],
  }),
};

export default function ParticleTrainerPage() {
  return <ParticleTrainerClient />;
}
