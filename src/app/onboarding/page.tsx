/**
 * @file page.tsx
 * @description Halaman onboarding awal pengguna baru NihongoRoute. Entry point untuk OnboardingClient.
 */

// ======================
// IMPOR
// ======================
import type { Metadata } from "next";
import OnboardingClient from "./OnboardingClient";

// ======================
// KONFIGURASI METADATA
// ======================
export const metadata: Metadata = {
  title: "Selamat Datang | NihongoRoute",
  description: "Selamat datang di NihongoRoute! Tentukan jalur belajar dan target JLPT Anda agar kami dapat merekomendasikan kurikulum terbaik.",
};

// ======================
// EKSEKUSI UTAMA
// ======================
export default function OnboardingPage() {
  return <OnboardingClient />;
}
