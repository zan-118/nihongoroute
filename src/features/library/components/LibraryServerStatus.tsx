/**
 * @file LibraryServerStatus.tsx
 * @description Komponen visualizer status kesiapan modul materi pembelajaran secara luring (offline) di NihongoRoute.
 * Menampilkan diagram indikator kesiapan materi menggunakan animasi CSS murni yang super cepat dan estetika siber-glass.
 */

// ==========================================
// IMPOR UTAMA
// ==========================================
import React from "react";
import { Server } from "@/components/ui/icons";
import { Card } from "@/components/ui/card";

// ==========================================
// KOMPONEN UTAMA: LibraryServerStatus
// ==========================================
/**
 * LibraryServerStatus component.
 * Render offline material readiness status. Use CSS animation for performance.
 * 
 * @returns React element representing server status card.
 */
export function LibraryServerStatus() {
  return (
    <Card className="p-8 md:p-10 rounded-2xl md:rounded-3xl border border-border bg-[rgb(var(--card-rgb)/0.35)]  shadow-[0_0_50px_rgba(var(--primary-rgb),0.02)] min-w-[320px] font-sans glass">
      <div className="flex items-center justify-between mb-6">
         <div className="flex items-center gap-3 md:gap-4 text-muted-foreground font-black uppercase text-xs tracking-widest">
            <Server size={16} className="text-primary/70 animate-pulse" /> Kesiapan Materi
         </div>
         <span className="text-xs font-mono text-primary font-black">100% Ready</span>
      </div>
      
      {/* Batang Visualizer Indikator Kesiapan (Animasi Pulse) */}
      <div className="flex gap-2.5">
         {/* Generate 6 visualizer bars */}
         {[...Array(6)].map((_, i) => (
            <div key={`bar-${i}`} className="flex-1 h-12 md:h-14 bg-[rgb(var(--primary-rgb)/0.08)] border border-border/30 rounded-full overflow-hidden flex items-end">
               <div 
                 className="w-full bg-primary/80 animate-pulse rounded-full" 
                 style={{ 
                   // Calculate staggered height and animation delay for wave effect
                   height: `${30 + (i * 12) % 70}%`,
                   animationDelay: `${i * 0.12}s`,
                   animationDuration: '1.8s'
                 }} 
               />
            </div>
         ))}
      </div>
    </Card>
  );
}