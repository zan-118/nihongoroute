"use client";

import { useMemo } from "react";

/* ============================= */
/* TYPES */
/* ============================= */
interface Props {
  studyDays: Record<string, number>;
}

/* ============================= */
/* HELPERS */
/* ============================= */
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

// Logika warna Neumorphic/Glow berdasarkan intensitas belajar
function getBoxStyle(value: number): string {
  if (!value) return "bg-white/5 border-white/5"; // Kosong
  if (value < 10) return "bg-[#0ef]/20 border-[#0ef]/30"; // Ringan
  if (value < 30) return "bg-[#0ef]/60 border-[#0ef]/80"; // Sedang
  return "bg-[#0ef] border-[#0ef] shadow-[0_0_12px_#0ef]"; // Intens (Glow)
}

/* ============================= */
/* COMPONENT */
/* ============================= */
export default function Heatmap({ studyDays }: Props) {
  // Generate 30 hari terakhir
  const days = useMemo(() => generateLastNDays(30), []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-[#0ef] font-black uppercase tracking-widest text-xs md:text-sm">
          📅 Study Heatmap
        </h3>
        <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">
          30 Hari Terakhir
        </span>
      </div>

      {/* Grid Heatmap - Disesuaikan agar muat 30 hari dengan cantik */}
      <div className="flex flex-wrap gap-2 md:gap-3">
        {days.map((day) => {
          const value = studyDays?.[day] ?? 0;

          return (
            <div
              key={day}
              className={`w-6 h-6 md:w-8 md:h-8 rounded-md md:rounded-lg border transition-all duration-500 hover:scale-125 cursor-help group relative ${getBoxStyle(value)}`}
            >
              {/* Tooltip Hover */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-3 py-2 bg-[#1e2024] border border-white/10 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl">
                {day} <span className="text-[#0ef] ml-1">{value} Reviews</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend / Keterangan */}
      <div className="flex items-center gap-2 mt-6 justify-end text-[9px] font-bold uppercase tracking-widest text-[#c4cfde]/40">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-sm bg-white/5 border border-white/5"></div>
          <div className="w-3 h-3 rounded-sm bg-[#0ef]/20 border border-[#0ef]/30"></div>
          <div className="w-3 h-3 rounded-sm bg-[#0ef]/60 border border-[#0ef]/80"></div>
          <div className="w-3 h-3 rounded-sm bg-[#0ef] shadow-[0_0_5px_#0ef]"></div>
        </div>
        <span>More</span>
      </div>
    </div>
  );
}
