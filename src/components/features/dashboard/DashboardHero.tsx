"use client";

/**
 * @file DashboardHero.tsx
 * @description Komponen Hero utama pada halaman dashboard NihongoRoute.
 * Menyajikan sapaan personal kepada pengguna, rangkuman status review hafalan (Spaced Repetition System),
 * indikator level/XP, info streak harian, serta tombol pintas review kilat dan lanjut belajar.
 *
 * @package components/features/dashboard
 * @project NihongoRoute
 */

// ==========================================
// IMPOR
// ==========================================
import { m, Variants } from "framer-motion";
import { Sparkles, BrainCircuit, Target, BookMarked, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { useUserStore } from "@/store/useUserStore";
import ProfileEditor from "../user/ProfileEditor";
import { Trophy, Flame, Star, ArrowRight } from "lucide-react";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import ContinueLearning from "./ContinueLearning";
import { getLevelProgressPercent } from "@/lib/level";

// ==========================================
// ANTARMUKA & PROPS (INTERFACES)
// ==========================================
interface DashboardHeroProps {
  guestId: string;
  itemVariants: Variants;
  courseMetadata: Array<{
    _id: string;
    title: string;
    slug: string;
    lessons: Array<{
      _id: string;
      title: string;
      slug: string;
    }>;
  }>;
  loading: boolean;
  dueCount: number;
  isAuthenticated: boolean;
}

// ==========================================
// KOMPONEN UTAMA
// ==========================================
export default function DashboardHero({ 
  guestId, 
  itemVariants, 
  courseMetadata,
  loading,
  dueCount,
  isAuthenticated
}: DashboardHeroProps) {
  // SELEKTOR ATOMIK (Sangat dilarang melakukan destrukturisasi untuk menjaga reaktivitas store)
  const name = useUserStore(s => s.name);
  const xp = useUserStore(s => s.xp);
  const level = useUserStore(s => s.level);
  const streak = useUserStore(s => s.streak);

  const xpProgress = Math.round(getLevelProgressPercent(xp, level));

  return (
    <m.div variants={itemVariants} className="flex flex-col gap-[34px] items-start w-full">
      
      {/* AREA SAPAAN PENGGUNA */}
      <div className="flex-1 w-full flex flex-col items-center lg:items-start text-center lg:text-left">
        {loading ? (
          <Skeleton className="h-6 w-32 rounded-full mb-6" />
        ) : (
          <div className="flex flex-col items-center lg:items-start gap-[13px] mb-[34px]">
            <Badge 
              variant="outline" 
              className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2 w-fit border-border  transition-all ${
                isAuthenticated 
                  ? 'bg-success/5 text-success border-success/20' 
                  : 'bg-primary/5 text-primary border-primary/20'
              }`}
            >
              <Sparkles size={12} className={isAuthenticated ? 'text-success' : 'text-primary'} /> 
              {isAuthenticated ? 'PELAJAR' : 'TAMU'} — {guestId}
            </Badge>
            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest opacity-60 ml-1">
              {isAuthenticated ? 'Sinkronisasi Cloud Aktif' : 'Mode Penyimpanan Lokal'}
            </span>
          </div>
        )}
        
        {loading ? (
          <div className="space-y-4 mb-4">
            <Skeleton className="h-16 w-64 md:w-96" />
            <Skeleton className="h-4 w-48 md:w-64" />
          </div>
        ) : (
          <ProfileEditor />
        )}
      </div>

      {/* KARTU PINTAS PREMIUM (CALL TO ACTION) */}
      <div className="w-full relative">
        {/* Glow Latar Belakang Dekoratif */}
        <div className="absolute -top-[55px] -right-[55px] size-[233px] bg-primary/5 rounded-full blur-[89px] pointer-events-none" />
        
        {loading ? (
          <Skeleton className="h-[320px] w-full rounded-2xl" />
        ) : (
        <Card className="p-[34px] md:p-[55px] rounded-2xl bg-card/20  border border-border shadow-2xl relative overflow-hidden group transition-all duration-500 hover:border-primary/40 hover:shadow-[0_0_50px_rgb(var(--primary-rgb)/0.15)]">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-750" />
          
          <div className="relative z-10 flex flex-col items-center text-center">
            
            {/* Ikon Berdenyut Interaktif (Pulsing Icon) */}
            <m.div 
              animate={dueCount > 0 ? {
                scale: [1, 1.05, 1],
                boxShadow: [
                  "0 0 0px rgb(var(--primary-rgb)/0)", 
                  "0 0 30px rgb(var(--primary-rgb)/0.3)", 
                  "0 0 0px rgb(var(--primary-rgb)/0)"
                ]
              } : {
                scale: [1, 1.05, 1],
                boxShadow: [
                  "0 0 0px rgb(var(--success-rgb)/0)", 
                  "0 0 30px rgb(var(--success-rgb)/0.3)", 
                  "0 0 0px rgb(var(--success-rgb)/0)"
                ]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className={`w-[89px] h-[89px] rounded-xl flex items-center justify-center mb-[34px] border transition-all duration-500 ${
                dueCount > 0 
                  ? 'bg-primary/15 border-primary/30 text-primary shadow-[0_0_20px_rgb(var(--primary-rgb)/0.1)]' 
                  : 'bg-success/15 border-success/30 text-success shadow-[0_0_20px_rgb(var(--success-rgb)/0.1)]'
              }`}
            >
              {dueCount > 0 ? (
                <BrainCircuit size={40} className="drop-shadow-[0_0_12px_rgb(var(--primary-rgb)/0.4)]" />
              ) : (
                <Trophy size={40} className="drop-shadow-[0_0_12px_rgb(var(--success-rgb)/0.4)]" />
              )}
            </m.div>
            
            <h3 className={`text-3xl md:text-5xl font-black tracking-tight mb-[13px] text-balance transition-colors ${dueCount > 0 ? 'text-foreground' : 'text-success'}`}>
              {dueCount > 0 ? `Yuk review lagi, ${name || 'Pelajar'}!` : `Mantap, ${name || 'Pelajar'}! Hafalanmu masih aman.`}
            </h3>
            <p className="text-muted-foreground text-sm md:text-base mb-[34px] font-medium max-w-md leading-relaxed text-balance">
              {dueCount > 0 
                ? `Ada ${dueCount} kata yang nunggu kamu review. Semangat!` 
                : "Semua masih fresh di ingatanmu. Mau lanjut ke materi baru?"}
            </p>
 
            {/* RINGKASAN STATUS DI DALAM HERO (Mobile-Optimized) */}
            <div className="grid grid-cols-3 gap-2 md:gap-[21px] mb-[34px] md:mb-[55px] w-full max-w-sm">
              <div className="flex flex-col items-center gap-1 md:gap-2">
                <div className="flex items-center gap-1 md:gap-1.5 text-warning transition-transform hover:scale-105">
                  <Flame size={14} className="fill-current md:w-4 md:h-4 drop-shadow-[0_0_6px_rgb(var(--warning-rgb)/0.3)]" />
                  <span className="text-sm md:text-lg font-black font-mono">
                    <AnimatedCounter value={streak} />
                  </span>
                </div>
                <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Streak</span>
              </div>
              <div className="flex flex-col items-center gap-1 md:gap-2 border-x border-border/60">
                <div className="flex items-center gap-1 md:gap-1.5 text-primary transition-transform hover:scale-105">
                  <Star size={14} className="fill-current md:w-4 md:h-4 drop-shadow-[0_0_6px_rgb(var(--primary-rgb)/0.3)]" />
                  <span className="text-sm md:text-lg font-black font-mono">Lvl {level}</span>
                </div>
                <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Level</span>
              </div>
              <div className="flex flex-col items-center gap-1 md:gap-2">
                <div className="flex items-center gap-1 md:gap-1.5 text-primary transition-transform hover:scale-105">
                  <Target size={14} className="md:w-4 md:h-4 drop-shadow-[0_0_6px_rgb(var(--primary-rgb)/0.3)]" />
                  <span className="text-sm md:text-lg font-black font-mono">{Math.floor(xpProgress)}%</span>
                </div>
                <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Progres</span>
              </div>
            </div>
 
            <div className="flex flex-col sm:flex-row gap-[13px] w-full max-w-md">
              {dueCount > 0 ? (
                <>
                  <Button asChild className="flex-1 h-[55px] bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-[0.15em] rounded-lg text-[10px] transition-all shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98]">
                    <Link href="/review">
                      Mulai Review <ArrowRight size={14} className="ml-2" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="flex-1 h-[55px] bg-card/50  border-border hover:bg-card hover:border-primary/30 rounded-lg text-[10px] font-black uppercase tracking-[0.15em] transition-all active:scale-[0.98]">
                    <Link href="/review?mode=quick">
                      <Zap size={14} className="mr-2 text-primary" /> Kuis Kilat
                    </Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild className="flex-1 h-[55px] bg-foreground text-background hover:bg-foreground/90 font-black uppercase tracking-[0.15em] rounded-lg text-[10px] transition-all shadow-xl active:scale-[0.98]">
                    <Link href="/courses">
                      Mulai Pelajaran <BookMarked size={14} className="ml-2" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="flex-1 h-[55px] bg-card/50  border-border hover:bg-card hover:border-primary/30 rounded-lg text-[10px] font-black uppercase tracking-[0.15em] transition-all active:scale-[0.98]">
                    <Link href="/review?mode=quick">
                      <Zap size={14} className="mr-2 text-primary" /> Kuis Kilat
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </Card>
        )}
        
        {/* WIDGET LANJUT BELAJAR */}
        {!loading && (
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-[55px]"
          >
            <ContinueLearning courseMetadata={courseMetadata} />
          </m.div>
        )}
        
        {/* TIPS BELAJAR CERDAS */}
        {!loading && (
          <m.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="mt-[34px] p-[21px] rounded-xl bg-card/10  border border-border flex gap-[21px] items-center group hover:bg-card/20 transition-all duration-300 shadow-none"
          >
            <div className="shrink-0 size-[34px] rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              <Sparkles size={16} />
            </div>
            <div>
              <h4 className="text-[10px] text-primary uppercase tracking-[0.2em] mb-1">Tips Hari Ini</h4>
              <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                Usahakan review sebelum jam 10 malam biar bonus XP-mu nggak hilang!
              </p>
            </div>
          </m.div>
        )}
      </div>
    </m.div>
  );
}

