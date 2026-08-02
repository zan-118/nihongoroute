/**
 * @file page.tsx
 * @description Landing page route for NihongoRoute. Renders static Hero, FeatureGrid, TrustBanner, and lazy-loaded InteractivePlayground.
 */

import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { JsonLd } from "@/components/seo/JsonLd";
import {
 createPageMetadata,
 learningResourceJsonLd,
 webPageJsonLd,
} from "@/lib/seo";

// Server Components (rendered purely statically to HTML for zero JS overhead on initial render)
import { Hero } from "@/features/landing/Hero";
import { FeatureGrid } from "@/features/landing/FeatureGrid";
import { TrustBanner } from "@/features/landing/TrustBanner";
import { LandingFooter } from "@/features/landing/LandingFooter";

// Lazy-loaded interactive client playground
const InteractivePlayground = dynamic(
 () => import("@/features/landing/InteractivePlayground").then((m) => m.InteractivePlayground),
 { loading: () => <div className="w-full h-[450px] rounded-2xl bg-card/20 animate-pulse mb-[120px]" /> }
);

/**
 * Metadata configuration for the landing page.
 * Optimizes SEO with custom title, description, and keywords.
 */
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

/**
 * LandingPage component.
 * Pure Server Component for maximum SSG performance and lightning-fast LCP.
 * Renders the main landing page with SEO JSON-LD schemas, hero section, features, and footer.
 * 
 * @returns {JSX.Element} The rendered landing page.
 */
export default function LandingPage() {
 return (
 <main className="bg-background text-foreground selection:bg-primary/30 overflow-x-hidden w-full relative transition-colors duration-500">
 {/* Inject JSON-LD structured data for search engines */}
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
 {/* Decorative background radial gradients for desktop */}
 <div className="hidden md:block fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(circle_at_18%_8%,hsl(var(--primary)/_/_0.16),transparent_34rem),radial-gradient(circle_at_82%_12%,hsl(var(--primary)/_/_0.11),transparent_32rem)]" />
 {/* Decorative background grid pattern for desktop */}
 <div className="hidden md:block fixed inset-0 pointer-events-none z-0 opacity-[0.12] bg-[linear-gradient(90deg,hsl(var(--primary)/_/_0.08)_1px,transparent_1px),linear-gradient(hsl(var(--primary)/_/_0.06)_1px,transparent_1px)] bg-[size:72px_72px]" />

 <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 pt-10 md:pt-14 pb-4">
 {/* SEKSI HERO UTAMA (Pure SSG Server Component) */}
 <Hero />

 {/* PLAYGROUND INTERAKTIF KONVERSI FURIGANA (Code-split Client Component) */}
 <InteractivePlayground />

 {/* KISI FITUR UNGGULAN (Pure SSG Server Component) */}
 <FeatureGrid />

 {/* BANNER KEPERCAYAAN (Pure SSG Server Component) */}
 <TrustBanner />
 </div>

 {/* KAKI HALAMAN (Pure SSG Server Component) */}
 <LandingFooter />
 </main>
 );
}