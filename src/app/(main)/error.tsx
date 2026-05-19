"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, LayoutDashboard } from "lucide-react";

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
    <div className="w-full min-h-[85vh] flex flex-col items-center justify-center px-4 py-12 text-center relative overflow-hidden transition-colors duration-300">
      {/* Background Decor & Neural Grid */}
      <div className="neural-grid" />
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
        <div className="w-[550px] h-[550px] bg-destructive/10 rounded-full blur-[130px] opacity-35 absolute -top-12 -left-12" />
        <div className="w-[450px] h-[450px] bg-warning/10 rounded-full blur-[100px] opacity-25 absolute -bottom-10 -right-10" />
      </div>
      
      <Card className="p-8 md:p-12 border border-border/80 max-w-lg w-full relative z-10 rounded-[2.5rem] bg-card/85 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:shadow-[0_25px_60px_rgba(var(--destructive-rgb),0.1)] transition-all duration-500 glass">
        {/* Top corner glows */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-destructive/10 to-transparent blur-md rounded-tr-[2.5rem] pointer-events-none" />

        <div className="w-20 h-20 mx-auto bg-destructive/10 rounded-2xl flex items-center justify-center mb-6 border border-destructive/20 shadow-[0_0_20px_rgba(var(--destructive-rgb),0.15)] animate-pulse">
          <AlertTriangle className="text-destructive" size={36} />
        </div>
        
        <h1 className="text-2xl md:text-3xl font-black text-foreground uppercase tracking-tight mb-3 leading-tight font-japanese">
          Oops! Ada Kendala Teknis
        </h1>
        
        <p className="text-xs md:text-sm text-muted-foreground mb-8 leading-relaxed font-medium">
          Kami mendeteksi adanya masalah saat memuat data. Silakan coba memuat ulang halaman atau kembali ke dashboard utama Anda.
        </p>

        {process.env.NODE_ENV === "development" && (
          <div className="mb-8 p-5 bg-muted/60 rounded-2xl border border-destructive/20 text-left overflow-auto max-h-36 backdrop-blur-md">
            <p className="text-[10px] uppercase tracking-[0.2em] text-destructive font-black mb-2">Error Log Console:</p>
            <code className="text-xs text-destructive/90 font-mono break-all font-semibold italic">
              {error.message || "Unknown error occurred"}
            </code>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={() => reset()}
            className="rounded-xl h-12 px-6 bg-destructive hover:bg-destructive/90 text-destructive-foreground font-black uppercase tracking-widest text-xs duration-300 shadow-[0_0_15px_rgba(var(--destructive-rgb),0.15)] active:scale-[0.98] w-full sm:w-auto"
          >
            <RefreshCw size={14} className="mr-2 animate-spin-slow" /> Segarkan Sesi
          </Button>
          
          <Button
            asChild
            variant="outline"
            className="rounded-xl h-12 px-6 border border-border/80 hover:bg-muted text-muted-foreground hover:text-foreground font-black uppercase tracking-widest text-xs duration-300 w-full sm:w-auto"
          >
            <Link href="/dashboard">
              <LayoutDashboard size={14} className="mr-2" /> Ke Dashboard
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
