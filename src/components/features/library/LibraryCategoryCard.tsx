"use client";

/**
 * @file LibraryCategoryCard.tsx
 * @description Komponen kartu tampilan vertikal bento-grid untuk kategori pustaka belajar NihongoRoute.
 * Menyajikan visualisasi modern, lapang, dan interaktif dengan efek pendar neon dinamis.
 */

// ==========================================
// IMPOR UTAMA
// ==========================================
import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "@/components/ui/icons";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

// ==========================================
// ANTARMUKA & TIPE DATA
// ==========================================
/**
 * Props for LibraryCategoryCard component.
 */
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
  /** Aksen warna unik berbasis RGB triplet (contoh: "59 130 246") */
  accentRgb?: string;
}

// ==========================================
// KOMPONEN UTAMA: LibraryCategoryCard
// ==========================================
/**
 * Bento-grid style card component for library categories.
 * Renders interactive card with custom accent glow on hover.
 * 
 * @param props - Component properties.
 * @returns React element.
 */
export function LibraryCategoryCard({
  href,
  title,
  desc,
  icon,
  label,
  index,
  count,
  accentRgb = "0 122 124",
}: LibraryCategoryCardProps) {
  // Track hover state for dynamic glow effects
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link 
      data-tour="library-category-card" 
      href={href} 
      className="relative group flex h-full font-sans" 
      aria-label={`Buka modul ${title}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Tombou Register Mark (L-shape offset 6px outside rounded-2xl) */}
      <div className="absolute -top-[6px] -right-[6px] w-[14px] h-[14px] pointer-events-none z-20">
        <div 
          className="absolute top-0 right-0 w-[14px] h-[1px] transition-colors duration-500" 
          style={{ backgroundColor: isHovered ? `rgb(${accentRgb})` : `rgba(${accentRgb}, 0.2)` }}
        />
        <div 
          className="absolute top-0 right-0 w-[1px] h-[14px] transition-colors duration-500" 
          style={{ backgroundColor: isHovered ? `rgb(${accentRgb})` : `rgba(${accentRgb}, 0.2)` }}
        />
      </div>

      <Card 
        className={cn(
          "w-full h-full bg-card border border-border/50 dark:border-white/10 rounded-2xl flex flex-col justify-between p-8 md:p-10 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] relative overflow-hidden shadow-[0_4px_25px_rgba(0,0,0,0.015)] group-hover:border-primary/50"
        )}
      >
        {/* Konten Atas: Header Informasi Kartu */}
        <div className="w-full flex flex-col gap-6 relative z-10">
          {/* Baris Meta Atas */}
          <div className="flex items-center justify-between">
            <span
              className="text-[9px] font-black uppercase tracking-[0.3em] transition-opacity duration-300 group-hover:opacity-100"
              style={{ color: `rgb(${accentRgb})` }}
            >
              {label}
            </span>
            {/* Format index with leading zero */}
            <span className="text-[10px] font-mono font-black text-muted-foreground/30 group-hover:text-primary/50 transition-colors">
              /{String(index + 1).padStart(2, "0")}
            </span>
          </div>

          {/* Judul & Ikon Container */}
          <div className="flex items-start justify-between gap-4 mt-2">
            <h2 className="text-2xl sm:text-3xl text-foreground tracking-tight leading-tight group-hover:text-primary transition-colors duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] font-bold">
              {title}
            </h2>
            <div
              className="w-14 h-14 shrink-0 rounded-lg flex items-center justify-center transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-105"
              style={{
                background: `rgba(${accentRgb}, 0.08)`,
                color: `rgb(${accentRgb})`
              }}
            >
              {icon}
            </div>
          </div>

          {/* Indikator Data / Jumlah Materi */}
          <div className="mt-2">
            {/* Render item count if provided, fallback to empty spacer */}
            {count !== undefined ? (
              <div className="flex items-baseline gap-2">
                <span
                  className="text-4xl md:text-5xl font-black tabular-nums tracking-tighter leading-none"
                  style={{ color: `rgb(${accentRgb})` }}
                >
                  {count.toLocaleString("id-ID")}
                </span>
                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                  Materi Terintegrasi
                </span>
              </div>
            ) : (
              <div className="h-5" />
            )}
          </div>
        </div>

        {/* Konten Bawah: Deskripsi & CTA */}
        <div className="w-full mt-10 relative z-10">
          <p className="text-muted-foreground text-xs md:text-sm leading-relaxed font-semibold group-hover:text-foreground/80 transition-colors line-clamp-3 mb-8">
            {desc}
          </p>

          <div className="flex items-center justify-between pt-6 border-t border-border/50">
            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.25em] group-hover:text-primary transition-colors">
              Mulai Belajar
            </span>
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-1"
              style={{
                background: `rgba(${accentRgb}, 0.12)`,
                color: `rgb(${accentRgb})`,
              }}
            >
              <ArrowRight size={14} />
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}