"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

/**
 * @file error.tsx
 * @description Error Boundary global untuk Route Group (main).
 * Menangkap runtime errors di seluruh dashboard, kursus, dan perpustakaan.
 */

export default function MainError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Main Application Error:", error);
  }, [error]);

  return (
    <div className="w-full min-h-[80vh] flex flex-col items-center justify-center px-6 text-center relative overflow-hidden transition-colors duration-300">
      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-destructive/5 blur-[120px] rounded-full pointer-events-none" />
      
      <Card className="p-10 md:p-14 border border-destructive/20 max-w-lg w-full relative z-10 neo-card rounded-[2rem] bg-card shadow-2xl">
        <div className="w-20 h-20 mx-auto neo-inset text-destructive flex items-center justify-center rounded-full mb-8 shadow-inner bg-muted">
          <span className="text-4xl block">💫</span>
        </div>
        
        <h1 className="text-2xl md:text-3xl font-black text-foreground uppercase tracking-tight mb-4 leading-tight">
          Oops! Terjadi Gangguan
        </h1>
        
        <p className="text-muted-foreground mb-8 text-sm leading-relaxed">
          Kami mendeteksi adanya masalah teknis pada aplikasi. 
          Silakan coba segarkan halaman atau kembali ke dashboard.
        </p>

        {process.env.NODE_ENV === "development" && (
          <div className="mb-8 p-4 bg-muted/50 rounded-lg border border-destructive/20 text-left overflow-auto max-h-32">
            <p className="text-[9px] uppercase tracking-widest text-destructive font-bold mb-2">Error Log:</p>
            <code className="text-[10px] text-destructive/80 font-mono break-all italic">
              {error.message || "Unknown error occurred"}
            </code>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => reset()}
            className="bg-primary hover:bg-foreground text-white dark:text-black font-black uppercase tracking-widest h-auto py-4 px-8 rounded-xl text-[10px] transition-all shadow-lg border-none"
          >
            Segarkan Sesi
          </Button>
          
          <Button
            asChild
            variant="ghost"
            className="bg-muted border border-border hover:bg-background text-muted-foreground hover:text-foreground font-black uppercase tracking-widest h-auto py-4 px-8 rounded-xl text-[10px] transition-all"
          >
            <Link href="/dashboard">
              Ke Dashboard
            </Link>
          </Button>
        </div>
      </Card>
      
      <p className="mt-8 text-muted-foreground/30 text-[9px] uppercase tracking-[0.3em]">
        Status: Circuit Breaker Active
      </p>
    </div>
  );
}
