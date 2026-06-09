/**
 * @file page.tsx
 * @description Halaman landas (Landing Page) utama NihongoRoute.
 * Menyediakan informasi fitur, branding, dan akses cepat ke dashboard pembelajaran.
 * Server Component untuk SSG dan SEO optimal.
 * @module LandingPage
 */

// ======================
// IMPOR
// ======================
import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  createPageMetadata,
  learningResourceJsonLd,
  webPageJsonLd,
} from "@/lib/seo";

// Komponen Domain (seluruhnya "use client" secara internal)
import { Hero } from "@/components/features/landing/Hero";
import { FeatureGrid } from "@/components/features/landing/FeatureGrid";
import { TrustBanner } from "@/components/features/landing/TrustBanner";
import { LandingFooter } from "@/components/features/landing/LandingFooter";

export const metadata: Metadata = {
  ...createPageMetadata({
    title: "NihongoRoute - Belajar Bahasa Jepang Offline-First",
    description:
      "Platform belajar Bahasa Jepang gratis dengan dukungan offline-first, metode Spaced Repetition System (SRS), kosakata, tata bahasa, dan simulasi ujian JLPT.",
    path: "/",
    keywords: [
      "belajar bahasa Jepang gratis",
      "belajar JLPT online",
      "SRS bahasa Jepang",
      "kosakata JLPT",
      "kanji JLPT",
    ],
  }),
};

export default function LandingPage() {
  return (
    <main className="premium-shell text-foreground selection:bg-primary/30 overflow-x-hidden w-full relative transition-colors duration-500">
      <JsonLd
        data={[
          webPageJsonLd({
            name: "NihongoRoute",
            description: metadata.description as string,
            path: "/",
          }),
          learningResourceJsonLd({
            name: "NihongoRoute",
            description: metadata.description as string,
            path: "/",
            educationalLevel: "JLPT N5-N1",
            teaches: [
              "Hiragana",
              "Katakana",
              "Kosakata bahasa Jepang",
              "Kanji",
              "Tata bahasa Jepang",
              "Simulasi JLPT",
            ],
          }),
        ]}
      />
      <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(circle_at_18%_8%,rgb(var(--brand-cyan-rgb)_/_0.16),transparent_34rem),radial-gradient(circle_at_82%_12%,rgb(var(--brand-violet-rgb)_/_0.11),transparent_32rem)]" />
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.12] bg-[linear-gradient(90deg,rgb(var(--brand-cyan-rgb)_/_0.08)_1px,transparent_1px),linear-gradient(rgb(var(--brand-violet-rgb)_/_0.06)_1px,transparent_1px)] bg-[size:72px_72px]" />

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 pt-10 md:pt-14 pb-14">
        {/* SEKSI HERO UTAMA */}
        <Hero />

        {/* KISI FITUR UNGGULAN */}
        <FeatureGrid />

        {/* BANNER KEPERCAYAAN */}
        <TrustBanner />

        {/* KAKI HALAMAN */}
        <LandingFooter />
      </div>
    </main>
  );
}
