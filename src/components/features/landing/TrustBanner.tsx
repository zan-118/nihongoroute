"use client";

/**
 * @file TrustBanner.tsx
 * @description Komponen spanduk kepercayaan (Trust Banner) untuk Landing Page NihongoRoute.
 * Menegaskan tiga nilai utama platform: 100% Gratis Tanpa Iklan, Akses Luring Penuh (Offline),
 * serta didukung penuh oleh kontribusi komunitas secara Terbuka (Open Source).
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
import { 
  ShieldCheck, 
  ArrowRight, 
  WifiOff, 
  Heart, 
  Github, 
  Sparkles 
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// ==========================================
/**
 * Komponen TrustBanner
 * Menyajikan pilar kepercayaan NihongoRoute kepada calon pengguna.
 */
export function TrustBanner() {
  return (
    <section className="w-full mb-[120px]">
      <Card className="p-6 sm:p-10 md:p-12 rounded-[28px] sm:rounded-[34px] bg-card/10  border border-border/80 shadow-none relative overflow-hidden group transition-all duration-700 hover:border-primary/40 hover:shadow-[0_0_50px_rgba(var(--primary-rgb),0.1)] glass">
        
        {/* Latar Belakang Kilau Dekoratif menggunakan variabel warna CSS */}
        <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent pointer-events-none" />
        
        <div className="flex flex-col xl:flex-row items-center justify-between gap-[55px] relative z-10 mb-8">
          
          {/* AREA KONTEN KIRI (TEXT & MANFAAT UTAMA) */}
          <div className="flex-1 space-y-6">
            <Badge className="bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-none">
              Akses Edukasi Terbuka
            </Badge>
            
            <h2 className="text-4xl md:text-5xl tracking-tight text-foreground text-balance">
              Belajar Tanpa Batas, <br />
              <span className="brand-text-gradient">100% Gratis Selamanya!</span>
            </h2>
            
            <p className="text-muted-foreground text-base md:text-lg font-medium leading-relaxed max-w-2xl text-balance">
              NihongoRoute itu gratis, transparan, dan dibuat biar siapa aja bisa belajar bahasa Jepang tanpa mikirin biaya.
            </p>
 
            {/* BARIS TIGA MANFAAT UTAMA */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              
              {/* MANFAAT 1: BEBAS BIAYA */}
              <div className="p-5 bg-card/30  border border-border/80 rounded-lg transition-all duration-300 hover:border-primary/40 hover:shadow-[0_0_20px_rgba(var(--primary-rgb),0.08)] flex flex-col justify-between h-full hover:bg-card/50 glass group/item">
                <div className="space-y-3">
                  <div className="size-10 rounded-xl bg-primary/10 border border-primary/25 flex items-center justify-center text-primary transition-transform group-hover/item:scale-105">
                    <ShieldCheck size={20} className="drop-shadow-[0_0_5px_rgb(var(--primary-rgb)_/_0.3)]" />
                  </div>
                  <h4 className="text-sm text-foreground uppercase tracking-tight">Tanpa Iklan / Biaya Tersembunyi</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed font-semibold">
                    Nggak ada iklan mengganggu, nggak ada biaya tersembunyi, dan nggak perlu kartu kredit.
                  </p>
                </div>
              </div>
 
              {/* MANFAAT 2: OFFLINE */}
              <div className="p-5 bg-card/30  border border-border/80 rounded-lg transition-all duration-300 hover:border-secondary/40 hover:shadow-[0_0_20px_rgba(var(--secondary-rgb),0.08)] flex flex-col justify-between h-full hover:bg-card/50 glass group/item">
                <div className="space-y-3">
                  <div className="size-10 rounded-xl bg-secondary/10 border border-secondary/25 flex items-center justify-center text-secondary transition-transform group-hover/item:scale-105">
                    <WifiOff size={20} className="drop-shadow-[0_0_5px_rgb(var(--secondary-rgb)_/_0.3)]" />
                  </div>
                  <h4 className="text-sm text-foreground uppercase tracking-tight">Akses Luring Penuh</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed font-semibold">
                    Bisa dipakai offline. Semua progres belajarmu tersimpan aman di perangkatmu.
                  </p>
                </div>
              </div>
 
              {/* MANFAAT 3: OPEN SOURCE */}
              <div className="p-5 bg-card/30  border border-border/80 rounded-lg transition-all duration-300 hover:border-secondary/40 hover:shadow-[0_0_20px_rgba(var(--brand-violet-rgb),0.12)] flex flex-col justify-between h-full hover:bg-card/50 glass group/item">
                <div className="space-y-3">
                  <div className="size-10 rounded-xl bg-secondary/10 border border-secondary/25 flex items-center justify-center text-secondary transition-transform group-hover/item:scale-105">
                    <Heart size={20} className="drop-shadow-[0_0_5px_rgb(var(--brand-violet-rgb)_/_0.32)]" />
                  </div>
                  <h4 className="text-sm text-foreground uppercase tracking-tight">Didukung Komunitas</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed font-semibold">
                    Open source dan terbuka. Siapa aja boleh ikut kontribusi buat bikin kurikulumnya makin bagus.
                  </p>
                </div>
              </div>
            </div>
          </div>
 
          {/* KOLOM AKSI KANAN (CTA & REPOSITORY) */}
          <div className="flex flex-col sm:flex-row xl:flex-col gap-3.5 w-full sm:w-auto xl:w-[260px] shrink-0 justify-center">
            <Button
              asChild
              className="brand-button h-12 px-7 text-xs group"
            >
              <Link href="/support">
                Dukung Kami <Heart size={14} className="ml-3 text-primary-foreground fill-current animate-pulse" />
              </Link>
            </Button>
 
            <Button
              asChild
              variant="ghost"
              className="brand-button-ghost h-12 px-7 text-xs group"
            >
              <a 
                href="https://github.com/zan-118/nihongoroute" 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center justify-center"
              >
                <Github size={16} className="mr-3" /> Repositori GitHub <ArrowRight size={12} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </a>
            </Button>
          </div>
 
        </div>

        {/* Ticker Kontribusi Komunitas Horizontal */}
        <div className="pt-6 border-t border-border/80 w-full overflow-hidden relative">
          <m.div
            animate={{ x: [0, -750] }}
            transition={{
              ease: "linear",
              duration: 28,
              repeat: Infinity
            }}
            className="flex gap-12 w-max"
          >
            {[
              "👥 74+ Pembelajar Terdaftar",
              "⭐ 100% Open Source di GitHub",
              "💡 22,000+ Kosakata Terkontribusi",
              "❤️ Didukung Donatur Trakteer & Saweria",
              "🔒 Kebijakan Data Offline Aman",
              "⚡ Didukung Komunitas Bahasa Jepang Indonesia",
              "👥 74+ Pembelajar Terdaftar",
              "⭐ 100% Open Source di GitHub",
              "💡 22,000+ Kosakata Terkontribusi",
              "❤️ Didukung Donatur Trakteer & Saweria",
              "🔒 Kebijakan Data Offline Aman",
              "⚡ Didukung Komunitas Bahasa Jepang Indonesia"
            ].map((text, index) => (
              <span key={index} className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                <Sparkles size={10} className="text-primary animate-pulse" /> {text}
              </span>
            ))}
          </m.div>
        </div>
 
      </Card>
    </section>
  );
}
