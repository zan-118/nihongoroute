"use client";

/**
 * @file DashboardStats.tsx
 * @description Komponen utama yang merangkum berbagai widget statistik kemajuan belajar pengguna di dashboard.
 * Menampilkan progress level & XP, statistik streak harian, penguasaan kurikulum/silabus per level JLPT,
 * modul Misi Harian (Daily Quests), status memori SRS (Memory Stats & SRS Analytics), serta visualisasi Heatmap kontribusi belajar.
 *
 * @package components/features/dashboard
 * @project NihongoRoute
 */

// ==========================================
// IMPOR
// ==========================================
import { m, Variants } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Flame, BookOpen, CheckCircle2 } from "@/components/ui/icons";
import DailyQuests from "./quests/DailyQuests";
import MemoryStats from "./dashboard-stats/MemoryStats";
import SRSAnalytics from "@/components/features/srs/analytics/SRSAnalytics";
import Heatmap from "./heatmap/Heatmap";
import StreakFreezeCard from "@/components/features/gamification/StreakFreezeCard";
import { useUserStore } from "@/store/useUserStore";

// ==========================================
// ANTARMUKA & PROPS (INTERFACES)
// ==========================================

/**
 * Props for DashboardStats component.
 */
interface DashboardStatsProps {
  /** Loading state flag. */
  loading: boolean;
  /** User progress data. */
  progress: {
    /** Current XP. */
    xp: number;
    /** Current level. */
    level: number;
    /** Current daily streak. */
    streak: number;
    /** Map of study dates to activity count. */
    studyDays: Record<string, number>;
  };
  /** XP needed for next level. */
  xpNeeded: number;
  /** Percentage progress to next level. */
  xpProgress: number;
  /** Animation variants for grid items. */
  itemVariants: Variants;
  /** Course structure metadata. */
  courseMetadata: Array<{
    /** Course ID. */
    _id: string;
    /** Course title. */
    title: string;
    /** Course slug. */
    slug: string;
    /** Lessons in course. */
    lessons: Array<{
      /** Lesson ID. */
      _id: string;
      /** Lesson title. */
      title: string;
      /** Lesson slug. */
      slug: string;
    }>;
  }>;
}

// ==========================================
// KOMPONEN UTAMA
// ==========================================

/**
 * Dashboard stats grid. Shows level, XP, streak, course progress, quests, SRS stats, and heatmap.
 */
