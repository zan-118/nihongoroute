import React from "react";
import { Server } from "lucide-react";
import { Card } from "@/components/ui/card";

/**
 * Komponen visualizer kesiapan materi di halaman pustaka.
 * Dioptimalkan tanpa Framer Motion untuk performa ekstrem.
 */
export function LibraryServerStatus() {
  return (
    <Card className="p-8 md:p-10 rounded-3xl md:rounded-[3.5rem] bg-[rgba(var(--card-rgb),0.3)] backdrop-blur-sm border-border neo-card shadow-none min-w-[320px]">
      <div className="flex items-center justify-between mb-6">
         <div className="flex items-center gap-3 md:gap-4 text-muted-foreground font-bold uppercase text-xs md:text-xs tracking-widest">
            <Server size={16} className="md:w-5 md:h-5" /> Kesiapan Materi
         </div>
         <span className="text-xs md:text-xs font-mono text-primary font-bold">100%</span>
      </div>
      <div className="flex gap-2 md:gap-2.5">
         {[...Array(6)].map((_, i) => (
           <div key={i} className="flex-1 h-8 md:h-12 bg-[rgba(var(--primary-rgb),0.1)] rounded-full overflow-hidden flex items-end">
              <div 
                className="w-full bg-primary animate-pulse" 
                style={{ 
                  height: `${30 + (i * 10) % 70}%`,
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: '1.5s'
                }} 
              />
           </div>
         ))}
      </div>
    </Card>
  );
}
