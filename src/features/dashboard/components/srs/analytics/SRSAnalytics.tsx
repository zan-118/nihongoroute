"use client";

/**
 * @file SRSAnalytics.tsx
 * @description Komponen visual bagan analisis stabilitas memori (SRS Memory Ease Analytics).
 * Menggunakan visualisasi diagram SVG kustom adaptif untuk memetakan pembagian kartu SRS (Fragile, Stable, Master) berdasarkan ease factor.
 */

// ======================
// IMPOR
// ======================
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, BarChart2, AlertTriangle, Zap, ShieldCheck } from "@/components/ui/icons";
import { useSRSAnalytics } from "./useSRSAnalytics";

// ======================
// EKSEKUSI UTAMA
// ======================

/**
 * SRS memory stability analytics component.
 * Shows card distribution by ease factor.
 */
export default function SRSAnalytics() {
  const { total, rawData, maxCount } = useSRSAnalytics();

  // No data. Return null.
  if (total === 0) return null;

  // Assign icon based on category.
  const data = rawData.map((item) => {
    let icon = <AlertTriangle size={14} />;
    if (item.label === "Fragile") icon = <Zap size={14} />;
    if (item.label === "Stable") icon = <BarChart2 size={14} />;
    if (item.label === "Master") icon = <ShieldCheck size={14} />;

    return { ...item, icon };
  });

  return (
    <Card className="bg-card p-8 rounded-2xl md:rounded-3xl border-border relative overflow-hidden neo-card shadow-none flex flex-col h-full">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgb(var(--primary-rgb)/0.05),transparent_50%)]" />
      
      <header className="flex items-center justify-between mb-10 relative z-10">
        <div className="flex items-center gap-4">
          <Card className="size-12 rounded-xl bg-primary/10 border-primary/20 flex items-center justify-center neo-inset shadow-none">
            <LineChart size={24} className="text-primary" />
          </Card>
          <div>
            <h3 className="text-foreground uppercase tracking-widest text-sm">Kekuatan Ingatan</h3>
            <span className="block text-xs text-muted-foreground font-bold uppercase tracking-widest mt-1">Stabilitas Memori (Ease Factor)</span>
          </div>
        </div>
        <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest">
          Kecerdasan Memori
        </Badge>
      </header>

      {/* CUSTOM SVG CHART */}
      <div className="flex-1 flex flex-col justify-between gap-8 relative z-10">
        <div className="flex items-end justify-between gap-4 h-48 px-2">
          {data.map((item) => {
            // Calculate bar height percentage.
            const height = (item.count / maxCount) * 100;
            return (
              <div key={item.label} className="flex-1 flex flex-col items-center gap-4 group">
                <div className="relative w-full flex flex-col items-center">
                  <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-foreground text-background text-xs font-black px-2 py-1 rounded uppercase tracking-tighter whitespace-nowrap z-20">
                    {item.count} Items
                  </div>
                  
                  {/* Apply dynamic height and color styles. */}
                  <div 
                    className="w-full max-w-[40px] rounded-t-xl transition-all duration-1000 ease-out relative group-hover:brightness-125"
                    style={{ 
                      height: `${height}%`, 
                      backgroundColor: `${item.color}20`,
                      border: `1px solid ${item.color}40`,
                      boxShadow: `0 0 20px ${item.color}10`
                    }}
                  >
                    <div 
                      className="absolute bottom-0 left-0 right-0 h-1 rounded-full animate-pulse"
                      style={{ backgroundColor: item.color }}
                    />
                  </div>
                </div>
                <div className="text-center">
                  <div style={{ color: item.color }} className="flex justify-center mb-1">{item.icon}</div>
                  <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">{item.label}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* INSIGHT LIST */}
        <div className="grid grid-cols-1 gap-3 mt-4">
          {data.map((item) => (
            <div key={item.label} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="size-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                <div>
                  <p className="text-xs font-black text-foreground uppercase tracking-tight">{item.label}</p>
                  <p className="text-[8px] text-muted-foreground font-bold uppercase tracking-widest">{item.desc}</p>
                </div>
              </div>
              <span className="font-mono text-xs font-bold text-muted-foreground">
                {Math.round((item.count / total) * 100)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}