export default function DashboardStats({ 
  loading, 
  progress, 
  xpNeeded, 
  xpProgress, 
  itemVariants,
  courseMetadata 
}: DashboardStatsProps) {
  // Fetch completed lessons from store.
  const completedLessons = useUserStore(s => s.completedLessons);

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 mb-20">
      
      {/* SEKSI 1: LEVEL & XP CARD (SPAN 8) */}
      <m.div variants={itemVariants} className="md:col-span-8">
        {loading ? (
          <Skeleton className="h-[250px] w-full rounded-2xl" />
        ) : (
          <div className="relative group h-full">
            {/* Tombou Register Mark */}
            <div className="absolute -top-[6px] -right-[6px] w-[14px] h-[14px] pointer-events-none z-20">
              <div className="absolute top-0 right-0 w-[14px] h-[1px] bg-success/20 group-hover:bg-success transition-colors duration-500" />
              <div className="absolute top-0 right-0 w-[1px] h-[14px] bg-success/20 group-hover:bg-success transition-colors duration-500" />
            </div>

            <Card className="h-full bg-card border border-border/50 dark:border-white/10 rounded-2xl p-6 md:p-8 flex flex-col justify-center relative overflow-hidden group shadow-[0_4px_25px_rgba(0,0,0,0.015)] group-hover:border-success/45 transition-colors duration-500">
              <div className="absolute top-0 right-0 size-64 bg-success/10 blur-[80px] rounded-full pointer-events-none ambient-glow will-change-transform" />
              <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
                <div>
                  <h2 className="text-muted-foreground font-bold uppercase tracking-widest text-xs md:text-xs mb-2">
                    Level Kamu
                  </h2>
                  <div className="flex items-baseline gap-3">
                    <span className="text-5xl md:text-6xl font-black text-foreground tracking-tighter">
                      {progress.level}
                    </span>
                    <Badge className="bg-success/10 text-success border-success/20 px-3 py-1 font-bold uppercase tracking-widest text-[8px] md:text-xs shadow-none">
                      Status Belajar
                    </Badge>
                  </div>
                </div>
                <div className="text-left md:text-right">
                  <span className="text-primary font-mono font-black text-3xl">
                    {progress.xp} <span className="text-sm opacity-70">XP</span>
                  </span>
                </div>
              </div>
              
              <div className="relative z-10">
                <div className="flex justify-between text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">
                  <span>Progres ke Level {progress.level + 1}</span>
                  <span>{xpProgress}%</span>
                </div>
                <Progress
                  value={xpProgress}
                  className="h-3 bg-muted border border-border relative overflow-hidden"
                  indicatorClassName="bg-[linear-gradient(90deg,rgb(var(--brand-cyan-rgb)),rgb(var(--brand-blue-rgb)))] relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/25 before:to-transparent"
                />
                <p className="mt-4 text-xs text-muted-foreground uppercase font-bold tracking-widest font-mono text-center md:text-right">
                  Kumpulkan <span className="text-foreground">{xpNeeded} XP</span> lagi untuk naik level!
                </p>
              </div>
            </Card>
          </div>
        )}
      </m.div>

      {/* SEKSI 2: SOROTAN HARI AKTIF & PEMBEKU STREAK (SPAN 4) */}
      <m.div variants={itemVariants} className="md:col-span-4 flex flex-col gap-6">
        {loading ? (
          <>
            <Skeleton className="h-[110px] w-full rounded-2xl" />
            <Skeleton className="h-[110px] w-full rounded-2xl" />
          </>
        ) : (
          <>
            <div className="relative group h-[140px]">
              {/* Tombou Register Mark */}
              <div className="absolute -top-[6px] -right-[6px] w-[14px] h-[14px] pointer-events-none z-20">
                <div className="absolute top-0 right-0 w-[14px] h-[1px] bg-warning/20 group-hover:bg-warning transition-colors duration-500" />
                <div className="absolute top-0 right-0 w-[1px] h-[14px] bg-warning/20 group-hover:bg-warning transition-colors duration-500" />
              </div>

              <Card className="h-full bg-card border border-border/50 dark:border-white/10 rounded-2xl p-5 flex flex-col justify-between group overflow-hidden relative shadow-[0_4px_25px_rgba(0,0,0,0.015)] group-hover:border-warning/45 transition-colors duration-500">
                <h3 className="text-warning/60 font-bold uppercase tracking-widest text-xs">
                  Semangat Belajar
                </h3>
                <div className="flex items-end gap-2 mt-2">
                  <span className="text-4xl font-black text-warning tracking-tighter">
                    {progress.streak}
                  </span>
                  <span className="text-warning/80 font-bold uppercase tracking-widest text-xs mb-1">Hari</span>
                </div>
                <div className="absolute -bottom-4 -right-4 text-warning/10 rotate-12 group-hover:scale-125 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]">
                  <Flame size={80} />
                </div>
              </Card>
            </div>
            
            <StreakFreezeCard />
          </>
        )}
      </m.div>

      {/* SEKSI 3: TINGKAT PENGUASAAN KURIKULUM */}
      <m.div variants={itemVariants} className="md:col-span-12">
        <div className="flex flex-col mb-8 mt-4">
          <h2 className="text-muted-foreground font-bold uppercase tracking-widest text-[10px] mb-2 flex items-center gap-2">
            <div className="size-1.5 rounded-full bg-primary shadow-[0_0_8px_rgb(var(--primary-rgb)/0.8)]" />
            Pencapaian Silabus
          </h2>
          <h3 className="text-xl md:text-2xl font-black text-foreground uppercase tracking-tight">
            Penguasaan <span className="text-primary">Materi</span>
          </h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courseMetadata.map((cat) => {
             // Fallback to empty array.
             const lessons = cat.lessons || [];
             const total = lessons.length;
             // Count completed lessons.
             const completed = lessons.filter(l => completedLessons[l._id]?.completedAt).length;
             // Calculate progress percentage.
             const percentage = total > 0 ? (completed / total) * 100 : 0;
             
             return (
               <div key={cat._id} className="relative group">
                 {/* Tombou Register Mark */}
                 <div className="absolute -top-[6px] -right-[6px] w-[14px] h-[14px] pointer-events-none z-20">
                   <div className="absolute top-0 right-0 w-[14px] h-[1px] bg-primary/20 group-hover:bg-primary transition-colors duration-500" />
                   <div className="absolute top-0 right-0 w-[1px] h-[14px] bg-primary/20 group-hover:bg-primary transition-colors duration-500" />
                 </div>

                 <Card className="bg-card border border-border/50 dark:border-white/10 p-5 rounded-2xl group shadow-[0_4px_25px_rgba(0,0,0,0.015)] group-hover:border-primary/45 transition-colors duration-500">
                    <div className="flex items-center gap-4 mb-5">
                      <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                        {percentage === 100 ? <CheckCircle2 size={24} /> : <BookOpen size={24} />}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-black uppercase tracking-tight line-clamp-1">{cat.title}</h4>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                          {completed} / {total} Pelajaran
                        </p>
                      </div>
                      <div className="text-lg font-black text-primary font-mono">
                        {Math.round(percentage)}%
                      </div>
                    </div>
                    
                    <div className="relative h-2 w-full bg-background/5 rounded-full overflow-hidden border border-border">
                      <m.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: `${percentage}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        viewport={{ once: true }}
                        className={`h-full rounded-full relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent ${
                          percentage === 100 
                            ? 'bg-success shadow-[0_0_10px_rgb(var(--success-rgb)/0.5)]' 
                            : 'bg-[linear-gradient(90deg,rgb(var(--brand-cyan-rgb)),rgb(var(--brand-blue-rgb)))] shadow-[0_0_10px_rgb(var(--brand-cyan-rgb)/0.4)]'
                        }`}
                      />
                    </div>
                  </Card>
               </div>
             );
          })}
        </div>
      </m.div>

      {/* SEKSI 4: MISI HARIAN, STATS MEMORI, DAN ANALISIS SRS */}
      <m.div variants={itemVariants} className="md:col-span-4">
        {loading ? <Skeleton className="h-[400px] w-full rounded-2xl" /> : <DailyQuests />}
      </m.div>
      
      <m.div variants={itemVariants} className="md:col-span-4">
        {loading ? <Skeleton className="h-[400px] w-full rounded-2xl" /> : <MemoryStats />}
      </m.div>

      <m.div variants={itemVariants} className="md:col-span-4">
        {loading ? <Skeleton className="h-[400px] w-full rounded-2xl" /> : <SRSAnalytics />}
      </m.div>

      {/* SEKSI 5: PETA KONTRIBUSI BELAJAR (HEATMAP) */}
      <m.div variants={itemVariants} className="md:col-span-12">
        {loading ? <Skeleton className="h-[220px] w-full rounded-2xl" /> : <Heatmap studyDays={progress.studyDays} />}
      </m.div>
    </div>
  );
}