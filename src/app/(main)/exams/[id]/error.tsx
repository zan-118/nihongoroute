/**
 * @file error.tsx
 * @description Runtime error boundary component for exam simulation sessions.
 */

"use client";

// ======================
// IMPOR
// ======================
import { useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/icons";

// ======================
// EKSEKUSI UTAMA
// ======================

/**
 * Props interface for the ExamError component.
 */
interface ExamErrorProps {
 /** The error object thrown by the child components. */
 error: Error & { digest?: string };
 /** Callback function to attempt reloading/re-rendering. */
 reset: () => void;
}

/**
 * ExamError component handles runtime crashes during exam sessions.
 * Displays error details in development and provides retry/navigation actions.
 *
 * @param props - Component properties.
 * @returns React element rendering the error state.
 */
export default function ExamError({
 error,
 reset,
}: ExamErrorProps) {
 useEffect(() => {
 // Log critical error to console for debugging and analytics tracking
 console.error("Critical Exam Session Error:", error);
 }, [error]);

 return (
 <div className="w-full flex-1 flex flex-col items-center justify-center px-6 text-center relative overflow-hidden py-12">
 {/* Cyber glow background effect */}
 <div className="absolute top-0 left-1/4 size-[300px] bg-destructive/10 blur-[55px] rounded-full pointer-events-none ambient-glow will-change-transform" />

 <Card className="p-10 md:p-14 border-destructive/30 max-w-lg w-full relative z-10 my-auto neo-card rounded-[2rem] bg-card">
 {/* Neumorphic warning icon container */}
 <div className="size-20 mx-auto neo-inset text-destructive flex items-center justify-center rounded-full mb-8 shadow-inner bg-destructive/10">
 <Alert size={36} className="text-destructive animate-pulse" />
 </div>

 <h1 className="text-2xl md:text-3xl text-foreground uppercase tracking-tight mb-4">
 Gagal Memuat Ujian
 </h1>

 <p className="text-muted-foreground mb-8 text-sm leading-relaxed">
 Maaf ya, ada masalah teknis waktu menyiapkan sesi ujian ini.
 Mungkin karena datanya kurang lengkap atau internetmu terganggu.
 </p>

 {/* Render technical error details only in development environment */}
 {process.env.NODE_ENV === "development" && (
 <div className="mb-8 p-4 bg-muted rounded-lg border border-destructive/20 text-left overflow-auto max-h-32">
 <code className="text-[10px] text-destructive font-mono break-all">
 [DEV LOG]: {error.message}
 </code>
 </div>
 )}

 {/* Action controls for retrying or canceling the session */}
 <div className="flex flex-col sm:flex-row gap-4 justify-center">
 <Button
 onClick={() => reset()}
 className="bg-destructive hover:bg-destructive text-destructive-foreground font-black uppercase tracking-widest h-auto py-4 px-8 rounded-xl text-[10px] transition-all shadow-md"
 >
 Coba Segarkan
 </Button>

 <Button
 asChild
 variant="ghost"
 className="bg-card neo-inset border border-border hover:border-primary/50 text-foreground hover:text-primary font-black uppercase tracking-widest h-auto py-4 px-8 rounded-xl text-[10px] transition-all"
 >
 <Link href="/courses">
 Batal & Kembali
 </Link>
 </Button>
 </div>
 </Card>

 {/* Footer branding */}
 <p className="mt-12 text-muted-foreground text-[10px] uppercase tracking-[0.2em] font-bold">
 NihongoRoute System Protection
 </p>
 </div>
 );
}