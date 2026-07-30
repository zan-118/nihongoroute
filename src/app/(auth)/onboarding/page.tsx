/**
 * @file page.tsx
 * @description Halaman onboarding awal pengguna baru NihongoRoute. Entry point untuk OnboardingClient.
 */

// ======================
// IMPOR
// ======================
import type { Metadata } from "next";
import OnboardingView from "@/features/auth/OnboardingView";
import { createPageMetadata } from "@/lib/seo";

// ======================
// KONFIGURASI METADATA
// ======================
/**
 * Page metadata. Disable search engine indexing for onboarding.
 */
export const metadata: Metadata = {
  ...createPageMetadata({
    title: "Selamat Datang | NihongoRoute",
    description: "Tentukan jalur belajar dan target JLPT Anda di NihongoRoute.",
    path: "/onboarding",
    noIndex: true,
  }),
};

// ======================
// EKSEKUSI UTAMA
// ======================
/**
 * Onboarding page entry point. Renders client onboarding flow.
 */
export default function OnboardingPage() {
  // Render client component wrapper
  return <OnboardingView />;
}