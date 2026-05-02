"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, TrendingUp, Flame, Sprout, BookOpen, PenTool, Database } from "lucide-react";
import { useMemoryStats } from "./features/srs/stats/useMemoryStats";

export default function MemoryStats() {
  const { srsEntries, stats, total } = useMemoryStats();

  const statConfig = [
    {
      label: "Tingkat Master",
      count: stats.master,
      color: "text-emerald-500 dark:text-emerald-400",
      indicatorColor: "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]",
      icon: <Trophy size={16} />,
    },
    {
      label: "Memori Stabil",
      count: stats.intermediate,
      color: "text-blue-500 dark:text-blue-400",
      indicatorColor: "bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]",
      icon: <TrendingUp size={16} />,
    },
    {
      label: "Fase Belajar",
      count: stats.learning,
      color: "text-amber-500 dark:text-amber-400",
      indicatorColor: "bg-amber-500 shadow-[0_0_15px_rgba(251,191,36,0.5)]",
      icon: <Flame size={16} />,
    },
    {
      label: "Materi Baru",
      count: stats.new,
      color: "text-muted-foreground",
      indicatorColor: "bg-slate-400 dark:bg-slate-500 shadow-none",
      icon: <Sprout size={16} />,
    },
  ];

  return (
    <Card className="bg-card p-6 md:p-8 lg:p-10 rounded-[2.5rem] md:rounded-[3rem] border-border relative overflow-hidden h-full flex flex-col neo-card shadow-none">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,238,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,238,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none opacity-50" />

      <header className="flex items-center justify-between mb-8 md:mb-10 relative z-10">
        <div className="flex items-center gap-3 md:gap-4">
          <Card className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center neo-inset shadow-none shrink-0">
            <Database size={20} className="text-primary md:w-6 md:h-6" />
          </Card>
          <div className="text-left">
            <h3 className="text-foreground font-black uppercase tracking-widest text-xs md:text-sm">
              Status Hafalan
            </h3>
            <span className="block text-[9px] md:text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">Distribusi Memori Pintar</span>
          </div>
        </div>
        <Badge
          variant="outline"
          className="bg-muted border-border text-primary px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-[9px] md:text-[10px] font-bold tracking-widest uppercase neo-inset h-auto"
        >
          {srsEntries.length} Unit
        </Badge>
      </header>

      <div className="space-y-6 md:space-y-8 mb-8 md:mb-10 relative z-10 flex-1">
        {statConfig.map((stat, i) => (
          <StatBar
            key={i}
            label={stat.label}
            count={stat.count}
            total={total}
            indicatorColor={stat.indicatorColor}
            icon={stat.icon}
            colorClass={stat.color}
          />
        ))}
      </div>

      <div className="pt-6 md:pt-8 border-t border-border grid grid-cols-2 gap-4 md:gap-5 relative z-10 mt-auto">
        <Link
          href="/library/vocab"
          className="group relative p-4 md:p-5 bg-muted rounded-2xl md:rounded-3xl border border-border text-[9px] md:text-[10px] font-bold text-center uppercase tracking-widest text-muted-foreground transition-all neo-card shadow-none active:translate-y-1 hover:text-primary hover:border-primary/30 hover:bg-primary/5"
        >
          <div className="flex flex-col items-center gap-2 md:gap-3">
            <BookOpen size={18} className="md:w-5 md:h-5 group-hover:scale-110 transition-transform duration-300" />
            <span>Koleksi Kata</span>
          </div>
        </Link>
        <Link
          href="/courses/n5/kanji"
          className="group relative p-4 md:p-5 bg-muted rounded-2xl md:rounded-3xl border border-border text-[9px] md:text-[10px] font-bold text-center uppercase tracking-widest text-muted-foreground transition-all neo-card shadow-none active:translate-y-1 hover:text-purple-500 hover:border-purple-500/30 hover:bg-purple-500/5"
        >
          <div className="flex flex-col items-center gap-2 md:gap-3">
            <PenTool size={18} className="md:w-5 md:h-5 group-hover:scale-110 transition-transform duration-300" />
            <span>Daftar Kanji</span>
          </div>
        </Link>
      </div>
    </Card>
  );
}

interface StatBarProps {
  label: string;
  count: number;
  total: number;
  indicatorColor: string;
  icon: React.ReactNode;
  colorClass: string;
}

function StatBar({ label, count, total, indicatorColor, icon, colorClass }: StatBarProps) {
  const percent = total > 1 || count > 0 ? (count / total) * 100 : 0;

  return (
    <div className="group cursor-default">
      <div className="flex justify-between text-[10px] md:text-[11px] font-bold uppercase tracking-widest mb-2.5 md:mb-3">
        <span className="text-muted-foreground flex items-center gap-2.5 md:gap-3 transition-colors group-hover:text-foreground">
          <span className={colorClass}>{icon}</span> {label}
        </span>
        <div className="flex items-center gap-2.5 md:gap-3">
          <span className="text-muted-foreground/40 font-mono font-medium">{percent.toFixed(0)}%</span>
          <Badge variant="outline" className="text-foreground bg-muted px-2 py-1 md:px-3 md:py-1 rounded-lg shadow-none font-mono border-border h-auto neo-inset">
            {String(count).padStart(3, "0")}
          </Badge>
        </div>
      </div>

      <Progress 
        value={percent} 
        className="h-2 md:h-2.5 bg-muted" 
        indicatorClassName={indicatorColor}
      />
    </div>
  );
}
