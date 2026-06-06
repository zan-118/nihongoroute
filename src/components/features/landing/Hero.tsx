"use client";

/**
 * @file Hero.tsx
 * @description Komponen Hero utama untuk Landing Page NihongoRoute.
 * Menampilkan slogan menarik, ajakan bertindak (CTA), serta elemen dekoratif interaktif
 * menggunakan Framer Motion dengan efek cyber-aesthetic modern.
 *
 * @package components/features/landing
 * @project NihongoRoute
 */

// ==========================================
// IMPOR
// ==========================================
import React from "react";
import Link from "next/link";
import { m } from "framer-motion";
import { Sparkles, ArrowRight, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// ==========================================
// KOMPONEN UTAMA
// ==========================================
/**
 * Komponen Hero
 * Area sambutan utama di bagian paling atas Landing Page.
 */
export function Hero() {
  return (
    <section className="min-h-[85vh] flex flex-col lg:flex-row items-center justify-between gap-[89px] mb-[89px] py-[55px]">
      
      {/* AREA KONTEN KIRI (TEXT & CTA) */}
      <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left max-w-2xl">
        <m.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-[34px]"
        >
          <Badge
            variant="outline"
            className="bg-primary/5 border-primary/10 px-4 py-2 rounded-full flex items-center gap-2 shadow-none backdrop-blur-xl transition-all hover:bg-primary/10"
          >
            <Sparkles size={12} className="text-primary animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">
              NihongoRoute | Platform Belajar Bahasa Jepang
            </span>
          </Badge>
        </m.div>

        <m.h1
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-6xl md:text-8xl lg:text-[100px] font-bold tracking-[-0.04em] leading-[0.95] text-foreground mb-[34px]"
        >
          Kuasai <br />
          <m.span
            initial={{ filter: "blur(20px)", opacity: 0 }}
            animate={{ filter: "blur(0px)", opacity: 1 }}
            transition={{ delay: 0.3, duration: 1 }}
            className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary/80 to-secondary dark:drop-shadow-[0_0_35px_rgba(var(--primary-rgb),0.3)]"
          >
            Bahasa Jepang.
          </m.span>
        </m.h1>

        <m.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-muted-foreground text-lg md:text-xl max-w-xl mb-[55px] leading-relaxed font-medium text-balance"
        >
          Belajar bahasa Jepang di NihongoRoute jadi lebih seru dan mudah. Platform modern
          yang didesain khusus untuk membantumu mahir lebih cepat.
        </m.p>

        <m.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex flex-col sm:flex-row gap-[21px] w-full sm:w-auto"
        >
          <Button
            asChild
            className="h-[65px] px-10 bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase tracking-widest text-xs rounded-2xl shadow-[0_20px_40px_rgba(var(--primary-rgb),0.2)] hover:shadow-[0_25px_50px_rgba(var(--primary-rgb),0.3)] transition-all duration-500 group border-none"
          >
            <Link href="/dashboard">
              Mulai Belajar Sekarang{" "}
              <ArrowRight
                size={16}
                className="ml-3 group-hover:translate-x-1 transition-transform duration-300"
              />
            </Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            className="h-[65px] px-10 bg-card/40 border border-border backdrop-blur-md hover:bg-card transition-all text-foreground font-bold uppercase tracking-widest text-xs rounded-2xl"
          >
            <Link href="/courses">
              <PlayCircle size={18} className="mr-3 text-primary" /> Jelajahi Materi
            </Link>
          </Button>
        </m.div>
      </div>

      {/* AREA DEKORATIF KANAN - KESEIMBANGAN ASIMETRIS */}
      <m.div
        initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ delay: 0.4, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="hidden lg:flex flex-1 justify-end relative pointer-events-none"
      >
        <div className="relative size-[500px]">
          {/* Efek Cahaya Latar Belakang */}
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/25 via-secondary/15 to-transparent rounded-[89px] blur-3xl animate-pulse" />
          
          {/* Glowing Ring 1 */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[340px] border border-primary/20 rounded-[65px] rotate-6 animate-[spin_20s_infinite_linear] opacity-60" />
          
          {/* Glowing Ring 2 */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[380px] border border-dashed border-secondary/20 rounded-[75px] -rotate-6 animate-[spin_30s_infinite_linear] opacity-40" />

          {/* Card Utama Glassmorphic */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[300px] border border-border rounded-[55px] rotate-12 backdrop-blur-3xl shadow-[0_20px_50px_rgba(var(--primary-rgb),0.15)] overflow-hidden group glass">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/5" />
            <div className="absolute top-8 left-8">
              <div className="w-12 h-1 bg-primary/50 rounded-full mb-3 shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]" />
              <div className="w-20 h-1 bg-primary/25 rounded-full" />
            </div>
            
            {/* Teks Bahasa Jepang dengan Font Serif Cantik */}
            <div 
              className="absolute bottom-8 right-8 text-primary/50 font-black text-6xl select-none tracking-wider font-japanese"
              style={{ fontFamily: "var(--font-noto-serif-jp)", textShadow: "0 0 15px rgba(var(--primary-rgb),0.2)" }}
            >
              日本語
            </div>
          </div>

          {/* Elemen Dekoratif Mengambang 1 */}
          <m.div
            animate={{ y: [0, -15, 0], x: [0, 5, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-8 right-8 p-5 bg-background/60 border border-border rounded-2xl shadow-2xl backdrop-blur-md flex items-center justify-center glass hover:border-primary/40 transition-colors pointer-events-auto"
          >
            <Sparkles className="text-primary drop-shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]" size={24} />
          </m.div>

          {/* Elemen Dekoratif Mengambang 2 */}
          <m.div
            animate={{ y: [0, 20, 0], x: [0, -8, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-8 -left-8 p-6 bg-card/45 border border-border rounded-3xl shadow-2xl backdrop-blur-xl flex items-center justify-center glass hover:border-success/40 transition-colors pointer-events-auto"
          >
            <div className="flex items-center gap-3">
              <div className="size-3 bg-success rounded-full animate-pulse shadow-[0_0_10px_rgba(var(--success-rgb),0.8)]" />
              <span className="text-xs font-black text-foreground uppercase tracking-widest">Sinkronisasi Cloud Aktif</span>
            </div>
          </m.div>
        </div>
      </m.div>
    </section>
  );
}

