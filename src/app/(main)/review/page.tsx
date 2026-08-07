/**
 * @file page.tsx
 * @description Entry point for Review Hub with Suspense boundary.
 * @module ReviewPageEntry
 */

// ==========================================
// Import & Dependencies
// ==========================================
import { Suspense } from "react";
import { ReviewView } from "@/features/review/ReviewView";
import { Restart } from "@/components/ui/icons";
import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

import { ROUTES } from "@/lib/core/routes";
// ==========================================
// Metadata Configuration
// ==========================================
/**
 * Page metadata configuration.
 * Disable search indexing for review session page.
 */
export const metadata: Metadata = {
 ...createPageMetadata({
 title: "Review SRS | NihongoRoute",
 description: "Sesi ulangan spasi repetisi (SRS) untuk memperkuat hafalan kosakata dan kanji bahasa Jepang.",
 path:ROUTES.REVIEW,
 noIndex: true,
 }),
};

// ======================
// EKSEKUSI UTAMA
// ======================
/**
 * Review page entry component.
 * Wrap ReviewClient in Suspense boundary to handle client-side loading.
 * 
 * @returns React element containing Suspense-wrapped ReviewClient.
 */
export default function ReviewPage() {
 return (
 <Suspense fallback={
 /* Render loading spinner while client bundle loads */
 <div className="flex-1 flex flex-col items-center justify-center px-4">
 <Restart className="text-primary animate-spin mb-4" size={32} />
 <p className="text-muted-foreground font-mono uppercase tracking-widest text-xs animate-pulse font-bold">
 Menyiapkan antarmuka…
 </p>
 </div>
 }>
 <ReviewView />
 </Suspense>
 );
}