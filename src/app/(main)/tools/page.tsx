/**
 * @file page.tsx
 * @description Main Japanese learning utilities directory page route component.
 * @module ToolsPage
 */

"use client";

// ==========================================
// Import & Dependencies
// ==========================================
import React from "react";
import { m } from "framer-motion";
import { Wrench, ChevronRight, Zap } from "@/components/ui/icons";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { tools, type ToolItem } from "@/lib/constants/tools";

/**
 * ToolsPage component.
 * Renders dashboard containing links to various Japanese learning utilities.
 *
 * @returns {React.JSX.Element} Rendered tools directory page.
 */
export default function ToolsPage() {
 return (
 <div className="w-full flex-1 relative overflow-hidden flex flex-col bg-transparent transition-colors duration-300 pt-12 pb-24 px-4 md:px-8">
 {/* Efek Latar Belakang */}
 {/* Radial gradient background overlay for visual depth */}
 <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] pointer-events-none" />

 <div className="max-w-5xl mx-auto w-full relative z-10 flex flex-col h-full">
 <header className="mb-12">
 <div className="flex items-center gap-3 mb-4">
 <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shadow-lg">
 <Wrench className="text-primary" size={24} />
 </div>
 <div>
 <h1 className="text-4xl md:text-5xl text-foreground uppercase tracking-tight italic">
 Pusat <span className="text-primary">Peralatan</span>
 </h1>
 <p className="text-muted-foreground text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] mt-1">
 Utilities & Quick Learning Tools
 </p>
 </div>
 </div>
 <p className="text-muted-foreground text-sm max-w-2xl leading-relaxed">
 Kumpulan alat bantu belajar mandiri untuk mempercepat penguasaan bahasa Jepangmu.
 Dari pengenalan aksara hingga latihan hafalan intensif.
 </p>
 </header>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
 {tools.map((tool, idx) => (
 <m.div
 key={tool.title}
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: idx * 0.05 }}
 >
 <Link data-tour="tool-card" href={tool.href}>
 <div className="relative group">
 {/* Tombou Register Mark (L-shape offset 6px outside rounded-2xl) */}
 <div className="absolute -top-[6px] -right-[6px] w-[14px] h-[14px] pointer-events-none z-20">
 <div className="absolute top-0 right-0 w-[14px] h-[1px] bg-primary/20 dark:bg-[#005C66] group-hover:bg-primary transition-colors duration-500" />
 <div className="absolute top-0 right-0 w-[1px] h-[14px] bg-primary/20 dark:bg-[#005C66] group-hover:bg-primary transition-colors duration-500" />
 </div>

 <Card className="h-full bg-card border border-border/50 dark:border-white/10 rounded-2xl p-8 md:p-10 relative overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.015)] group-hover:border-primary/50 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]">
 <div className="relative z-10 flex flex-col gap-6">
 <div className="flex justify-between items-start">
 <div className={`w-14 h-14 rounded-xl ${tool.bgColor} border ${tool.border} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]`}>
 <tool.icon className={tool.color} size={28} />
 </div>
 {/* Arrow indicator slides in on hover - clean circular icon */}
 <div className="p-2 rounded-full bg-muted border border-border/80 opacity-0 group-hover:opacity-100 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] translate-x-4 group-hover:translate-x-0">
 <ChevronRight size={20} className="text-muted-foreground" />
 </div>
 </div>

 <div>
 <h2 className="text-2xl text-foreground uppercase tracking-tight mb-2 group-hover:text-primary transition-colors font-bold duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]">
 {tool.title}
 </h2>
 <p className="text-muted-foreground text-sm leading-relaxed font-semibold">
 {tool.description}
 </p>
 </div>

 <div className="flex items-center gap-2 pt-2">
 <Zap size={14} className="text-primary" />
 <span className="text-[10px] font-black uppercase tracking-widest text-primary/70">
 Mulai Latihan
 </span>
 </div>
 </div>
 </Card>
 </div>
 </Link>
 </m.div>
 ))}
 </div>

 {/* Informasi Kaki Halaman */}
 {/* Footer banner with grid background pattern */}
 <div className="mt-16 p-8 rounded-xl bg-muted/30 border border-border/50 text-center relative overflow-hidden">
 <div className="absolute inset-0 bg-grid-foreground/5 [mask-image:radial-gradient(hsl(var(--foreground)),transparent)]" />
 <p className="relative z-10 text-xs font-bold text-muted-foreground uppercase tracking-[0.2em]">
 Alat baru akan ditambahkan secara berkala • Tetap Semangat Belajar!
 </p>
 </div>
 </div>
 </div>
 );
}