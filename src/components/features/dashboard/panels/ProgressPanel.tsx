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
const KanjiProgressGrid = dynamic(() => import("../KanjiProgressGrid"), { 
  ssr: false,
  loading: () => <div className="h-[200px] w-full animate-pulse bg-muted rounded-lg" />
});

const WeakPointPanel = dynamic(() => import("../WeakPointPanel"), {
  ssr: false,
  loading: () => <div className="h-[120px] w-full animate-pulse bg-muted rounded-[34px]" />
});

const JLPTReadinessCard = dynamic(() => import("../JLPTReadinessCard"), {
  ssr: false,
  loading: () => <div className="h-[460px] w-full animate-pulse bg-muted rounded-[34px]" />
});

// ==========================================
// ANTARMUKA & PROPS (INTERFACES)
// ==========================================
interface ProgressPanelProps {
  loading: boolean;
  progress: {
    xp: number;
    level: number;
    streak: number;
    studyDays: Record<string, number>;
  };
  xpNeeded: number;
  xpProgress: number;
  itemVariants: Variants;
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
      <JLPTReadinessCard
        loading={loading}
        courseMetadata={courseMetadata as ReadinessCourseCategory[]}
      />

      <NextActionPanel />

      <LearningTimelinePanel />

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
        <div className="p-[21px] rounded-[34px] bg-card/30  border border-border">
          <KanjiProgressGrid />
        </div>
        
        <WeakPointPanel />
      </section>
    </div>
  );
}
