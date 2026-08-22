/**
 * @file error.tsx
 * @description Halaman penanganan kesalahan runtime pada rute detail pelajaran kursus (Lesson Error Boundary).
 */

"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Alert, Refresh } from "@/components/ui/icons";

/**
 * Error boundary component for course detail page.
 * Handles runtime crashes during lesson loading.
 */
export default function CourseDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console for debugging.
    console.error("Granular Error [Course Detail]:", error);
  }, [error]);

  return (
    <main className="w-full px-4 md:px-8 lg:px-12 pt-16 flex justify-center items-start min-h-[50vh]">
      <div className="max-w-4xl mx-auto w-full flex justify-center">
        <div className="max-w-xl w-full p-8 md:p-10 bg-destructive/5 dark:bg-destructive/10 border border-destructive/20 rounded-[2rem] md:rounded-[3rem] text-center space-y-6 relative overflow-hidden group shadow-sm">
          
          <div className="absolute top-0 right-0 p-6 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-700">
            <Alert size={150} />
          </div>

          <div className="flex justify-center mb-2 relative z-10">
            <div className="p-4 bg-destructive/10 rounded-lg text-destructive neo-inset shadow-none">
              <Alert size={32} strokeWidth={2} />
            </div>
          </div>
          
          <div className="space-y-2 relative z-10">
            <h2 className="text-2xl md:text-3xl text-destructive font-japanese tracking-tight">
              申し訳ありません
            </h2>
            <p className="text-xs md:text-sm font-bold text-destructive/70 uppercase tracking-wider">
              (Moushiwake arimasen)
            </p>
          </div>

          <p className="text-sm md:text-base text-muted-foreground font-medium relative z-10 leading-relaxed">
            Mohon maaf, terjadi kendala saat memuat materi kursus. Pastikan koneksi Anda stabil atau coba muat ulang bagian ini.
          </p>

          <div className="pt-6 relative z-10">
            <Button 
              onClick={() => reset()} 
              variant="default" 
              className="rounded-lg px-8 h-12 shadow-sm font-bold tracking-wider uppercase text-xs md:text-sm bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              <Refresh size={16} className="mr-2" />
              Coba Lagi
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}