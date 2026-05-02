"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

/**
 * @file error.tsx
 * @description React Error Boundary untuk rute sesi ujian. 
 * Menangani runtime errors yang mungkin terjadi selama eksekusi client-side logic di MockExamEngine.
 * @module ExamError
 */

export default function ExamError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Logging error untuk keperluan debugging atau analytics
    console.error("Critical Exam Session Error:", error);
  }, [error]);

  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center px-6 text-center relative overflow-hidden py-12">
      {/* Efek Latar Belakang Cyber Glow */}
      <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-red-500/10 blur-[120px] rounded-full pointer-events-none" />
      
      <Card className="p-10 md:p-14 border-red-500/20 max-w-lg w-full relative z-10 my-auto neo-card rounded-[2rem] bg-cyber-surface">
        {/* Ikon Peringatan Neumorphic */}
        <div className="w-20 h-20 mx-auto neo-inset text-red-500 flex items-center justify-center rounded-full mb-8 shadow-inner bg-black/20">
          <span className="text-4xl block">⚠️</span>
        </div>
        
        <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight mb-4">
          Gagal Memuat Ujian
        </h1>
        
        <p className="text-slate-300 mb-8 text-sm leading-relaxed">
          Mohon maaf, terjadi kesalahan teknis saat memproses sesi ujian ini. 
          Ini mungkin disebabkan oleh data konten yang tidak lengkap atau gangguan koneksi.
        </p>

        {/* Debug Info (Hanya di Development) */}
        {process.env.NODE_ENV === "development" && (
          <div className="mb-8 p-4 bg-black/40 rounded-lg border border-red-500/20 text-left overflow-auto max-h-32">
            <code className="text-[10px] text-red-400 font-mono break-all">
              [DEV LOG]: {error.message}
            </code>
          </div>
        )}

        {/* Kontrol Navigasi */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => reset()}
            className="bg-red-500 hover:bg-red-600 text-white font-black uppercase tracking-widest h-auto py-4 px-8 rounded-xl text-[10px] transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)]"
          >
            Coba Segarkan
          </Button>
          
          <Button
            asChild
            variant="ghost"
            className="bg-[#0a0c10] neo-inset border border-white/5 hover:border-white/20 text-slate-200 hover:text-white font-black uppercase tracking-widest h-auto py-4 px-8 rounded-xl text-[10px] transition-all"
          >
            <Link href="/courses">
              Batal & Kembali
            </Link>
          </Button>
        </div>
      </Card>
      
      {/* Branding Footer Sederhana */}
      <p className="mt-12 text-slate-500 text-[10px] uppercase tracking-[0.2em] font-bold">
        NihongoRoute System Protection
      </p>
    </div>
  );
}
