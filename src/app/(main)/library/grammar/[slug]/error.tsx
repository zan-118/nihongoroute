/**
 * @file error.tsx
 * @description Halaman penanganan kesalahan runtime pada rute detail tata bahasa (Grammar Error Boundary).
 */

"use client";

// ======================
// IMPOR
// ======================
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Alert, Refresh } from "@/components/ui/icons";

// ======================
// EKSEKUSI UTAMA
// ======================

/**
 * Error boundary component for grammar detail route.
 * Handles runtime crashes during Portable Text rendering or audio playback.
 * 
 * @param props - Component properties.
 * @param props.error - Runtime error object with optional digest.
 * @param props.reset - Callback function to retry rendering.
 * @returns React element representing the error state UI.
 */
export default function GrammarError({
 error,
 reset,
}: {
 error: Error & { digest?: string };
 reset: () => void;
}) {
 useEffect(() => {
 // Log error to console for debugging purposes
 console.error("Granular Error [Grammar Detail]:", error);
 }, [error]);

 return (
 <main className="w-full px-4 md:px-8 lg:px-12 pt-16 flex justify-center items-start min-h-[50vh]">
 {/* Wrapper agar sejalan dengan max-w-4xl, tapi error box-nya dibatasi max-w-xl agar tidak kepanjangan */}
 <div className="max-w-4xl mx-auto w-full flex justify-center">
 <div className="max-w-xl w-full p-8 md:p-10 bg-destructive/5 dark:bg-destructive/10 border border-destructive/20 rounded-[2rem] md:rounded-[3rem] text-center space-y-6 relative overflow-hidden group shadow-sm">
 
 {/* Elemen Dekoratif Jepang/Alert di Latar Belakang */}
 <div className="absolute top-0 right-0 p-6 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-700">
 <Alert size={150} />
 </div>

 {/* Ikon Utama */}
 <div className="flex justify-center mb-2 relative z-10">
 <div className="p-4 bg-destructive/10 rounded-lg text-destructive neo-inset shadow-none">
 <Alert size={32} strokeWidth={2} />
 </div>
 </div>
 
 {/* Teks Jepang */}
 <div className="space-y-2 relative z-10">
 <h2 className="text-2xl md:text-3xl text-destructive font-japanese tracking-tight">
 申し訳ありません
 </h2>
 <p className="text-xs md:text-sm font-bold text-destructive/70 uppercase tracking-widest">
 (Moushiwake arimasen)
 </p>
 </div>

 {/* Deskripsi Error */}
 <p className="text-sm md:text-base text-muted-foreground font-medium relative z-10 leading-relaxed">
 Maaf ya, ada kendala pas memuat materi. Coba pastikan koneksi internetmu stabil, terus coba muat ulang bagian ini.
 </p>

 {/* Tombol Interaksi */}
 <div className="pt-6 relative z-10">
 <Button 
 onClick={() => reset()} 
 variant="default" 
 className="rounded-lg px-8 h-12 shadow-sm font-bold tracking-widest uppercase text-xs md:text-sm bg-destructive hover:bg-destructive/90 text-destructive-foreground"
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