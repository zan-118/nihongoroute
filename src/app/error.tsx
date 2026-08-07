/**
 * @file error.tsx
 * @description Application Root Error Boundary component for catching runtime exceptions in NihongoRoute.
 */

"use client";

// ==========================================
// Import & Dependencies
// ==========================================
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlarmWarning } from "@/components/ui/icons";

// ==========================================
// Main Component
// ==========================================

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
 {/* Dekorasi Latar Belakang & Kisi Neural */}
 <div className="grid-overlay" />
 <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
 <div className="size-[500px] bg-destructive/10 rounded-full blur-[120px] opacity-35 absolute -top-12 -left-12" />
 <div className="size-[450px] bg-warning/10 rounded-full blur-[100px] opacity-25 absolute -bottom-10 -right-10" />
 </div>

 <div className="z-10 max-w-md w-full glass border border-border/85 rounded-[2rem] p-8 md:p-12 shadow-[0_20px_50px_hsl(var(--foreground)/0.35)] relative overflow-hidden">
 <div className="size-20 mx-auto bg-destructive/10 rounded-lg flex items-center justify-center mb-6 border border-destructive/20 shadow-[0_0_20px_hsl(var(--destructive)/0.15)] animate-pulse">
 <AlarmWarning className="text-destructive" size={36} />
 </div>
 
 <h1 className="text-2xl md:text-3xl text-foreground uppercase tracking-tight mb-3 font-japanese">
 Waduh, Koneksinya Putus
 </h1>
 
 <p className="text-xs md:text-sm text-muted-foreground mb-8 leading-relaxed font-medium">
 Kayaknya koneksi ke server lagi bermasalah. Cek koneksi internetmu, atau coba lagi sebentar lagi ya.
 </p>

 <Button
 onClick={() => reset()}
 className="w-full h-12 bg-destructive hover:bg-destructive/90 text-destructive-foreground font-black uppercase tracking-widest text-xs rounded-xl duration-300 shadow-[0_0_15px_hsl(var(--destructive)/0.15)] hover:shadow-[0_0_25px_hsl(var(--destructive)/0.3)] active:scale-[0.98]"
 >
 Coba Lagi
 </Button>
 
 <p className="mt-8 text-[10px] text-muted-foreground/30 uppercase tracking-[0.2em] font-semibold">
 {/* Display unique error hash if present, otherwise show generic code */}
 Error Code: {error.digest || "500_SYSTEM_FAILURE"}
 </p>
 </div>
 </div>
 );
}