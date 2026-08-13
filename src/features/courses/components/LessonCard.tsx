/**
 * @file LessonCard.tsx
 * @description Individual course syllabus lesson card component featuring numeric index badges, progress bars, and hover animations.
 * @module features/courses/components
 */

"use client";

// ==========================================
// Import & Dependencies
// ==========================================
import React, { useState } from "react";
import { m } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "@/components/ui/icons";
import { Card } from "@/components/ui/card";

// ==========================================
// Component Props Interface
// ==========================================
/**
 * Props for LessonCard component.
 */
interface LessonCardProps {
 /** Lesson data object. */
 lesson: {
 _id: string;
 title: string;
 slug: string;
 summary?: string;
 image_url?: string;
 };
 /** Zero-based index of lesson in list. */
 index: number;
 /** Parent category identifier. */
 categoryId: string;
 /** Flag for side quest styling. */
 isSideQuest?: boolean;
 /** Completion progress percentage. Range 0 to 100. */
 progress?: number; // 0 to 100
}

// ======================
// EKSEKUSI UTAMA
// ======================
/**
 * LessonCard component. Render individual lesson card with progress indicator and hover effects.
 */
export function LessonCard({ lesson, index, categoryId, isSideQuest, progress = 0 }: LessonCardProps) {
 const [isHovered, setIsHovered] = useState(false);
 
 // Set color theme based on quest type.
 const themeRgb = isSideQuest ? "var(--warning)" : "var(--primary)";

 return (
 <m.div
 whileHover={{ y: -4 }}
 transition={{ type: "spring", stiffness: 400, damping: 25 }}
 style={{
 // Optimize rendering performance for offscreen cards.
 contentVisibility: 'auto',
 containIntrinsicSize: '0 220px',
 }}
 >
 <Link
 href={`/courses/${categoryId}/${lesson.slug}`}
 className="group flex flex-col h-full relative"
 onMouseEnter={() => setIsHovered(true)}
 onMouseLeave={() => setIsHovered(false)}
 >
 {/* Tombou Register Mark */}
 <div className="absolute -top-[6px] -right-[6px] w-[14px] h-[14px] pointer-events-none z-20">
 <div 
 className="absolute top-0 right-0 w-[14px] h-[1px] transition-colors duration-500" 
 style={{ backgroundColor: isHovered ? `hsl(${themeRgb})` : `hsl(${themeRgb} / 0.2)` }}
 />
 <div 
 className="absolute top-0 right-0 w-[1px] h-[14px] transition-colors duration-500" 
 style={{ backgroundColor: isHovered ? `hsl(${themeRgb})` : `hsl(${themeRgb} / 0.2)` }}
 />
 </div>

 <Card
 className="p-6 sm:p-7 md:p-8 rounded-2xl transition-all duration-500 flex flex-col items-start gap-4 cursor-pointer h-full relative overflow-hidden bg-card border border-border/50 dark:border-white/10 shadow-[0_4px_25px_rgba(0,0,0,0.015)]"
 style={{
 borderColor: isHovered ? `hsl(${themeRgb} / 0.45)` : undefined
 }}
 >
 {/* Wave/Sea Texture Overlay (Seigaiha) */}
 <div className="absolute inset-0 \-5 pointer-events-none group-hover:opacity-[0.03] transition-opacity duration-500" />

 {/* Shine Effect */}
 <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ] skew-x-12 pointer-events-none" />

 <div className="flex justify-between items-start w-full relative z-10">
 {/* Format index to two-digit string. */}
 <div
 className="w-8 h-8 sm:w-10 sm:h-10 shrink-0 rounded-lg flex items-center justify-center font-black text-[10px] sm:text-xs font-mono transition-all duration-200 border"
 style={{
 backgroundColor: isHovered ? `hsl(${themeRgb})` : `hsl(var(--background)/0.5)`,
 borderColor: isHovered ? `hsl(${themeRgb})` : `hsl(var(--border)/0.5)`,
 color: isHovered ? `hsl(var(--background))` : `hsl(${themeRgb})`,
 transform: isHovered ? 'rotate(4deg) scale(1.05)' : 'none'
 }}
 >
 {(index + 1).toString().padStart(2, "0")}
 </div>

 {progress > 0 && (
 <div
 className="px-2 py-0.5 sm:px-3 sm:py-1 rounded-[4px] border text-[8px] sm:text-[9px] font-black uppercase tracking-[0.15em] transition-all duration-300 shadow-sm"
 style={{
 backgroundColor: isHovered ? `hsl(${themeRgb} / 0.08)` : `hsl(var(--background)/0.5)`,
 borderColor: isHovered ? `hsl(${themeRgb} / 0.3)` : `hsl(var(--border)/0.5)`,
 color: isHovered ? `hsl(${themeRgb})` : 'hsl(var(--muted-foreground))'
 }}
 >
 {progress}% Selesai
 </div>
 )}
 </div>

 {/* Widescreen Lesson Illustration Preview */}
 {lesson.image_url && (
 <div className="w-full aspect-[16/10] rounded-xl overflow-hidden relative z-10 border border-border/60 bg-muted/20">
 <Image
 src={lesson.image_url}
 alt={lesson.title}
 fill
 sizes="(max-width: 768px) 100vw, 33vw"
 className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
 />
 </div>
 )}

 <div className="flex-1 relative z-10 w-full space-y-1.5 sm:space-y-2">
 <h4
 className="text-base sm:text-lg md:text-xl text-foreground transition-colors tracking-tight leading-snug text-balance font-bold"
 style={{
 color: isHovered ? `hsl(${themeRgb})` : 'hsl(var(--foreground))'
 }}
 >
 {lesson.title}
 </h4>
 {lesson.summary && (
 <p className="text-muted-foreground text-[11px] sm:text-xs font-medium line-clamp-2 opacity-70 group-hover:opacity-100 transition-opacity leading-relaxed">
 {lesson.summary}
 </p>
 )}
 </div>

 <div className="mt-auto pt-3 sm:pt-4 w-full flex items-center justify-between border-t border-border relative z-10">
 <span
 className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] transition-colors"
 style={{
 color: isHovered ? `hsl(${themeRgb})` : `hsl(${themeRgb} / 0.4)`
 }}
 >
 Mulai Belajar
 </span>
 <div
 className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-lg border flex items-center justify-center transition-all duration-200 shadow-sm"
 style={{
 backgroundColor: isHovered ? `hsl(${themeRgb})` : `hsl(var(--background)/0.5)`,
 borderColor: isHovered ? `hsl(${themeRgb})` : `hsl(var(--border)/0.5)`,
 color: isHovered ? `hsl(var(--background))` : 'hsl(var(--foreground))'
 }}
 >
 <ChevronRight
 size={14}
 aria-hidden="true"
 className="transition-transform duration-300"
 style={{
 transform: isHovered ? 'translateX(2px)' : 'none'
 }}
 />
 </div>
 </div>

 {/* Bottom Progress Bar — Cyber Style */}
 <div
 className="absolute bottom-0 left-0 right-0 h-1"
 style={{ backgroundColor: "hsl(var(--background)/0.1)" }}
 >
 <m.div
 initial={{ width: 0 }}
 animate={{ width: `${progress}%` }}
 className="h-full rounded-full transition-all duration-500"
 style={{
 background: isSideQuest
 ? "linear-gradient(90deg, hsl(var(--warning)) 0%, hsl(var(--warning)/0.6) 100%)"
 : "linear-gradient(90deg, hsl(var(--primary)) 0%, hsl(var(--primary)/0.6) 100%)"
 }}
 />
 </div>
 </Card>
 </Link>
 </m.div>
 );
}