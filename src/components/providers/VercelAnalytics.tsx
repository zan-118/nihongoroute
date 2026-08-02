"use client";

/**
 * @file VercelAnalytics.tsx
 * @description Komponen client untuk memuat Vercel Analytics dan Speed Insights secara dinamis.
 * Menonaktifkan SSR (ssr: false) untuk menghindari perlambatan pemuatan bundel awal dan hidrasi.
 */

import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

/**
 * VercelAnalytics component.
 * Loads Vercel production analytics statically to capture initial paint metrics (Web Vitals).
 * 
 * @returns JSX element rendering analytics.
 */
export default function VercelAnalytics() {
 return (
 <>
 <Analytics />
 <SpeedInsights />
 </>
 );
}
