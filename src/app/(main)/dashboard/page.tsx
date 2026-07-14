/**
 * @file page.tsx
 * @description Halaman dasbor (Dashboard) utama pengguna NihongoRoute.
 * Menampilkan ringkasan kemajuan, statistik XP, dan daftar sesi ulang SRS.
 */

// ======================
// IMPOR
// ======================
import DashboardClient from "./DashboardClient";
import type { Metadata } from "next";
import { getCourseCategories } from "@/actions/lessons.actions";
import { getRandomExpression } from "@/actions/expressions.actions";
import { createPageMetadata } from "@/lib/seo";

// ======================
// METADATA SEO
// ======================

/**
 * SEO metadata configuration for dashboard.
 */
export const metadata: Metadata = {
  ...createPageMetadata({
    title: "Dashboard | NihongoRoute",
    description: "Pantau progres belajar bahasa Jepangmu, kelola jadwal SRS, dan selesaikan quest harian.",
    path: "/dashboard",
    noIndex: true,
  }),
};

// ======================
// EKSEKUSI UTAMA
// ======================

/**
 * Dashboard page server component.
 * Fetch course categories and daily expression.
 * Render dashboard client view.
 */
export default async function DashboardPage() {
  // Fetch data in parallel to avoid waterfall delay.
  const [courseMetadata, expression] = await Promise.all([
    getCourseCategories(),
    getRandomExpression(),
  ]);

  return (
    <div className="w-full min-h-screen bg-transparent relative overflow-hidden pt-12 pb-24 px-4 md:px-8 transition-colors duration-300">
      {/* Efek Dekorasi Latar Belakang */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[500px] bg-primary/5 dark:bg-primary/10 blur-[120px] rounded-[100%] pointer-events-none opacity-50" />
      <div className="absolute bottom-0 right-0 size-[600px] bg-primary/5 blur-[150px] rounded-full pointer-events-none" />
      <div className="neural-grid" />

      <DashboardClient courseMetadata={courseMetadata} expression={expression} />
    </div>
  );
}