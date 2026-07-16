"use client";

/**
 * @file VercelAnalytics.tsx
 * @description Komponen client untuk memuat Vercel Analytics dan Speed Insights secara dinamis.
 * Menonaktifkan SSR (ssr: false) untuk menghindari perlambatan pemuatan bundel awal dan hidrasi.
 */

import dynamic from "next/dynamic";

const Analytics = dynamic(
  () => import("@vercel/analytics/react").then((m) => m.Analytics),
  { ssr: false }
);

const SpeedInsights = dynamic(
  () => import("@vercel/speed-insights/next").then((m) => m.SpeedInsights),
  { ssr: false }
);

/**
 * VercelAnalytics component.
 * Loads Vercel production analytics after hydration.
 * 
 * @returns JSX element rendering dynamic analytics.
 */
export default function VercelAnalytics() {
  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  );
}
