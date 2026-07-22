/**
 * @file TrainingGround.tsx
 * @description Komponen hub menu latihan mandiri (TrainingGround) untuk vocabulary, kanji lab, dan survival game.
 * Mobile: horizontal scroll chips. Desktop: compact 3-column grid.
 */

"use client";

// ======================
// IMPOR
// ======================
import React, { useMemo, useState } from "react";
import Link from "next/link";
import { m, Variants } from "framer-motion";
import { Layers, PenTool, Flame, Sparkles, ChevronRight } from "@/components/ui/icons";
import { Card } from "@/components/ui/card";

// ======================
// ANTARMUKA / TIPE DATA
// ======================

/**
 * Props for TrainingGround component.
 */
interface TrainingGroundProps {
  /** Category identifier for routing */
  categoryId: string;
  /** Tailwind color class for theme icon */
  themeColor: string;
  /** Framer motion animation variants */
  itemVariants: Variants;
}

/**
 * Structure for training menu item.
 */
interface TrainingItem {
  /** Title of training mode */
  title: string;
  /** Short description of training mode */
  desc: string;
  /** Lucide icon component */
  icon: React.ComponentType<{ size?: number; className?: string }>;
  /** Tailwind text color class */
  colorClass: string;
  /** RGB color string for dynamic inline styles */
  rgb: string;
  /** Target URL path */
  href: string;
}

// ======================

/**
 * Card component for individual training mode.
 * Uses hover states to trigger dynamic glow and watermark effects.
 */
const TrainingCard = React.memo(function TrainingCard({ item }: { item: TrainingItem }) {
  const [isHovered, setIsHovered] = useState(false);
  const IconComponent = item.icon;

  // Select watermark character based on title.
  const kanjiWatermark = React.useMemo(() => {
    if (item.title.includes("Kosakata")) return "語";
    if (item.title.includes("Kanji")) return "字";
    if (item.title.includes("Game")) return "命";
    return "練";
  }, [item.title]);

  return (
    <Card
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-lg transition-all duration-200 h-full relative overflow-hidden glass"
      style={{
        // Dynamic border and shadow on hover.
        borderColor: isHovered ? `rgba(${item.rgb}, 0.3)` : "rgb(var(--border-rgb)/0.4)",
        boxShadow: isHovered ? `0 8px 22px rgba(${item.rgb}, 0.06), 0 0 12px rgba(${item.rgb}, 0.03)` : "none"
      }}
    >
      {/* Motif Asanoha halus */}
      <div className="absolute inset-0 bg-asanoha opacity-[0.01] pointer-events-none group-hover:opacity-[0.025] transition-opacity duration-300" />

      {/* Kanji Watermark */}
      <div 
        className="absolute -bottom-4 -right-4 text-[7rem] sm:text-[9rem] font-black pointer-events-none select-none opacity-[0.01] group-hover:opacity-[0.03] transition-all duration-300 font-noto-serif-jp translate-y-4 translate-x-2"
        style={{ color: `rgb(${item.rgb})` }}
      >
        {kanjiWatermark}
      </div>

      {/* Premium Glow Overlay */}
      <div
        className="absolute inset-0 transition-opacity duration-200 pointer-events-none"
        style={{
          background: `linear-gradient(135deg, rgba(${item.rgb}, 0.04) 0%, transparent 100%)`,
          opacity: isHovered ? 1 : 0
        }}
      />

      <div className="relative z-10 flex flex-col gap-4 sm:gap-5">
        <div
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center transition-all duration-200 shadow-md border bg-background/50"
          style={{
            // Rotate and scale icon on hover.
            borderColor: isHovered ? `rgba(${item.rgb}, 0.4)` : "rgb(var(--border-rgb)/0.5)",
            color: `rgb(${item.rgb})`,
            transform: isHovered ? "scale(1.05) rotate(4deg)" : "none"
          }}
          role="img"
          aria-label={`Ikon Latihan ${item.title}`}
        >
          <IconComponent size={20} />
        </div>

        <div className="space-y-1">
          <h4
            className="text-base sm:text-lg md:text-xl text-foreground tracking-tight uppercase transition-colors"
            style={{
              color: isHovered ? `rgb(${item.rgb})` : "hsl(var(--foreground))"
            }}
          >
            {item.title}
          </h4>
          <p className="text-muted-foreground text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em]">
            {item.desc}
          </p>
        </div>
      </div>

      <div
        className="absolute bottom-4 right-4 sm:bottom-5 sm:right-5 size-8 sm:size-9 rounded-full border flex items-center justify-center transition-all duration-200"
        style={{
          // Slide and fade chevron on hover.
          backgroundColor: isHovered ? `rgb(${item.rgb})` : "rgb(var(--background-rgb)/0.5)",
          borderColor: isHovered ? `rgb(${item.rgb})` : "rgb(var(--border-rgb)/0.5)",
          color: isHovered ? "hsl(var(--background))" : "hsl(var(--foreground))",
          opacity: isHovered ? 1 : 0,
          transform: isHovered ? "translateX(0)" : "translateX(-4px)"
        }}
      >
        <ChevronRight size={14} />
      </div>
    </Card>
  );
});

// ======================
// EKSEKUSI UTAMA
// ======================

/**
 * Main training hub component. Displays vocabulary, kanji, and survival modes.
 */
export function TrainingGround({ categoryId, themeColor, itemVariants }: TrainingGroundProps) {
  // Memoize training items to prevent recreation on render.
  const trainingItems = useMemo<TrainingItem[]>(() => [
    {
      title: "Kosakata",
      desc: "Flashcard & Sistem SRS",
      icon: Layers,
      colorClass: "text-primary",
      rgb: "var(--primary-rgb)",
      href: `/tools/flashcards?category=${categoryId}&mode=vocab`,
    },
    {
      title: "Laboratorium Kanji",
      desc: "Urutan Goresan & Pengenalan",
      icon: PenTool,
      colorClass: "text-secondary",
      rgb: "var(--secondary-rgb)",
      href: `/tools/flashcards?category=${categoryId}&mode=kanji`,
    },
    {
      title: "Game Bertahan Hidup",
      desc: "Tantangan Kecepatan & Akurasi",
      icon: Flame,
      colorClass: "text-destructive",
      rgb: "var(--destructive-rgb)",
      href: `/tools/flashcards?category=${categoryId}&mode=survival`,
    },
  ], [categoryId]);

  return (
    <m.section variants={itemVariants} className="mb-10 md:mb-16">
      <div className="flex items-center gap-4 mb-5 md:mb-8">
        <div className="space-y-0.5">
          <h3 className="text-base sm:text-lg md:text-xl uppercase tracking-tight text-foreground flex items-center gap-2">
            <Sparkles size={16} className={themeColor} /> Area Latihan
          </h3>
          <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] sm:tracking-[0.3em] text-muted-foreground/60">
            Optimalkan Hafalan & Keterampilan
          </p>
        </div>
        <div className="h-[1px] flex-1 bg-gradient-to-r from-border/50 to-transparent hidden sm:block" />
      </div>

      {/* Mobile: horizontal scroll, Desktop: 3-col grid */}
      <div className="flex sm:grid sm:grid-cols-3 overflow-x-auto sm:overflow-visible gap-4 pb-4 sm:pb-0 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
        {trainingItems.map((item) => (
          <Link key={item.title} href={item.href} className="group shrink-0 w-[280px] sm:w-auto h-full block">
            <TrainingCard item={item} />
          </Link>
        ))}
      </div>
    </m.section>
  );
}