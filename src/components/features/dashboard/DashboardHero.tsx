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
import { useMemo } from "react";
import { m, Variants } from "framer-motion";
import { Sparkles, BrainCircuit, Target, BookMarked, Zap } from "@/components/ui/icons";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { useUserStore } from "@/store/useUserStore";
import ProfileEditor from "../user/ProfileEditor";
import { Trophy, Flame, Star, ArrowRight } from "@/components/ui/icons";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import { getLevelProgressPercent } from "@/lib/level";

import { ROUTES } from "@/lib/core/routes";
// ==========================================
// ANTARMUKA & PROPS (INTERFACES)
// ==========================================
/**
 * Props for DashboardHero component.
 */
interface DashboardHeroProps {
  /** Guest identifier string */
  guestId: string;
  /** Framer motion animation variants */
  itemVariants: Variants;
  /** Course structure metadata */
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
  /** Loading state indicator */
  loading: boolean;
  /** Number of items due for review */
  dueCount: number;
  /** User authentication status */
  isAuthenticated: boolean;
}

// ==========================================
// KOMPONEN UTAMA
// ==========================================
/**
 * Dashboard hero component. Display user stats, SRS status, quick actions.
 */
export default function DashboardHero({ 
  guestId, 
  itemVariants, 
  courseMetadata,
  loading,
  dueCount,
  isAuthenticated
}: DashboardHeroProps) {
  // SELEKTOR ATOMIK (Sangat dilarang melakukan destrukturisasi untuk menjaga reaktivitas store)
  // Get user state. Use atomic selectors to keep reactivity.
  const name = useUserStore(s => s.name);
  const xp = useUserStore(s => s.xp);
  const level = useUserStore(s => s.level);
  const streak = useUserStore(s => s.streak);
  const completedLessons = useUserStore(s => s.completedLessons);

  // Compute active course and next lesson.
  const activeData = useMemo(() => {
    if (!courseMetadata || courseMetadata.length === 0) return null;

    const stats = courseMetadata.map(cat => {
      const lessons = cat.lessons || [];
      const completedInCat = lessons.filter(lesson => {
        const record = completedLessons[lesson._id];
        return record && record.completedAt;
      });
      
      const totalLessons = lessons.length;
      const progress = totalLessons > 0 
        ? (completedInCat.length / totalLessons) * 100 
        : 0;
      
      const lastUpdate = lessons.reduce((max, lesson) => {
        const ts = completedLessons[lesson._id]?.updatedAt || 0;
        return ts > max ? ts : max;
      }, 0);

      return { ...cat, lessons, progress, lastUpdate, completedCount: completedInCat.length, totalLessons };
    });

    let active = stats
      .filter(s => s.progress > 0 && s.progress < 100)
      .sort((a, b) => b.lastUpdate - a.lastUpdate)[0] as typeof stats[number] | undefined;

    if (!active) {
       active = stats.find(s => s.progress < 100);
    }

    if (!active || !active.lessons || active.lessons.length === 0) return null;

    const nextLessonIndex = active.lessons.findIndex(l => !completedLessons[l._id]?.completedAt);
    const nextLesson = active.lessons[nextLessonIndex] || active.lessons[0];

    if (!nextLesson) return null;

    return {
      courseTitle: active.title,
      courseSlug: active.slug,
      progress: active.progress,
      lessonTitle: nextLesson.title,
      lessonSlug: nextLesson.slug,
      completedCount: active.completedCount,
      totalLessons: active.totalLessons,
      isNew: active.progress === 0
    };
  }, [courseMetadata, completedLessons]);

  // Calculate level progress percent.
  const xpProgress = Math.round(getLevelProgressPercent(xp, level));

  return (
    <m.div variants={itemVariants} className="flex flex-col gap-[34px] items-start w-full">
      
      {/* AREA SAPAAN PENGGUNA */}
      {/* Render loading skeleton or user badge */}
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
      {/* Render review card. Change style based on due count */}
      <div className="w-full relative group">
        {/* Tombou Register Mark (L-shape offset 6px outside rounded-2xl) */}
        <div className="absolute -top-[6px] -right-[6px] w-[14px] h-[14px] pointer-events-none z-20">
          <div 
            className="absolute top-0 right-0 w-[14px] h-[1px] transition-colors duration-500" 
            style={{ backgroundColor: dueCount > 0 ? "var(--primary)" : "var(--success)" }}
          />
          <div 
            className="absolute top-0 right-0 w-[1px] h-[14px] transition-colors duration-500" 
            style={{ backgroundColor: dueCount > 0 ? "var(--primary)" : "var(--success)" }}
          />
        </div>

        {loading ? (
          <Skeleton className="h-[320px] w-full rounded-2xl" />
        ) : (
          <Card className="p-[34px] md:p-[50px] bg-card border border-border/50 dark:border-white/10 rounded-2xl shadow-[0_4px_25px_rgba(0,0,0,0.015)] relative overflow-hidden">
            <div className="relative z-10 flex flex-col items-center text-center">
              
              {/* Ikon Berdenyut Interaktif (Pulsing Icon) */}
              <m.div 
                animate={dueCount > 0 ? {
                  scale: [1, 1.03, 1]
                } : {
                  scale: [1, 1.03, 1]
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className={`w-[80px] h-[80px] rounded-lg flex items-center justify-center mb-[34px] border transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                  dueCount > 0 
                    ? 'bg-primary/10 border-primary/25 text-primary' 
                    : 'bg-success/10 border-success/25 text-success'
                }`}
              >
                {dueCount > 0 ? (
                  <BrainCircuit size={36} />
                ) : (
                  <Trophy size={36} />
                )}
              </m.div>
              
              <h3 className={`text-3xl md:text-5xl font-bold tracking-tight mb-[13px] text-balance transition-colors ${dueCount > 0 ? 'text-foreground' : 'text-success'}`}>
                {dueCount > 0 ? `Yuk review lagi, ${name || 'Pelajar'}!` : `Mantap, ${name || 'Pelajar'}! Hafalanmu masih aman.`}
              </h3>
              <p className="text-muted-foreground text-sm md:text-base mb-[34px] font-semibold max-w-md leading-relaxed text-balance">
                {dueCount > 0 
                  ? `Ada ${dueCount} kata yang nunggu kamu review. Semangat!` 
                  : "Semua masih fresh di ingatanmu. Mau lanjut ke materi baru?"}
              </p>
   
              {/* RINGKASAN STATUS DI DALAM HERO (Mobile-Optimized) */}
              <div className="grid grid-cols-3 gap-2 md:gap-[21px] mb-[34px] md:mb-[55px] w-full max-w-sm">
                <div className="flex flex-col items-center gap-1 md:gap-2">
                  <div className="flex items-center gap-1 md:gap-1.5 text-warning transition-transform hover:scale-105">
                    <Flame size={14} className="fill-current md:w-4 md:h-4" />
                    <span className="text-sm md:text-lg font-black font-mono">
                      <AnimatedCounter value={streak} />
                    </span>
                  </div>
                  <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Streak</span>
                </div>
                <div className="flex flex-col items-center gap-1 md:gap-2 border-x border-border/60">
                  <div className="flex items-center gap-1 md:gap-1.5 text-primary transition-transform hover:scale-105">
                    <Star size={14} className="fill-current md:w-4 md:h-4" />
                    <span className="text-sm md:text-lg font-black font-mono">Lvl {level}</span>
                  </div>
                  <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Level</span>
                </div>
                <div className="flex flex-col items-center gap-1 md:gap-2">
                  <div className="flex items-center gap-1 md:gap-1.5 text-primary transition-transform hover:scale-105">
                    <Target size={14} className="md:w-4 md:h-4" />
                    <span className="text-sm md:text-lg font-black font-mono">{Math.floor(xpProgress)}%</span>
                  </div>
                  <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Progres</span>
                </div>
              </div>
   
              {/* Render action buttons with Asymmetric Calligraphic Cut */}
              <div className="flex flex-col sm:flex-row gap-[13px] w-full max-w-md">
                {dueCount > 0 ? (
                  <>
                    <Button asChild className="flex-1 h-[50px] bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-[0.15em] rounded-lg rounded-br-none text-[10px] pl-6 pr-4 transition-all active:scale-[0.97] group">
                      <Link href={ROUTES.REVIEW} className="flex items-center justify-between w-full">
                        <span>Asah Ingatan</span>
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 dark:bg-white/15 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-1">
                          <ArrowRight size={14} />
                        </span>
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="flex-1 h-[50px] bg-background border border-border/80 hover:border-primary/50 rounded-lg rounded-br-none text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300 active:scale-[0.97] group">
                      <Link href="/review?mode=quick" className="flex items-center justify-center gap-2">
                        <Zap size={14} className="text-primary" />
                        <span>Kuis Kilat</span>
                      </Link>
                    </Button>
                  </>
                ) : (
                  <>
                    <Button asChild className="flex-1 h-[50px] bg-foreground text-background hover:bg-foreground/90 font-black uppercase tracking-[0.15em] rounded-lg rounded-br-none text-[10px] pl-6 pr-4 transition-all active:scale-[0.97] group">
                      <Link href={activeData ? `/courses/${activeData.courseSlug}/${activeData.lessonSlug}` : "/courses"} className="flex items-center justify-between w-full">
                        <span>{activeData ? `Lanjut: ${activeData.lessonTitle}` : "Mulai Pelajaran"}</span>
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-background/10 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-1">
                          <BookMarked size={14} />
                        </span>
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="flex-1 h-[50px] bg-background border border-border/80 hover:border-primary/50 rounded-lg rounded-br-none text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300 active:scale-[0.97] group">
                      <Link href="/review?mode=quick" className="flex items-center justify-center gap-2">
                        <Zap size={14} className="text-primary" />
                        <span>Kuis Kilat</span>
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </Card>
        )}

        
        {/* TIPS BELAJAR CERDAS */}
        {!loading && (
          <m.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="mt-[34px] w-full"
          >
            <div className="p-5 rounded-lg bg-card border border-border/50 dark:border-white/10 flex gap-[21px] items-center group shadow-[0_2px_12px_rgba(0,0,0,0.01)]">
              <div className="shrink-0 size-[34px] rounded-lg bg-primary/10 flex items-center justify-center text-primary transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]">
                <Sparkles size={16} />
              </div>
              <div>
                <h4 className="text-[10px] text-primary uppercase tracking-[0.2em] mb-1 font-bold">Tips Hari Ini</h4>
                <p className="text-xs text-muted-foreground leading-relaxed font-semibold">
                  Usahakan review sebelum jam 10 malam biar bonus XP-mu nggak hilang!
                </p>
              </div>
            </div>
          </m.div>
        )}
      </div>
    </m.div>
  );
}