/**
 * LOKASI FILE: components/Heatmap.tsx
 * KONSEP: Mobile-First Neumorphic (Grafik Aktivitas)
 */

"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity } from "lucide-react";

interface Props {
  studyDays: Record<string, number>;
}

function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function generateLastNDays(n: number): string[] {
  const days: string[] = [];
  const today = new Date();

  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push(formatLocalDate(d));
  }
  return days;
}

function getBoxStyle(value: number): string {
  if (!value)
    return "bg-black/40 border-white/5 neo-inset shadow-none opacity-30";
  if (value < 10)
    return "bg-cyber-neon/20 border-cyber-neon/30 shadow-[0_0_10px_rgba(0,238,255,0.1)] neo-card shadow-none";
  if (value < 30)
    return "bg-cyber-neon/50 border-cyber-neon/60 shadow-[0_0_20px_rgba(0,238,255,0.3)] neo-card shadow-none";
  return "bg-cyber-neon border-white shadow-[0_0_25px_rgba(0,238,255,0.7)] neo-card shadow-none";
}

export default function Heatmap({ studyDays }: Props) {
  const days = useMemo(() => generateLastNDays(35), []);

  return (
    <Card className="bg-[#0a0c10] p-6 md:p-8 lg:p-10 rounded-[2.5rem] md:rounded-[3rem] border-white/5 relative overflow-hidden neo-card shadow-none">
      {/* Background patterns */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,238,255,0.01)_1px,transparent_1px)] bg-[size:100%_4px] opacity-50 pointer-events-none" />

      <header className="flex items-center justify-between mb-8 md:mb-10 relative z-10">
        <div className="flex items-center gap-3 md:gap-4">
          <Card className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-cyber-neon/10 border-cyber-neon/20 flex items-center justify-center neo-inset shadow-none shrink-0">
            <Activity size={20} className="text-cyber-neon md:w-6 md:h-6" />
          </Card>
          <div className="text-left">
            <h3 className="text-white font-black uppercase tracking-widest text-xs md:text-sm">
              Aktivitas Belajar
            </h3>
            <span className="block text-[9px] md:text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Riwayat 35 Hari</span>
          </div>
        </div>
        <Badge
          variant="outline"
          className="bg-[#121620] border-white/5 text-slate-500 px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-[9px] md:text-[10px] font-bold tracking-widest uppercase neo-inset h-auto"
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
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 md:mb-3 w-max px-3 py-2 md:px-4 md:py-3 bg-black/95 backdrop-blur-xl border border-white/10 text-white text-[9px] md:text-[10px] font-bold uppercase tracking-widest rounded-xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none shadow-[0_20px_40px_rgba(0,0,0,0.8)] z-30 neo-card shadow-none scale-90 group-hover:scale-100 origin-bottom">
                {day} <span className="text-white/20 mx-2">|</span> <span className="text-cyber-neon">{value} KATA</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="flex items-center gap-3 md:gap-4 mt-8 md:mt-10 justify-end relative z-10">
        <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-500">
          Sedikit
        </span>
        <div className="flex gap-1.5 md:gap-2">
          <div className="w-4 h-4 md:w-5 md:h-5 rounded-[6px] bg-black/40 border border-white/5 neo-inset opacity-30"></div>
          <div className="w-4 h-4 md:w-5 md:h-5 rounded-[6px] bg-cyber-neon/20 border border-cyber-neon/30 neo-card"></div>
          <div className="w-4 h-4 md:w-5 md:h-5 rounded-[6px] bg-cyber-neon/50 border border-cyber-neon/60 neo-card"></div>
          <div className="w-4 h-4 md:w-5 md:h-5 rounded-[6px] bg-cyber-neon border-white neo-card"></div>
        </div>
        <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-cyber-neon drop-shadow-[0_0_8px_rgba(0,238,255,0.5)]">
          Banyak
        </span>
      </div>
    </Card>
  );
}
