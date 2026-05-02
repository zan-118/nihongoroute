"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

/**
 * @file error.tsx
 * @description Root Error Boundary.
 */

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Root Level Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6 text-center transition-colors duration-300">
      <div className="max-w-md">
        <div className="w-20 h-20 mx-auto bg-destructive/10 rounded-full flex items-center justify-center mb-8 border border-destructive/20 shadow-lg">
          <span className="text-3xl">📡</span>
        </div>
        
        <h1 className="text-2xl font-black text-foreground uppercase tracking-tight mb-4">
          Koneksi Terputus
        </h1>
        
        <p className="text-muted-foreground text-sm mb-10 leading-relaxed">
          Gagal menyambungkan ke server utama. Pastikan koneksi internet Anda stabil dan coba lagi dalam beberapa saat.
        </p>

        <Button
          onClick={() => reset()}
          className="bg-primary text-white dark:text-black hover:opacity-90 font-black uppercase tracking-widest px-10 py-4 rounded-xl transition-all shadow-lg border-none"
        >
          Coba Hubungkan Ulang
        </Button>
        
        <p className="mt-12 text-[9px] text-muted-foreground/30 uppercase tracking-widest">
          Network Status: Error Code {error.digest || "500_SYSTEM_FAILURE"}
        </p>
      </div>
    </div>
  );
}
