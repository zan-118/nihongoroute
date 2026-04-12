"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

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
    return "bg-cyber-bg border-white/5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]";
  if (value < 10)
    return "bg-cyber-neon/20 border-cyber-neon/30 shadow-[0_0_5px_rgba(0,255,239,0.1)]";
  if (value < 30)
    return "bg-cyber-neon/60 border-cyber-neon/80 shadow-[0_0_10px_rgba(0,255,239,0.4)]";
  return "bg-cyber-neon border-white shadow-[0_0_15px_rgba(0,255,239,0.8),inset_0_0_10px_rgba(255,255,255,0.8)]";
}

export default function Heatmap({ studyDays }: Props) {
  const days = useMemo(() => generateLastNDays(35), []);

  return (
    <section className="bg-cyber-surface p-6 md:p-8 rounded-[2.5rem] border border-white/5 shadow-[15px_15px_40px_rgba(0,0,0,0.6),-10px_-10px_30px_rgba(255,255,255,0.02)] relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:15px_15px] opacity-30 pointer-events-none" />

      <header className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center shadow-[0_0_10px_rgba(168,85,247,0.2)]">
            <span className="text-purple-400 text-sm">📅</span>
          </div>
          <h3 className="text-white font-black uppercase tracking-widest text-sm md:text-base drop-shadow-md">
            Study Matrix
          </h3>
        </div>
        <span className="bg-cyber-bg border border-white/10 text-[#c4cfde] px-3 py-1.5 rounded-full text-[9px] font-black tracking-[0.2em] uppercase shadow-inner hidden md:block">
          Last 35 Days
        </span>
      </header>

      <div className="flex flex-wrap gap-2 md:gap-3 relative z-10 justify-start">
        {days.map((day, index) => {
          const value = studyDays?.[day] ?? 0;

          return (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.01, duration: 0.3 }}
              key={day}
              className={`w-6 h-6 md:w-8 md:h-8 rounded-md md:rounded-lg border transition-all duration-300 hover:scale-125 hover:z-20 cursor-help group relative ${getBoxStyle(value)}`}
            >
              {value > 0 && (
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/50 rounded-t-md opacity-50" />
              )}

              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-3 py-2 bg-cyber-surface border border-white/10 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-[0_10px_20px_rgba(0,0,0,0.5)] z-30">
                {day}{" "}
                <span className="text-cyber-neon ml-1">{value} Reviews</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="flex items-center gap-3 mt-8 justify-end relative z-10">
        <span className="text-[9px] font-black uppercase tracking-widest text-white/40">
          Less
        </span>
        <div className="flex gap-1.5">
          <div className="w-4 h-4 rounded-[4px] bg-cyber-bg border border-white/5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]"></div>
          <div className="w-4 h-4 rounded-[4px] bg-cyber-neon/20 border border-cyber-neon/30 shadow-[0_0_5px_rgba(0,255,239,0.1)]"></div>
          <div className="w-4 h-4 rounded-[4px] bg-cyber-neon/60 border border-cyber-neon/80 shadow-[0_0_10px_rgba(0,255,239,0.4)]"></div>
          <div className="w-4 h-4 rounded-[4px] bg-cyber-neon border-white shadow-[0_0_15px_rgba(0,255,239,0.8),inset_0_0_5px_rgba(255,255,255,0.8)]"></div>
        </div>
        <span className="text-[9px] font-black uppercase tracking-widest text-cyber-neon drop-shadow-[0_0_5px_rgba(0,255,239,0.5)]">
          More
        </span>
      </div>
    </section>
  );
}
