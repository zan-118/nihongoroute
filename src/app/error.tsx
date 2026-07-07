/**
 * @file error.tsx
 * @description Halaman penanganan kesalahan runtime tingkat akar (Root Error Boundary) NihongoRoute.
 */

"use client";

// ======================
// IMPOR
// ======================
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertOctagon } from "lucide-react";

// ======================
// EKSEKUSI UTAMA
// ======================

/**
 * Komponen pembatas kesalahan tingkat akar (Root Error Boundary) aplikasi.
 * Menangani crash kritis pada rute utama dan menyediakan opsi pemulihan.
 * 
 * @param {Object} props Properti komponen.
 * @param {Error & { digest?: string }} props.error Objek kesalahan runtime yang ditangkap.
 * @param {function} props.reset Fungsi callback untuk memicu pemuatan ulang halaman.
 * @returns {JSX.Element} Antarmuka penanganan kesalahan kritis.
 */
export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Kesalahan Tingkat Akar (Root Level Error):", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center premium-shell p-6 text-center relative overflow-hidden transition-colors duration-300">
      {/* Dekorasi Latar Belakang & Kisi Neural */}
      <div className="neural-grid" />
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
        <div className="size-[500px] bg-destructive/10 rounded-full blur-[120px] opacity-35 absolute -top-12 -left-12" />
        <div className="size-[450px] bg-warning/10 rounded-full blur-[100px] opacity-25 absolute -bottom-10 -right-10" />
      </div>

      <div className="z-10 max-w-md w-full glass border border-border/85 rounded-[2rem] p-8 md:p-12 shadow-[0_20px_50px_rgba(var(--foreground-rgb),0.35)] relative overflow-hidden">
        <div className="size-20 mx-auto bg-destructive/10 rounded-lg flex items-center justify-center mb-6 border border-destructive/20 shadow-[0_0_20px_rgb(var(--destructive-rgb)/0.15)] animate-pulse">
          <AlertOctagon className="text-destructive" size={36} />
        </div>
        
        <h1 className="text-2xl md:text-3xl text-foreground uppercase tracking-tight mb-3 font-japanese">
          Waduh, Koneksinya Putus
        </h1>
        
        <p className="text-xs md:text-sm text-muted-foreground mb-8 leading-relaxed font-medium">
          Kayaknya koneksi ke server lagi bermasalah. Cek koneksi internetmu, atau coba lagi sebentar lagi ya.
        </p>

        <Button
          onClick={() => reset()}
          className="w-full h-12 bg-destructive hover:bg-destructive/90 text-destructive-foreground font-black uppercase tracking-widest text-xs rounded-xl duration-300 shadow-[0_0_15px_rgb(var(--destructive-rgb)/0.15)] hover:shadow-[0_0_25px_rgb(var(--destructive-rgb)/0.3)] active:scale-[0.98]"
        >
          Coba Lagi
        </Button>
        
        <p className="mt-8 text-[10px] text-muted-foreground/30 uppercase tracking-[0.2em] font-semibold">
          Error Code: {error.digest || "500_SYSTEM_FAILURE"}
        </p>
      </div>
    </div>
  );
}
