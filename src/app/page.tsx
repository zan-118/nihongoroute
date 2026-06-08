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

// Komponen Domain (seluruhnya "use client" secara internal)
import { Hero } from "@/components/features/landing/Hero";
import { FeatureGrid } from "@/components/features/landing/FeatureGrid";
import { TrustBanner } from "@/components/features/landing/TrustBanner";
import { LandingFooter } from "@/components/features/landing/LandingFooter";

export const metadata: Metadata = {
  title: "NihongoRoute - Belajar Bahasa Jepang Offline-First",
  description: "Platform belajar Bahasa Jepang premium dengan dukungan offline-first, metode Spaced Repetition System (SRS), kosakata, tata bahasa, dan simulasi ujian JLPT.",
};

export default function LandingPage() {
  return (
    <main className="premium-shell text-foreground selection:bg-primary/30 overflow-x-hidden w-full relative transition-colors duration-500">
      <div className="fixed inset-0 pointer-events-none z-0 bg-[linear-gradient(135deg,rgba(var(--primary-rgb),0.06),transparent_28%,rgba(var(--secondary-rgb),0.045)_72%,transparent)]" />
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.08] bg-[linear-gradient(90deg,rgba(var(--foreground-rgb),0.1)_1px,transparent_1px),linear-gradient(rgba(var(--foreground-rgb),0.1)_1px,transparent_1px)] bg-[size:72px_72px]" />

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
