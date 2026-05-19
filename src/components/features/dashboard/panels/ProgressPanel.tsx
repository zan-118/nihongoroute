"use client";

import dynamic from "next/dynamic";
import DashboardStats from "../DashboardStats";
import { Variants } from "framer-motion";
import { UserProgress } from "@/store/types";

const KanjiProgressGrid = dynamic(() => import("../KanjiProgressGrid"), { 
  ssr: false,
  loading: () => <div className="h-[200px] w-full animate-pulse bg-muted rounded-2xl" />
});

interface ProgressPanelProps {
  loading: boolean;
  progress: UserProgress;
  xpNeeded: number;
  xpProgress: number;
  itemVariants: Variants;
  courseMetadata: any;
}

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
      <DashboardStats 
        loading={loading} 
        progress={progress} 
        xpNeeded={xpNeeded} 
        xpProgress={xpProgress} 
        itemVariants={itemVariants} 
        courseMetadata={courseMetadata}
      />
      
      <section className="space-y-[34px]">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-[13px]">
            <div className="w-[34px] h-[1px] bg-primary/40" />
            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
              Analisis Mendalam
            </h2>
          </div>
          <h3 className="text-3xl font-bold tracking-tight text-foreground">
            Data <span className="text-muted-foreground font-medium">Belajarmu</span>
          </h3>
        </div>
        <div className="p-[21px] rounded-[34px] bg-card/30 backdrop-blur-sm border border-border">
          <KanjiProgressGrid />
        </div>
      </section>
    </div>
  );
}
