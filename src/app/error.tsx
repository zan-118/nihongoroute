/**
 * @file error.tsx
 * @description Application Root Error Boundary component for catching runtime exceptions in NihongoRoute.
 */

"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlarmWarning } from "@/components/ui/icons";

/**
 * Props for RootError component.
 */
interface RootErrorProps {
 /** Uncaught runtime error object. */
 error: Error & { digest?: string };
 /** Callback function to trigger route re-render. */
 reset: () => void;
}

/**
 * Root error boundary component.
 * Catches uncaught runtime errors at application root and provides recovery UI.
 * 
 * @param props - Component properties.
 * @returns Error boundary fallback interface.
 */
export default function RootError({
 error,
 reset,
}: RootErrorProps) {
 useEffect(() => {
 // Log error details for debugging and monitoring
 console.error("Kesalahan Tingkat Akar (Root Level Error):", error);
 }, [error]);

 return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6 text-center relative overflow-hidden transition-colors duration-300">
      <div className="z-10 max-w-md w-full bg-card border border-border rounded-2xl p-8 md:p-12 shadow-sm relative overflow-hidden">
        <div className="size-16 mx-auto bg-destructive/10 rounded-xl flex items-center justify-center mb-6 border border-destructive/20">
          <AlarmWarning className="text-destructive" size={32} />
        </div>
        
        <h1 className="text-2xl md:text-3xl text-foreground tracking-tight mb-3 font-japanese font-bold">
          Waduh, Koneksinya Putus
        </h1>
        
        <p className="text-xs md:text-sm text-muted-foreground mb-8 leading-relaxed font-normal">
          Kayaknya koneksi ke server lagi bermasalah. Cek koneksi internetmu, atau coba lagi sebentar lagi ya.
        </p>

        <Button
          onClick={() => reset()}
          className="w-full h-12 bg-destructive hover:bg-destructive/90 text-destructive-foreground font-bold uppercase tracking-wider text-xs rounded-xl transition-all duration-300 active:scale-[0.98]"
        >
          Coba Lagi
        </Button>
 
        <p className="mt-8 text-[10px] text-muted-foreground/60 uppercase tracking-wider font-mono font-semibold">
          Error Code: {error.digest || "500_SYSTEM_FAILURE"}
        </p>
 </div>
 </div>
 );
}