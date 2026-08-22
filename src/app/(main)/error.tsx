/**
 * @file app/(main)/error.tsx
 * @description Halaman penanganan kesalahan runtime tingkat grup rute (Route Group Error Boundary) NihongoRoute.
 */

"use client";

// IMPOR

import { useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, Restart, Dashboard } from "@/components/ui/icons";

// EKSEKUSI UTAMA

/**
 * Error boundary component for main route group.
 * Handles runtime errors. Displays error details and recovery actions.
 * 
 * @param props Component properties.
 * @param props.error Runtime error object.
 * @param props.reset Function to retry rendering.
 */
export default function MainError({
 error,
 reset,
}: {
 error: Error & { digest?: string };
 reset: () => void;
}) {
 // Log error to console for debugging.
 useEffect(() => {
 console.error("Kesalahan Aplikasi Utama (Main Application Error):", error);
 }, [error]);

 return (
 <div className="w-full min-h-[85vh] flex flex-col items-center justify-center px-4 py-12 text-center relative overflow-hidden transition-colors duration-300">
 {/* Dekorasi Latar Belakang & Kisi Neural */}
 <div className="grid-overlay" />
 <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
 <div className="size-[550px] bg-destructive/10 rounded-full blur-[130px] opacity-35 absolute -top-12 -left-12" />
 <div className="size-[450px] bg-warning/10 rounded-full blur-[100px] opacity-25 absolute -bottom-10 -right-10" />
 </div>
 
 <Card className="p-8 md:p-12 border border-border/80 max-w-lg w-full relative z-10 rounded-[2.5rem] bg-card/85 shadow-sm hover:shadow-sm transition-all duration-500 glass">
 {/* Kilau Sudut Atas */}
 <div className="absolute top-0 right-0 size-24 blur-md rounded-tr-[2.5rem] pointer-events-none" />

 <div className="size-20 mx-auto bg-destructive/10 rounded-lg flex items-center justify-center mb-6 border border-destructive/20 shadow-sm animate-pulse">
 <Alert className="text-destructive" size={36} />
 </div>
 
 <h1 className="text-2xl md:text-3xl text-foreground uppercase tracking-tight mb-3 leading-tight font-japanese">
 Oops, Ada yang Nggak Beres
 </h1>
 
 <p className="text-xs md:text-sm text-muted-foreground mb-8 leading-relaxed font-medium">
 Sepertinya ada masalah waktu muat data. Coba refresh halaman atau balik ke dashboard dulu ya.
 </p>

 {/* Show error details only in development mode. */}
 {process.env.NODE_ENV === "development" && (
 <div className="mb-8 p-5 bg-muted/60 rounded-lg border border-destructive/20 text-left overflow-auto max-h-36 ">
 <p className="text-[10px] uppercase tracking-[0.2em] text-destructive font-black mb-2">Error Log Console:</p>
 <code className="text-xs text-destructive/90 font-mono break-all font-semibold italic">
 {error.message || "Unknown error occurred"}
 </code>
 </div>
 )}

 <div className="flex flex-col sm:flex-row gap-3 justify-center">
 {/* Trigger reset callback to retry rendering. */}
 <Button
 onClick={() => reset()}
 className="rounded-xl h-12 px-6 bg-destructive hover:bg-destructive/90 text-destructive-foreground font-black uppercase tracking-widest text-xs duration-300 shadow-sm active:scale-[0.98] w-full sm:w-auto"
 >
 <Restart size={14} className="mr-2 animate-spin-slow" /> Coba Lagi
 </Button>
 
 {/* Navigation fallback to dashboard. */}
 <Button
 asChild
 variant="outline"
 className="rounded-xl h-12 px-6 border border-border/80 hover:bg-muted text-muted-foreground hover:text-foreground font-black uppercase tracking-widest text-xs duration-300 w-full sm:w-auto"
 >
 <Link href="/dashboard">
 <Dashboard size={14} className="mr-2" /> Ke Dashboard
 </Link>
 </Button>
 </div>
 </Card>
 
 <p className="mt-8 text-muted-foreground/30 text-[10px] font-black uppercase tracking-[0.3em] relative z-10 select-none">
 Circuit Breaker Status: Active
 </p>
 </div>
 );
}