/**
 * @file TrustBanner.tsx
 * @description Landing page trust banner component displaying platform core values: free access, offline-first, and open source transparency.
 */

import React from "react";
import Link from "next/link";
import { 
 ShieldCheck, 
 ArrowRight, 
 WifiOff, 
 Heart, 
 Github, 
 Sparkles 
} from "@/components/ui/icons";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/**
 * TrustBanner component.
 * Pure Server Component for SSG rendering.
 * Displays platform core values: free access, offline capability, open source.
 * 
 * @returns React element representing trust banner section.
 */
export function TrustBanner() {
 const tickerItems = [
 "100+ Pembelajar Terdaftar",
 "100% Open Source di GitHub",
 "22,000+ Kosakata Terkontribusi",
 "Didukung Donatur Trakteer & Saweria",
 "Kebijakan Data Offline Aman",
 "Didukung Komunitas Bahasa Jepang Indonesia"
 ];

 return (
 <section className="w-full mb-[120px] relative group">
 {/* Tombou Register Mark */}
 <div className="absolute -top-[6px] -right-[6px] w-[14px] h-[14px] pointer-events-none z-20">
 <div className="absolute top-0 right-0 w-[14px] h-[1px] bg-primary/20 group-hover:bg-primary transition-colors duration-500" />
 <div className="absolute top-0 right-0 w-[1px] h-[14px] bg-primary/20 group-hover:bg-primary transition-colors duration-500" />
 </div>

 <Card className="p-6 sm:p-10 md:p-12 bg-card border border-border/50 dark:border-white/10 rounded-2xl relative overflow-hidden group transition-all duration-700 hover:border-primary/45 shadow-[0_4px_25px_rgba(0,0,0,0.015)]">
 
 <div className="flex flex-col xl:flex-row items-center justify-between gap-[55px] relative z-10 mb-8">
 
 {/* AREA KONTEN KIRI (TEXT & MANFAAT UTAMA) */}
 <div className="flex-1 space-y-6">
 <Badge className="bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-[4px] text-[9px] font-black uppercase tracking-widest shadow-none">
 Akses Edukasi Terbuka
 </Badge>
 
 <h2 className="text-4xl md:text-5xl tracking-tight text-foreground text-balance font-bold">
 Belajar Tanpa Batas, <br />
 <span className="text-primary">100% Gratis Selamanya!</span>
 </h2>
 
 <p className="text-muted-foreground text-base md:text-lg font-semibold leading-relaxed max-w-2xl text-balance">
 NihongoRoute itu gratis, transparan, dan dibuat biar siapa aja bisa belajar bahasa Jepang tanpa mikirin biaya.
 </p>
 
 {/* BARIS TIGA MANFAAT UTAMA */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
 
 {/* MANFAAT 1: BEBAS BIAYA */}
 <Card className="p-5 bg-card border border-border/60 dark:border-white/10 rounded-lg transition-all duration-300 hover:border-primary/40 flex flex-col justify-between h-full group/item shadow-sm">
 <div className="space-y-3">
 <div className="size-10 rounded-lg bg-primary/10 border border-primary/25 flex items-center justify-center text-primary transition-transform group-hover/item:scale-105">
 <ShieldCheck size={20} />
 </div>
 <h3 className="text-sm text-foreground uppercase tracking-tight font-bold">Tanpa Iklan / Biaya Tersembunyi</h3>
 <p className="text-xs text-muted-foreground leading-relaxed font-semibold">
 Nggak ada iklan mengganggu, nggak ada biaya tersembunyi, dan nggak perlu kartu kredit.
 </p>
 </div>
 </Card>
 
 {/* MANFAAT 2: OFFLINE */}
 <Card className="p-5 bg-card border border-border/60 dark:border-white/10 rounded-lg transition-all duration-300 hover:border-secondary/40 flex flex-col justify-between h-full group/item shadow-sm">
 <div className="space-y-3">
 <div className="size-10 rounded-lg bg-secondary/10 border border-secondary/25 flex items-center justify-center text-secondary transition-transform group-hover/item:scale-105">
 <WifiOff size={20} />
 </div>
 <h3 className="text-sm text-foreground uppercase tracking-tight font-bold">Akses Luring Penuh</h3>
 <p className="text-xs text-muted-foreground leading-relaxed font-semibold">
 Bisa dipakai offline. Semua progres belajarmu tersimpan aman di perangkatmu.
 </p>
 </div>
 </Card>
 
 {/* MANFAAT 3: OPEN SOURCE */}
 <Card className="p-5 bg-card border border-border/60 dark:border-white/10 rounded-lg transition-all duration-300 hover:border-secondary/40 flex flex-col justify-between h-full group/item shadow-sm">
 <div className="space-y-3">
 <div className="size-10 rounded-lg bg-secondary/10 border border-secondary/25 flex items-center justify-center text-secondary transition-transform group-hover/item:scale-105">
 <Heart size={20} />
 </div>
 <h3 className="text-sm text-foreground uppercase tracking-tight font-bold">Didukung Komunitas</h3>
 <p className="text-xs text-muted-foreground leading-relaxed font-semibold">
 Open source dan terbuka. Siapa aja boleh ikut kontribusi buat bikin kurikulumnya makin bagus.
 </p>
 </div>
 </Card>
 </div>
 </div>
 
 {/* KOLOM AKSI KANAN (CTA & REPOSITORY) */}
 <div className="flex flex-col sm:flex-row xl:flex-col gap-3.5 w-full sm:w-auto xl:w-[260px] shrink-0 justify-center">
 <Button
 asChild
 className="bg-primary text-primary-foreground hover:bg-primary/92 h-12 px-7 text-xs rounded-lg rounded-br-none group"
 >
 <Link href="/support">
 Dukung Kami <Heart size={14} className="ml-3 text-primary-foreground fill-current animate-pulse" />
 </Link>
 </Button>
 
 <Button
 asChild
 variant="ghost"
 className="bg-transparent text-muted-foreground hover:bg-muted hover:text-primary border border-border h-12 px-7 text-xs rounded-lg rounded-br-none group border border-border/80"
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
 <div className="pt-6 border-t border-border/60 w-full overflow-hidden relative">
 <div className="flex gap-8 flex-wrap justify-between items-center">
 {tickerItems.map((text, index) => (
 <span key={index} className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
 <Sparkles size={10} className="text-primary animate-pulse" /> {text}
 </span>
 ))}
 </div>
 </div>
 
 </Card>
 </section>
 );
}