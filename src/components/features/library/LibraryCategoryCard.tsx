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
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ==========================================
// ANTARMUKA & TIPE DATA
// ==========================================
interface LibraryCategoryCardProps {
  href: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
  label: string;
  index: number;
  count?: number;
  isSanity?: boolean;
  /** Aksen warna unik berbasis RGB triplet (contoh: "59 130 246") */
  accentRgb?: string;
}

// ==========================================
// KOMPONEN UTAMA: LibraryCategoryCard
// ==========================================
/**
 * Komponen kartu kategori interaktif dengan efek Bento Grid lapang dan pendar siber semantik.
 */
export function LibraryCategoryCard({
  href,
  title,
  desc,
  icon,
  label,
  index,
  count,
  isSanity = false,
  accentRgb = "0 122 124",
}: LibraryCategoryCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link 
      data-tour="library-category-card" 
      href={href} 
      className="group flex h-full font-sans" 
      aria-label={`Buka modul ${title}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div 
        className={cn(
          "w-full h-full rounded-2xl md:rounded-3xl border border-border/80 flex flex-col justify-between p-8 md:p-10 transition-all duration-500 relative overflow-hidden glass",
          isHovered ? "scale-[1.01]" : ""
        )}
        style={{
          boxShadow: isHovered 
            ? `0 20px 50px -12px rgba(${accentRgb}, 0.15), 0 0 0 1px rgba(${accentRgb}, 0.4)`
            : "none",
          background: isHovered 
            ? `linear-gradient(135deg, rgba(${accentRgb}, 0.05) 0%, rgba(var(--card-rgb), 0.5) 100%)`
            : undefined
        }}
      >
        {/* Radial neon glow background saat hover */}
        <div
          className="absolute -top-20 -right-20 size-60 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-[60px]"
          style={{ background: `radial-gradient(circle, rgba(${accentRgb}, 0.25) 0%, transparent 80%)` }}
        />

        {/* Konten Atas: Header Informasi Kartu */}
        <div className="w-full flex flex-col gap-6">
          {/* Baris Meta Atas */}
          <div className="flex items-center justify-between">
            <span
              className="text-[9px] font-black uppercase tracking-[0.3em] transition-opacity duration-300 group-hover:opacity-100"
              style={{ color: `rgb(${accentRgb})` }}
            >
              {label}
            </span>
            <span className="text-[10px] font-mono font-black text-muted-foreground/30 group-hover:text-primary/50 transition-colors">
              /{String(index + 1).padStart(2, "0")}
            </span>
          </div>

          {/* Judul & Ikon Container */}
          <div className="flex items-start justify-between gap-4 mt-2">
            <h2 className="text-2xl sm:text-3xl text-foreground tracking-tight leading-tight group-hover:text-primary transition-colors duration-300">
              {title}
            </h2>
            <div
              className="w-14 h-14 shrink-0 rounded-lg flex items-center justify-center transition-all duration-500 group-hover:rotate-6"
              style={{
                background: `rgba(${accentRgb}, 0.08)`,
                color: `rgb(${accentRgb})`,
                boxShadow: isHovered ? `0 0 25px rgba(${accentRgb}, 0.3)` : "none"
              }}
            >
              {icon}
            </div>
          </div>

          {/* Indikator Data / Jumlah Materi */}
          <div className="mt-2">
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
            ) : isSanity ? (
              <Badge variant="outline" className="text-[8px] font-black tracking-widest text-primary border-primary/20 uppercase bg-primary/5 rounded-md px-2 py-0.5">
                Sanity CMS
              </Badge>
            ) : (
              <div className="h-5" />
            )}
          </div>
        </div>

        {/* Konten Bawah: Deskripsi & CTA */}
        <div className="w-full mt-10">
          <p className="text-muted-foreground text-xs md:text-sm leading-relaxed font-medium group-hover:text-foreground/80 transition-colors line-clamp-3 mb-8">
            {desc}
          </p>

          <div className="flex items-center justify-between pt-6 border-t border-border/40">
            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.25em] group-hover:text-primary transition-colors">
              Mulai Belajar
            </span>
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:translate-x-1"
              style={{
                background: `rgba(${accentRgb}, 0.12)`,
                color: `rgb(${accentRgb})`,
              }}
            >
              <ArrowRight size={14} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
