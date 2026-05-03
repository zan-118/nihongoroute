"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity } from "lucide-react";
import { useHeatmap, getBoxStyle } from "./useHeatmap";

interface Props {
  studyDays: Record<string, number>;
}

export default function Heatmap({ studyDays }: Props) {
  const { days } = useHeatmap();

  return (
    <Card className="bg-card dark:bg-[#0a0c10] p-6 md:p-8 lg:p-10 rounded-[2.5rem] md:rounded-[3rem] border border-border dark:border-white/5 relative overflow-hidden neo-card shadow-lg transition-colors duration-300">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,238,255,0.01)_1px,transparent_1px)] bg-[size:100%_4px] opacity-20 dark:opacity-50 pointer-events-none" />

      <header className="flex items-center justify-between mb-8 md:mb-10 relative z-10">
        <div className="flex items-center gap-3 md:gap-4">
          <Card className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center neo-inset shadow-none shrink-0">
            <Activity size={20} className="text-primary md:w-6 md:h-6" />
          </Card>
          <div className="text-left">
            <h3 className="text-foreground font-black uppercase tracking-widest text-xs md:text-sm">
              Aktivitas Belajar
            </h3>
            <span className="block text-[9px] md:text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">Riwayat 35 Hari</span>
          </div>
        </div>
        <Badge
          variant="outline"
          className="bg-muted dark:bg-[#121620] border border-border dark:border-white/5 text-muted-foreground px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-[9px] md:text-[10px] font-bold tracking-widest uppercase neo-inset h-auto"
        >
          Log Aktif
        </Badge>
      </header>

      <div className="flex flex-wrap gap-2 md:gap-3 lg:gap-4 relative z-10 justify-start">
        {days.map((day, index) => {
          const value = studyDays?.[day] ?? 0;

          return (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.01, duration: 0.4 }}
              key={day}
              className={`w-6 h-6 md:w-8 md:h-8 lg:w-9 lg:h-9 rounded-lg md:rounded-xl border transition-all duration-300 hover:scale-125 hover:z-20 cursor-help group relative ${getBoxStyle(value)}`}
            >
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 md:mb-3 w-max px-3 py-2 md:px-4 md:py-3 bg-black/95 dark:bg-card backdrop-blur-xl border border-white/10 dark:border-border text-white dark:text-foreground text-[9px] md:text-[10px] font-bold uppercase tracking-widest rounded-xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none shadow-2xl z-30 neo-card scale-90 group-hover:scale-100 origin-bottom">
                {day} <span className="text-white/20 dark:text-border mx-2">|</span> <span className="text-primary">{value} KATA</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="flex items-center gap-3 md:gap-4 mt-8 md:mt-10 justify-end relative z-10">
        <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Sedikit
        </span>
        <div className="flex gap-1.5 md:gap-2">
          <div className="w-4 h-4 md:w-5 md:h-5 rounded-[6px] bg-muted border border-border neo-inset opacity-30"></div>
          <div className="w-4 h-4 md:w-5 md:h-5 rounded-[6px] bg-primary/20 border border-primary/30 neo-card"></div>
          <div className="w-4 h-4 md:w-5 md:h-5 rounded-[6px] bg-primary/50 border border-primary/60 neo-card"></div>
          <div className="w-4 h-4 md:w-5 md:h-5 rounded-[6px] bg-primary border-border neo-card"></div>
        </div>
        <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-primary drop-shadow-sm dark:drop-shadow-[0_0_8px_rgba(0,238,255,0.5)]">
          Banyak
        </span>
      </div>
    </Card>
  );
}
