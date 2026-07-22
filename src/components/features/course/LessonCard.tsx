/**
 * @file LessonCard.tsx
 * @description Komponen kartu pelajaran individu (LessonCard) untuk silabus kursus. Dilengkapi indikator indeks numerik, progress bar siber, dan interaksi visual premium.
 */

"use client";

// ======================
// IMPOR
// ======================
import React, { useState } from "react";
import { m } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "@/components/ui/icons";
import { Card } from "@/components/ui/card";

// ======================
// ANTARMUKA / TIPE DATA
// ======================
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
  const themeRgb = isSideQuest ? "var(--warning-rgb)" : "var(--primary-rgb)";

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
        {/* Animated Glow Backdrop */}
        <div
          className="absolute inset-0 blur-md transition-opacity duration-200 -z-10 scale-105"
          style={{
            background: `linear-gradient(135deg, rgba(${themeRgb}, 0.1) 0%, transparent 100%)`,
            opacity: isHovered ? 1 : 0
          }}
        />

        <Card
          className="p-6 sm:p-7 md:p-8 rounded-2xl md:rounded-3xl transition-all duration-300 flex flex-col items-start gap-4 cursor-pointer h-full relative overflow-hidden glass"
          style={{
            borderColor: isHovered ? `rgba(${themeRgb}, 0.35)` : `rgb(var(--border-rgb)/0.85)`,
            boxShadow: isHovered ? `0 12px 30px rgba(${themeRgb}, 0.04), 0 0 15px rgba(${themeRgb}, 0.02)` : 'none'
          }}
        >
          {/* Wave/Sea Texture Overlay (Seigaiha) */}
          <div className="absolute inset-0 bg-seigaiha opacity-[0.015] pointer-events-none group-hover:opacity-[0.03] transition-opacity duration-500" />

          {/* Shine Effect */}
          <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-foreground/[0.02] to-transparent skew-x-12 pointer-events-none" />

          <div className="flex justify-between items-start w-full relative z-10">
            {/* Format index to two-digit string. */}
            <div
              className="w-8 h-8 sm:w-10 sm:h-10 shrink-0 rounded-lg sm:rounded-xl flex items-center justify-center font-black text-[10px] sm:text-xs font-mono transition-all duration-200 border"
              style={{
                backgroundColor: isHovered ? `rgb(${themeRgb})` : `rgb(var(--background-rgb)/0.5)`,
                borderColor: isHovered ? `rgb(${themeRgb})` : `rgb(var(--border-rgb)/0.5)`,
                color: isHovered ? `hsl(var(--background))` : `rgb(${themeRgb})`,
                transform: isHovered ? 'rotate(4deg) scale(1.05)' : 'none',
                boxShadow: isHovered ? `0 4px 12px rgba(${themeRgb}, 0.14)` : 'none'
              }}
            >
              {(index + 1).toString().padStart(2, "0")}
            </div>

            {progress > 0 && (
              <div
                className="px-2 py-0.5 sm:px-3 sm:py-1 rounded-full border text-[8px] sm:text-[9px] font-black uppercase tracking-[0.15em] transition-all duration-300 shadow-sm"
                style={{
                  backgroundColor: isHovered ? `rgba(${themeRgb}, 0.08)` : `rgb(var(--background-rgb)/0.5)`,
                  borderColor: isHovered ? `rgba(${themeRgb}, 0.3)` : `rgb(var(--border-rgb)/0.5)`,
                  color: isHovered ? `rgb(${themeRgb})` : 'hsl(var(--muted-foreground))'
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
              className="text-base sm:text-lg md:text-xl text-foreground transition-colors tracking-tight leading-snug text-balance"
              style={{
                color: isHovered ? `rgb(${themeRgb})` : 'hsl(var(--foreground))'
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
                color: isHovered ? `rgb(${themeRgb})` : `rgba(${themeRgb}, 0.4)`
              }}
            >
              Mulai Belajar
            </span>
            <div
              className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-md sm:rounded-lg border flex items-center justify-center transition-all duration-200 shadow-md"
              style={{
                backgroundColor: isHovered ? `rgb(${themeRgb})` : `rgb(var(--background-rgb)/0.5)`,
                borderColor: isHovered ? `rgb(${themeRgb})` : `rgb(var(--border-rgb)/0.5)`,
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
            style={{ backgroundColor: "rgb(var(--background-rgb)/0.1)" }}
          >
            <m.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full rounded-full transition-all duration-500"
              style={{
                background: isSideQuest
                  ? "linear-gradient(90deg, hsl(var(--warning)) 0%, rgb(var(--warning-rgb)/0.6) 100%)"
                  : "linear-gradient(90deg, hsl(var(--primary)) 0%, rgb(var(--primary-rgb)/0.6) 100%)",
                boxShadow: `0 0 8px rgba(${themeRgb}, 0.4)`,
              }}
            />
          </div>
        </Card>
      </Link>
    </m.div>
  );
}