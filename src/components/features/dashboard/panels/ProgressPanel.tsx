"use client";

/**
 * @file ProgressPanel.tsx
 * @description Komponen panel Kemajuan (Progress Panel) pada dashboard NihongoRoute.
 * Menyusun data statistik menyeluruh dari DashboardStats, peta penguasaan Kanji,
 * serta panel deteksi titik lemah belajar (WeakPointPanel) dengan loading state yang dioptimasi.
 *
 * @package components/features/dashboard/panels
 * @project NihongoRoute
 */

// ==========================================
// IMPOR
// ==========================================
import dynamic from "next/dynamic";
import DashboardStats from "../DashboardStats";
import LearningTimelinePanel from "@/components/features/ecosystem/LearningTimelinePanel";
import NextActionPanel from "@/components/features/ecosystem/NextActionPanel";
import { Variants } from "framer-motion";
import type { ReadinessCourseCategory } from "@/lib/readiness";

// ==========================================
// ELEMEN DINAMIS (LAZY LOADING)
// ==========================================

/**
 * Lazy-loaded Kanji progress grid component.
 * Prevents blocking main thread during initial dashboard render.
 */
const KanjiProgressGrid = dynamic(() => import("../KanjiProgressGrid"), { 
  ssr: false,
  loading: () => <div className="h-[200px] w-full animate-pulse bg-muted rounded-lg" />
});

/**
 * Lazy-loaded weak point analysis panel.
 * Loaded client-side to handle dynamic user performance calculations.
 */
const WeakPointPanel = dynamic(() => import("../WeakPointPanel"), {
  ssr: false,
  loading: () => <div className="h-[120px] w-full animate-pulse bg-muted rounded-[34px]" />
});

/**
 * Lazy-loaded JLPT readiness card.
 * Displays progress metrics mapped to JLPT levels.
 */
const JLPTReadinessCard = dynamic(() => import("../JLPTReadinessCard"), {
  ssr: false,
  loading: () => <div className="h-[460px] w-full animate-pulse bg-muted rounded-[34px]" />
});

// ==========================================
// ANTARMUKA & PROPS (INTERFACES)
// ==========================================

/**
 * Properties for the ProgressPanel component.
 */
interface ProgressPanelProps {
  /** Indicates if the dashboard data is currently fetching */
  loading: boolean;
  /** User progress statistics */
  progress: {
    xp: number;
    level: number;
    streak: number;
    studyDays: Record<string, number>;
  };
  /** Total XP required to reach the next level */
  xpNeeded: number;
  /** Current XP accumulated in the current level */
  xpProgress: number;
  /** Framer motion animation variants for child elements */
  itemVariants: Variants;
  /** Metadata structure of available courses and lessons */
  courseMetadata: Array<{
    id?: string;
    _id?: string;
    title: string;
    slug: string;
    lessons: Array<{
      id?: string;
      _id?: string;
      title: string;
      slug: string;
    }>;
  }>;
}

// ==========================================
// KOMPONEN UTAMA
// ==========================================

/**
 * ProgressPanel component.
 * Renders the user's learning progress, JLPT readiness, timeline, stats, and kanji mastery grid.
 *
 * @param props - Component properties.
 * @returns The rendered progress panel layout.
 */
export function ProgressPanel({
  loading,
  progress,
  xpNeeded,
  xpProgress,
  itemVariants,
  courseMetadata,
}: ProgressPanelProps) {
  return (
    <div className="space-y-[89px]">
      {/* JLPT Readiness assessment card */}
      <JLPTReadinessCard
        loading={loading}
        courseMetadata={courseMetadata as ReadinessCourseCategory[]}
      />

      {/* Next recommended learning action */}
      <NextActionPanel />

      {/* Timeline of learning activities */}
      <LearningTimelinePanel />

      {/* General dashboard statistics */}
      <DashboardStats 
        loading={loading} 
        progress={progress} 
        xpNeeded={xpNeeded} 
        xpProgress={xpProgress} 
        itemVariants={itemVariants} 
        courseMetadata={courseMetadata as unknown as Array<{
          _id: string;
          title: string;
          slug: string;
          lessons: Array<{
            _id: string;
            title: string;
            slug: string;
          }>;
        }>}
      />
      
      {/* Detailed analysis section containing Kanji grid and weak points */}
      <section className="space-y-[34px]">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-[13px]">
            <div className="w-[34px] h-[1px] bg-primary/40" />
            <h2 className="text-[10px] uppercase tracking-[0.2em] text-primary">
              Analisis Mendalam
            </h2>
          </div>
          <h3 className="text-3xl tracking-tight text-foreground">
            Data <span className="text-muted-foreground font-medium">Belajarmu</span>
          </h3>
        </div>
        
        {/* Kanji progress grid container */}
        <div className="p-[21px] rounded-[34px] bg-card/30  border border-border">
          <KanjiProgressGrid />
        </div>
        
        {/* Weak point analysis panel */}
        <WeakPointPanel />
      </section>
    </div>
  );
}