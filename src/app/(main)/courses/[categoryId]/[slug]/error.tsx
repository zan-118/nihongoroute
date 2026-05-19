"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCcw } from "lucide-react";

export default function CourseDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error secara background agar mudah di-debug
    console.error("Granular Error [Course Detail]:", error);
  }, [error]);

  return (
    <main className="w-full px-4 md:px-8 lg:px-12 pt-16 flex justify-center items-start min-h-[50vh]">
      {/* Wrapper agar sejalan dengan max-w-4xl, tapi error box-nya dibatasi max-w-xl agar tidak kepanjangan */}
      <div className="max-w-4xl mx-auto w-full flex justify-center">
        <div className="max-w-xl w-full p-8 md:p-10 bg-destructive/5 dark:bg-destructive/10 border border-destructive/20 rounded-[2rem] md:rounded-[3rem] text-center space-y-6 relative overflow-hidden group shadow-sm">
          
          {/* Elemen Dekoratif Jepang/Alert di Latar Belakang */}
          <div className="absolute top-0 right-0 p-6 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-700">
            <AlertTriangle size={150} />
          </div>

          {/* Ikon Utama */}
          <div className="flex justify-center mb-2 relative z-10">
            <div className="p-4 bg-destructive/10 rounded-2xl text-destructive neo-inset shadow-none">
              <AlertTriangle size={32} strokeWidth={2} />
            </div>
          </div>
          
          {/* Teks Jepang */}
          <div className="space-y-2 relative z-10">
            <h2 className="text-2xl md:text-3xl font-black text-destructive font-japanese tracking-tight">
              申し訳ありません
            </h2>
            <p className="text-xs md:text-sm font-bold text-destructive/70 uppercase tracking-widest">
              (Moushiwake arimasen)
            </p>
          </div>

          {/* Deskripsi Error */}
          <p className="text-sm md:text-base text-muted-foreground font-medium relative z-10 leading-relaxed">
            Mohon maaf, terjadi kendala saat memuat materi kursus. Pastikan koneksi Anda stabil atau coba muat ulang bagian ini.
          </p>

          {/* Tombol Interaksi */}
          <div className="pt-6 relative z-10">
            <Button 
              onClick={() => reset()} 
              variant="default" 
              className="rounded-2xl px-8 h-12 shadow-sm font-bold tracking-widest uppercase text-xs md:text-sm bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              <RefreshCcw size={16} className="mr-2" />
              Coba Lagi
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
