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
// KOMPONEN UTAMA
// ==========================================
/**
 * Komponen TrustBanner
 * Menyajikan pilar kepercayaan NihongoRoute kepada calon pengguna.
 */
export function TrustBanner() {
  return (
    <m.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="w-full mb-[120px]"
    >
      <Card className="p-[34px] sm:p-[55px] md:p-[65px] rounded-[42px] bg-card/10 backdrop-blur-xl border border-border shadow-2xl relative overflow-hidden group transition-all duration-700 hover:border-primary/30 hover:shadow-[0_0_50px_rgba(var(--primary-rgb),0.1)] glass">
        
        {/* Latar Belakang Kilau Dekoratif menggunakan variabel warna CSS */}
        <div className="absolute -top-40 -left-40 size-96 bg-primary/10 rounded-full blur-[120px] group-hover:bg-primary/15 transition-all duration-700 pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 size-96 bg-secondary/5 rounded-full blur-[120px] group-hover:bg-secondary/10 transition-all duration-700 pointer-events-none" />
        
        <div className="flex flex-col xl:flex-row items-center justify-between gap-[55px] relative z-10">
          
          {/* AREA KONTEN KIRI (TEXT & MANFAAT UTAMA) */}
          <div className="flex-1 space-y-6">
            <Badge className="bg-success/10 text-success border border-success/20 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-none">
              Akses Edukasi Terbuka
            </Badge>
            
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-foreground text-balance">
              Belajar Tanpa Batas, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary/80 to-secondary">100% Gratis Selamanya!</span>
            </h2>
            
            <p className="text-muted-foreground text-base md:text-lg font-medium leading-relaxed max-w-2xl text-balance">
              NihongoRoute adalah platform belajar nirlaba yang didesain secara transparan untuk mempermudah siapa saja menguasai bahasa Jepang secara mandiri tanpa terhalang kendala biaya.
            </p>
 
            {/* BARIS TIGA MANFAAT UTAMA */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              
              {/* MANFAAT 1: BEBAS BIAYA */}
              <div className="p-5 bg-card/30 backdrop-blur-xl border border-border/80 rounded-2xl transition-all duration-300 hover:border-primary/30 hover:shadow-[0_0_20px_rgba(var(--primary-rgb),0.06)] flex flex-col justify-between h-full hover:bg-card/50 glass group/item">
                <div className="space-y-3">
                  <div className="size-10 rounded-xl bg-primary/10 border border-primary/25 flex items-center justify-center text-primary transition-transform group-hover/item:scale-105">
                    <ShieldCheck size={20} className="drop-shadow-[0_0_5px_rgba(var(--primary-rgb),0.3)]" />
                  </div>
                  <h4 className="text-sm font-black text-foreground uppercase tracking-tight">Tanpa Iklan / Biaya Tersembunyi</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed font-semibold">
                    Tidak ada interupsi iklan mengganggu, tidak ada fitur berbayar tersembunyi, dan tidak perlu mendaftarkan kartu kredit.
                  </p>
                </div>
              </div>
 
              {/* MANFAAT 2: OFFLINE */}
              <div className="p-5 bg-card/30 backdrop-blur-xl border border-border/80 rounded-2xl transition-all duration-300 hover:border-secondary/30 hover:shadow-[0_0_20px_rgba(var(--secondary-rgb),0.06)] flex flex-col justify-between h-full hover:bg-card/50 glass group/item">
                <div className="space-y-3">
                  <div className="size-10 rounded-xl bg-secondary/10 border border-secondary/25 flex items-center justify-center text-secondary transition-transform group-hover/item:scale-105">
                    <WifiOff size={20} className="drop-shadow-[0_0_5px_rgba(var(--secondary-rgb),0.3)]" />
                  </div>
                  <h4 className="text-sm font-black text-foreground uppercase tracking-tight">Akses Luring Penuh</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed font-semibold">
                    Mendukung mode offline. Seluruh data kemajuan belajar tersimpan aman di perangkat Anda secara instan.
                  </p>
                </div>
              </div>
 
              {/* MANFAAT 3: OPEN SOURCE */}
              <div className="p-5 bg-card/30 backdrop-blur-xl border border-border/80 rounded-2xl transition-all duration-300 hover:border-success/30 hover:shadow-[0_0_20px_rgba(var(--success-rgb),0.06)] flex flex-col justify-between h-full hover:bg-card/50 glass group/item">
                <div className="space-y-3">
                  <div className="size-10 rounded-xl bg-success/10 border border-success/25 flex items-center justify-center text-success transition-transform group-hover/item:scale-105">
                    <Heart size={20} className="drop-shadow-[0_0_5px_rgba(var(--success-rgb),0.3)]" />
                  </div>
                  <h4 className="text-sm font-black text-foreground uppercase tracking-tight">Didukung Komunitas</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed font-semibold">
                    Ekosistem pembelajaran bersifat open source. Terbuka bagi siapa saja untuk ikut berkontribusi menyempurnakan kurikulum.
                  </p>
                </div>
              </div>
            </div>
          </div>
 
          {/* KOLOM AKSI KANAN (CTA & REPOSITORY) */}
          <div className="flex flex-col sm:flex-row xl:flex-col gap-4 w-full sm:w-auto xl:w-[260px] shrink-0 justify-center">
            <Button
              asChild
              className="h-[55px] px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest text-xs rounded-2xl shadow-[0_15px_30px_rgba(var(--primary-rgb),0.15)] hover:shadow-[0_20px_40px_rgba(var(--primary-rgb),0.25)] transition-all duration-500 group border-none active:scale-[0.98]"
            >
              <Link href="/support">
                Dukung Kami <Heart size={14} className="ml-3 text-primary-foreground fill-primary-foreground animate-pulse" />
              </Link>
            </Button>
 
            <Button
              asChild
              variant="ghost"
              className="h-[55px] px-8 bg-foreground/5 hover:bg-foreground hover:text-background transition-all text-xs font-black uppercase tracking-widest rounded-2xl border border-border active:scale-[0.98]"
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
 
      </Card>
    </m.section>
  );
}

