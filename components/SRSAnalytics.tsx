"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, BarChart2, AlertTriangle, Zap, ShieldCheck } from "lucide-react";
import { useSRSAnalytics } from "./features/srs/analytics/useSRSAnalytics";

export default function SRSAnalytics() {
  const { total, rawData, maxCount } = useSRSAnalytics();

  if (total === 0) return null;

  const data = rawData.map((item) => {
    let icon = <AlertTriangle size={14} />;
    if (item.label === "Fragile") icon = <Zap size={14} />;
    if (item.label === "Stable") icon = <BarChart2 size={14} />;
    if (item.label === "Master") icon = <ShieldCheck size={14} />;

    return { ...item, icon };
  });

  return (
    <Card className="bg-[#0a0c10] p-8 rounded-[3rem] border-white/5 relative overflow-hidden neo-card shadow-none flex flex-col h-full">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,238,255,0.05),transparent_50%)]" />
      
      <header className="flex items-center justify-between mb-10 relative z-10">
        <div className="flex items-center gap-4">
          <Card className="w-12 h-12 rounded-xl bg-purple-500/10 border-purple-500/20 flex items-center justify-center neo-inset shadow-none">
            <LineChart size={24} className="text-purple-400" />
          </Card>
          <div>
            <h3 className="text-white font-black uppercase tracking-widest text-sm">Analitik Retensi</h3>
            <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Stabilitas Memori (Ease Factor)</span>
          </div>
        </div>
        <Badge variant="outline" className="bg-purple-500/5 border-purple-500/20 text-purple-400 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">
          Memory Intelligence
        </Badge>
      </header>

      {/* CUSTOM SVG CHART */}
      <div className="flex-1 flex flex-col justify-between gap-8 relative z-10">
        <div className="flex items-end justify-between gap-4 h-48 px-2">
          {data.map((item, i) => {
            const height = (item.count / maxCount) * 100;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                <div className="relative w-full flex flex-col items-center">
                  <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-white text-black text-[9px] font-black px-2 py-1 rounded uppercase tracking-tighter whitespace-nowrap z-20">
                    {item.count} Items
                  </div>
                  
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
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{item.label}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* INSIGHT LIST */}
        <div className="grid grid-cols-1 gap-3 mt-4">
          {data.map((item, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                <div>
                  <p className="text-[10px] font-black text-white uppercase tracking-tight">{item.label}</p>
                  <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">{item.desc}</p>
                </div>
              </div>
              <span className="font-mono text-xs font-bold text-slate-400">
                {Math.round((item.count / total) * 100)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
