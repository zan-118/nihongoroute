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
import { Layers, PenTool, Flame, Sparkles, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";

// ======================
// ANTARMUKA / TIPE DATA
// ======================
interface TrainingGroundProps {
  categoryId: string;
  themeColor: string;
  itemVariants: Variants;
}

interface TrainingItem {
  title: string;
  desc: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  colorClass: string;
  rgb: string;
  href: string;
}

// ======================
// KOMPONEN PEMBANTU KARTU — Compact
// ======================
const TrainingCard = React.memo(function TrainingCard({ item }: { item: TrainingItem }) {
  const [isHovered, setIsHovered] = useState(false);
  const IconComponent = item.icon;
  return (
    <Card
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl transition-all duration-200 h-full relative overflow-hidden glass"
      style={{
        borderColor: isHovered ? `rgba(${item.rgb}, 0.3)` : "rgb(var(--border-rgb)/0.4)",
        boxShadow: isHovered ? `0 8px 22px rgba(${item.rgb}, 0.06), 0 0 12px rgba(${item.rgb}, 0.03)` : "none"
      }}
    >
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
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center transition-all duration-200 shadow-md border"
          style={{
            backgroundColor: isHovered ? `rgba(${item.rgb}, 0.1)` : "rgb(var(--background-rgb)/0.5)",
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
            className="text-base sm:text-lg md:text-xl font-black text-foreground tracking-tight uppercase transition-colors"
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
export function TrainingGround({ categoryId, themeColor, itemVariants }: TrainingGroundProps) {
  const trainingItems = useMemo<TrainingItem[]>(() => [
    {
      title: "Vocabulary",
      desc: "Flashcard & Spaced Repetition",
      icon: Layers,
      colorClass: "text-primary",
      rgb: "var(--primary-rgb)",
      href: `/tools/flashcards?category=${categoryId}&mode=vocab`,
    },
    {
      title: "Kanji Lab",
      desc: "Stroke Order & Recognition",
      icon: PenTool,
      colorClass: "text-secondary",
      rgb: "var(--secondary-rgb)",
      href: `/tools/flashcards?category=${categoryId}&mode=kanji`,
    },
    {
      title: "Survival",
      desc: "Speed & Accuracy Challenge",
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
          <h3 className="text-base sm:text-lg md:text-xl font-black uppercase tracking-tight text-foreground flex items-center gap-2">
            <Sparkles size={16} className={themeColor} /> Training Ground
          </h3>
          <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] sm:tracking-[0.3em] text-muted-foreground/60">
            Optimalkan Hafalan & Keterampilan
          </p>
        </div>
        <div className="h-[1px] flex-1 bg-gradient-to-r from-border/50 to-transparent hidden sm:block" />
      </div>

      {/* Mobile: horizontal scroll, Desktop: 3-col grid */}
      <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 overflow-x-auto sm:overflow-visible pb-2 sm:pb-0 -mx-1 px-1 sm:mx-0 sm:px-0 scrollbar-none">
        {trainingItems.map((item) => (
          <Link key={item.title} href={item.href} className="group shrink-0 w-[75vw] sm:w-auto">
            <TrainingCard item={item} />
          </Link>
        ))}
      </div>
    </m.section>
  );
}
