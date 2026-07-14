import type { Metadata } from "next";
import ParticleTrainerClient from "@/components/features/tools/particle-trainer/ParticleTrainerClient";
import { createPageMetadata } from "@/lib/seo";

/**
 * Metadata for Particle Trainer page.
 * Configures SEO title, description, path, and keywords.
 */
export const metadata: Metadata = {
  ...createPageMetadata({
    title: "Particle Trainer Jepang | NihongoRoute",
    description: "Latihan memilih partikel Jepang yang tepat untuk kalimat rumpang, seperti wa, ga, wo, ni, de, to, kara, dan made.",
    path: "/tools/particles",
    keywords: ["partikel Jepang", "particle trainer", "latihan wa ga wo", "grammar Jepang"],
  }),
};

/**
 * Particle Trainer page component.
 * Renders client-side particle trainer tool.
 */
export default function ParticleTrainerPage() {
  return <ParticleTrainerClient />;
}