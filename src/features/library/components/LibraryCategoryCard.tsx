"use client";

/**
 * @file LibraryCategoryCard.tsx
 * @description Library navigation category card component displaying clean, responsive bento grid items.
 * @module features/library/components
 */

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

interface LibraryCategoryCardProps {
 /** Target URL path. */
 href: string;
 /** Category title. */
 title: string;
 /** Category description text. */
 desc: string;
 /** React node for category icon. */
 icon: React.ReactNode;
 /** Small uppercase category label. */
 label: string;
 /** Card index for numbering. */
 index: number;
 /** Optional count of items in category. */
 count?: number;
 /** Unique accent color based on RGB triplet string (e.g. "59 130 246"). */
 accentRgb?: string;
 /** Opsional: Apakah kartu ini adalah kartu unggulan yang mengambil 2 kolom desktop */
 isFeatured?: boolean;
}

export function LibraryCategoryCard({
 href,
 title,
 desc,
 icon,
 label,
 index,
 count,
 accentRgb = "0 122 124",
 isFeatured = false,
}: LibraryCategoryCardProps) {
 const [isHovered, setIsHovered] = useState(false);

 return (
 <Link 
 data-tour="library-category-card" 
 href={href} 
 className={cn(
 "relative group flex h-full w-full font-sans select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-2xl md:rounded-3xl",
 isFeatured ? "md:col-span-2" : "col-span-1"
 )} 
 aria-label={`Buka modul ${title}`}
 onMouseEnter={() => setIsHovered(true)}
 onMouseLeave={() => setIsHovered(false)}
 >
 {/* ── OPEN CONTAINER ── */}
 <div 
 className="w-full h-full p-5 sm:p-6 pb-6 border-b border-border/40 hover:border-primary/40 transition-colors flex flex-col justify-between gap-5 relative overflow-hidden group-active:scale-[0.995]"
 >
 {/* Ambient Hover Accent */}
 <div 
 className="absolute -top-20 -right-20 size-48 rounded-full blur-[50px] opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none z-0"
 style={{ background: `rgb(${accentRgb})` }}
 />

 {/* Tombou Corner Mark */}
 <div className="absolute top-3 right-3 w-3.5 h-3.5 pointer-events-none z-20">
 <div 
 className="absolute top-0 right-0 w-3 h-[1.5px] transition-colors duration-500" 
 style={{ backgroundColor: isHovered ? `rgb(${accentRgb})` : `rgba(${accentRgb}, 0.25)` }}
 />
 <div 
 className="absolute top-0 right-0 w-[1.5px] h-3 transition-colors duration-500" 
 style={{ backgroundColor: isHovered ? `rgb(${accentRgb})` : `rgba(${accentRgb}, 0.25)` }}
 />
 </div>

 {/* TOP SECTION */}
 <div className="w-full flex flex-col gap-4 sm:gap-6 relative z-10">
 {/* Top Meta Bar */}
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-2">
 <span 
 className="size-1.5 rounded-full"
 style={{ backgroundColor: `rgb(${accentRgb})` }}
 />
 <span
 className="text-[10px] font-black uppercase tracking-[0.2em] font-mono"
 style={{ color: `rgb(${accentRgb})` }}
 >
 {label}
 </span>
 </div>
 <span className="text-[10px] font-mono font-bold text-muted-foreground/40 group-hover:text-primary/70 transition-colors">
 0{index + 1}
 </span>
 </div>

 {/* Title & Icon Header */}
 <div className="flex items-start justify-between gap-4">
 <h2 className="text-xl sm:text-2xl md:text-3xl text-foreground font-black tracking-tight leading-tight group-hover:text-primary transition-colors duration-500">
 {title}
 </h2>
 
 <div
 className="size-11 sm:size-13 md:size-14 shrink-0 rounded-2xl flex items-center justify-center border border-white/10 transition-transform duration-500 group-hover:scale-105"
 style={{
 background: `rgba(${accentRgb}, 0.1)`,
 color: `rgb(${accentRgb})`,
 }}
 >
 {icon}
 </div>
 </div>

 {/* Metric Count Display */}
 {count !== undefined ? (
 <div className="flex items-baseline gap-2 pt-1">
 <span
 className="text-3xl sm:text-4xl md:text-5xl font-black tabular-nums tracking-tighter leading-none"
 style={{ color: `rgb(${accentRgb})` }}
 >
 {count.toLocaleString("id-ID")}
 </span>
 <span className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-widest font-mono">
 Materi Tersedia
 </span>
 </div>
 ) : (
 <div className="flex items-center gap-2 pt-1 text-[9px] font-bold text-amber-500 uppercase tracking-widest font-mono">
 <span className="size-1.5 rounded-full bg-amber-500 animate-ping" />
 Akses Harian
 </div>
 )}
 </div>

 {/* BOTTOM SECTION */}
 <div className="w-full pt-4 border-t border-border/40 dark:border-white/5 flex flex-col gap-4 relative z-10">
 <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed font-medium line-clamp-2">
 {desc}
 </p>

 <div className="flex items-center justify-between pt-1">
 <div 
 className="inline-flex items-center gap-3 px-4 py-2 rounded-full border transition-all duration-300"
 style={{
 backgroundColor: isHovered ? `rgba(${accentRgb}, 0.12)` : `rgba(${accentRgb}, 0.05)`,
 borderColor: isHovered ? `rgba(${accentRgb}, 0.35)` : `rgba(${accentRgb}, 0.15)`,
 color: `rgb(${accentRgb})`
 }}
 >
 <span className="text-[10px] font-black uppercase tracking-wider font-mono">
 Jelajahi Modul
 </span>
 <div 
 className="size-5 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:translate-x-1"
 style={{
 backgroundColor: `rgb(${accentRgb})`,
 color: '#ffffff'
 }}
 >
 <ArrowRight size={11} />
 </div>
 </div>

 <span className="hidden sm:inline-block text-[9px] font-mono font-bold text-muted-foreground/50 uppercase tracking-widest">
 OFFLINE READY
 </span>
 </div>
 </div>
 </div>
 </Link>
 );
}