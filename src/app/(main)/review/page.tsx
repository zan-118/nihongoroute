/**
 * @file app/(main)/review/page.tsx
 * @description Entry point untuk Review Hub dengan Suspense boundary.
 * @module ReviewPageEntry
 */

// ======================
// IMPOR
// ======================
import { Suspense } from "react";
import { ReviewClient } from "@/app/(main)/review/ReviewClient";
import { RotateCw } from "lucide-react";
import type { Metadata } from "next";

// ======================
// KONFIGURASI METADATA
// ======================
export const metadata: Metadata = {
  title: "Review SRS | NihongoRoute",
  description: "Sesi ulangan spasi repetisi (SRS) untuk memperkuat hafalan kosakata dan kanji bahasa Jepang.",
};

// ======================
// EKSEKUSI UTAMA
// ======================
export default function ReviewPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <RotateCw className="text-primary animate-spin mb-4" size={32} />
        <p className="text-muted-foreground font-mono uppercase tracking-widest text-xs animate-pulse font-bold">
          Menyiapkan antarmuka…
        </p>
      </div>
    }>
      <ReviewClient />
    </Suspense>
  );
}
