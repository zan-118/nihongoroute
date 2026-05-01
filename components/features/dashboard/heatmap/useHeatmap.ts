import { useMemo } from "react";

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

export function getBoxStyle(value: number): string {
  if (!value)
    return "bg-black/40 border-white/5 neo-inset shadow-none opacity-30";
  if (value < 10)
    return "bg-cyber-neon/20 border-cyber-neon/30 shadow-[0_0_10px_rgba(0,238,255,0.1)] neo-card shadow-none";
  if (value < 30)
    return "bg-cyber-neon/50 border-cyber-neon/60 shadow-[0_0_20px_rgba(0,238,255,0.3)] neo-card shadow-none";
  return "bg-cyber-neon border-white shadow-[0_0_25px_rgba(0,238,255,0.7)] neo-card shadow-none";
}

export function useHeatmap() {
  const days = useMemo(() => generateLastNDays(35), []);
  return { days };
}
