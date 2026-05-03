"use client";

import { motion, Variants } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Flame } from "lucide-react";
import DailyQuests from "./quests/DailyQuests";
import MemoryStats from "./dashboard-stats/MemoryStats";
import SRSAnalytics from "../srs/analytics/SRSAnalytics";
import Heatmap from "./heatmap/Heatmap";
import StreakFreezeCard from "../gamification/StreakFreezeCard";
import { UserProgress } from "@/store/useProgressStore";

interface DashboardStatsProps {
  loading: boolean;
  progress: UserProgress;
  xpNeeded: number;
  xpProgress: number;
  itemVariants: Variants;
}

export default function DashboardStats({ loading, progress, xpNeeded, xpProgress, itemVariants }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 mb-20">
      {/* LEVEL & XP CARD (SPAN 8) */}
      <motion.div variants={itemVariants} className="md:col-span-8">
        {loading ? (
          <Skeleton className="h-[250px] w-full rounded-2xl" />
        ) : (
          <Card className="h-full bg-card border border-border rounded-2xl p-6 md:p-8 flex flex-col justify-center relative overflow-hidden group transition-all duration-300 hover:border-emerald-500/30 shadow-lg">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
              <div>
                <h2 className="text-muted-foreground font-bold uppercase tracking-widest text-xs md:text-xs mb-2">
                  Level Kamu
                </h2>
                <div className="flex items-baseline gap-3">
                  <span className="text-5xl md:text-6xl font-black text-foreground tracking-tighter">
                    {progress.level}
                  </span>
                  <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-3 py-1 font-bold uppercase tracking-widest text-[8px] md:text-xs shadow-none">
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
                className="h-3 bg-muted border border-border"
                indicatorClassName="bg-gradient-to-r from-emerald-400 via-primary to-blue-500"
              />
              <p className="mt-4 text-xs text-muted-foreground uppercase font-bold tracking-widest font-mono text-center md:text-right">
                Kumpulkan <span className="text-foreground">{xpNeeded} XP</span> lagi untuk naik level!
              </p>
            </div>
          </Card>
        )}
      </motion.div>

      {/* STATS HIGHLIGHT (SPAN 4) */}
      <motion.div variants={itemVariants} className="md:col-span-4 flex flex-col gap-6">
        {loading ? (
          <>
            <Skeleton className="h-[110px] w-full rounded-2xl" />
            <Skeleton className="h-[110px] w-full rounded-2xl" />
          </>
        ) : (
          <>
            <Card className="h-[140px] bg-card border border-border rounded-2xl p-5 flex flex-col justify-between group overflow-hidden relative transition-all duration-300 hover:border-amber-500/30 shadow-lg">
              <h3 className="text-amber-500/60 font-bold uppercase tracking-widest text-xs">
                Semangat Belajar
              </h3>
              <div className="flex items-end gap-2 mt-2">
                <span className="text-4xl font-black text-amber-500 tracking-tighter">
                  {progress.streak}
                </span>
                <span className="text-amber-500/80 font-bold uppercase tracking-widest text-xs mb-1">Hari</span>
              </div>
              <div className="absolute -bottom-4 -right-4 text-amber-500/10 rotate-12 group-hover:scale-125 transition-transform duration-700">
                <Flame size={80} />
              </div>
            </Card>
            
            <StreakFreezeCard />
          </>
        )}
      </motion.div>

      {/* DAILY QUESTS, MEMORY STATS, SRS ANALYTICS */}
      <motion.div variants={itemVariants} className="md:col-span-4">
        {loading ? <Skeleton className="h-[400px] w-full rounded-2xl" /> : <DailyQuests />}
      </motion.div>
      
      <motion.div variants={itemVariants} className="md:col-span-4">
        {loading ? <Skeleton className="h-[400px] w-full rounded-2xl" /> : <MemoryStats />}
      </motion.div>

      <motion.div variants={itemVariants} className="md:col-span-4">
        {loading ? <Skeleton className="h-[400px] w-full rounded-2xl" /> : <SRSAnalytics />}
      </motion.div>

      {/* HEATMAP */}
      <motion.div variants={itemVariants} className="md:col-span-12">
        {loading ? <Skeleton className="h-[220px] w-full rounded-2xl" /> : <Heatmap studyDays={progress.studyDays} />}
      </motion.div>
    </div>
  );
}
