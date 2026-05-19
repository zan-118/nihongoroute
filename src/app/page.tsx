/**
 * @file page.tsx
 * @description Halaman landas (Landing Page) utama NihongoRoute.
 * Menyediakan informasi fitur, branding, dan akses cepat ke dashboard pembelajaran.
 * @module LandingPage
 */

"use client";

// Domain Components
import { Hero } from "@/components/features/landing/Hero";
import { FeatureGrid } from "@/components/features/landing/FeatureGrid";
import { TrustBanner } from "@/components/features/landing/TrustBanner";
import { LandingFooter } from "@/components/features/landing/LandingFooter";

export default function LandingPage() {
  return (
    <main className="bg-background text-foreground selection:bg-primary/30 overflow-x-hidden w-full relative transition-colors duration-500">
      {/* BACKGROUND AMBIENT - Premium SaaS Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-primary/[0.02] rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-[34px] md:px-[55px] pt-[89px] pb-[55px]">
        {/* HERO SECTION */}
        <Hero />

        {/* FEATURES GRID */}
        <FeatureGrid />

        {/* TRUST BANNER */}
        <TrustBanner />

        {/* FOOTER */}
        <LandingFooter />
      </div>
    </main>
  );
}
