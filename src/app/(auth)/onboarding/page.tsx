/**
 * @file page.tsx
 * @description Halaman onboarding awal pengguna baru NihongoRoute. Entry point untuk OnboardingClient.
 */

// ======================
// IMPOR
// ======================
import type { Metadata } from "next";
import OnboardingClient from "./OnboardingClient";
import { createPageMetadata } from "@/lib/seo";

// ======================
// KONFIGURASI METADATA
// ======================
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
export default function OnboardingPage() {
  return <OnboardingClient />;
}
