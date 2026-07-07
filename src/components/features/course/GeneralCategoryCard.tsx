/**
 * @file GeneralCategoryCard.tsx
 * @description Komponen kartu kategori kursus adaptif (GeneralCategoryCard) untuk merender tingkat JLPT atau modul kompetensi khusus.
 */

"use client";

// ======================
// IMPOR
// ======================
import React from "react";
import Link from "next/link";
import { m, Variants } from "framer-motion";
import { ArrowRight, BookOpen, GraduationCap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ROUTES } from "@/lib/routes";

// ======================
// ANTARMUKA / TIPE DATA
// ======================
interface GeneralCategoryCardProps {
  cat: {
    _id: string;
    title: string;
    slug: string;
    type?: string;
    description?: string;
    lessonCount?: number;
    previews?: { _id: string; title: string; slug: string }[];
  };
  variants: Variants;
  isFeatured?: boolean;
}

// ======================
// KONSTANTA / COLORMAP
// ======================

// Map level JLPT ke variabel warna CSS Semantik (RGB)
const colorMap: Record<string, {
  accentText: string;
  glowColor: string;
  accentBorder: string;
  btnHoverBg: string;
  iconBg: string;
}> = {
  "N5": {
    accentText: "text-primary",
    glowColor: "var(--primary-rgb)",
    accentBorder: "group-hover:border-primary/30",
    btnHoverBg: "group-hover:bg-primary group-hover:text-primary-foreground",
    iconBg: "text-primary",
  },
  "N4": {
    accentText: "text-success",
    glowColor: "var(--success-rgb)",
    accentBorder: "group-hover:border-success/30",
    btnHoverBg: "group-hover:bg-success group-hover:text-success-foreground",
    iconBg: "text-success",
  },
  "N3": {
    accentText: "text-warning",
    glowColor: "var(--warning-rgb)",
    accentBorder: "group-hover:border-warning/30",
    btnHoverBg: "group-hover:bg-warning group-hover:text-warning-foreground",
    iconBg: "text-warning",
  },
  "N2": {
    accentText: "text-secondary",
    glowColor: "var(--secondary-rgb)",
    accentBorder: "group-hover:border-secondary/30",
    btnHoverBg: "group-hover:bg-secondary group-hover:text-secondary-foreground",
    iconBg: "text-secondary",
  },
  "N1": {
    accentText: "text-destructive",
    glowColor: "var(--destructive-rgb)",
    accentBorder: "group-hover:border-destructive/30",
    btnHoverBg: "group-hover:bg-destructive group-hover:text-destructive-foreground",
    iconBg: "text-destructive",
  },
  "general": {
    accentText: "text-warning",
    glowColor: "var(--warning-rgb)",
    accentBorder: "group-hover:border-warning/30",
    btnHoverBg: "group-hover:bg-warning group-hover:text-warning-foreground",
    iconBg: "text-warning",
  }
};

// ======================
// KOMPONEN PEMBANTU MIKRO
// ======================
function PreviewItem({
  preview,
  catSlug,
  glowColor
}: {
  preview: { _id: string; title: string; slug: string };
  catSlug: string;
  glowColor: string;
}) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <Link
      href={ROUTES.COURSES.LESSON(catSlug, preview.slug)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex items-center justify-between p-3 rounded-xl border transition-all duration-200 group/item shrink-0 min-w-[200px] sm:min-w-0 glass relative overflow-hidden pl-4"
      style={{
        backgroundColor: hovered ? `rgba(${glowColor}, 0.08)` : `rgb(var(--background-rgb)/0.35)`,
        borderColor: hovered ? `rgba(${glowColor}, 0.45)` : `rgb(var(--border-rgb)/0.45)`,
        boxShadow: hovered ? `0 4px 14px rgba(${glowColor}, 0.06)` : 'none'
      }}
      aria-label={`Materi pelajaran: ${preview.title}`}
    >
      {/* Decorative Interactive Left Border Accent */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[3px] transition-all duration-200"
        style={{
          backgroundColor: `rgb(${glowColor})`,
          opacity: hovered ? 1 : 0.4,
          height: hovered ? '100%' : '50%',
          top: hovered ? '0' : '25%'
        }}
      />
      <span className="text-xs font-black text-muted-foreground group-hover/item:text-foreground transition-colors truncate pr-3">
        {preview.title}
      </span>
      <ArrowRight
        size={12}
        className="opacity-0 group-hover/item:opacity-100 group-hover/item:translate-x-1 transition-all shrink-0"
        style={{ color: `rgb(${glowColor})` }}
      />
    </Link>
  );
}

// ======================
// EKSEKUSI UTAMA
// ======================
export function GeneralCategoryCard({ cat, variants, isFeatured = false }: GeneralCategoryCardProps) {
  const [isHovered, setIsHovered] = React.useState(false);

  const jlptLevelKey = Object.keys(colorMap).find(key => cat.title.toUpperCase().includes(key));
  const theme = colorMap[jlptLevelKey || "general"];
  const isJlpt = cat.type === "jlpt" || !!jlptLevelKey;

  const IconComponent = isJlpt ? GraduationCap : BookOpen;

  // Map levels to elegant Kanji watermarks
  const kanjiWatermark = React.useMemo(() => {
    if (!isJlpt) return "学"; // 'Gaku' for general study
    if (cat.title.toUpperCase().includes("N5")) return "五";
    if (cat.title.toUpperCase().includes("N4")) return "四";
    if (cat.title.toUpperCase().includes("N3")) return "三";
    if (cat.title.toUpperCase().includes("N2")) return "二";
    if (cat.title.toUpperCase().includes("N1")) return "一";
    return "級";
  }, [cat.title, isJlpt]);

  return (
    <m.div
      variants={variants}
      className="h-full"
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <Card
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="flex flex-col h-full rounded-2xl md:rounded-3xl overflow-hidden group transition-all duration-300 glass relative"
        style={{
          borderColor: isHovered ? `rgba(${theme.glowColor}, 0.4)` : `rgb(var(--border-rgb)/0.75)`,
          boxShadow: isHovered
            ? `0 20px 40px rgba(${theme.glowColor}, 0.08), 0 0 25px rgba(${theme.glowColor}, 0.03)`
            : isFeatured
            ? `0 8px 25px rgba(${theme.glowColor}, 0.025)`
            : 'none'
        }}
      >
        {/* Japanese Geometric Texture Overlay */}
        <div className="absolute inset-0 bg-asanoha opacity-[0.015] pointer-events-none group-hover:opacity-[0.035] transition-opacity duration-500" />

        {/* Kanji Watermark */}
        <div 
          className="absolute -bottom-6 -right-6 text-[10rem] sm:text-[14rem] font-black pointer-events-none select-none opacity-[0.015] group-hover:opacity-[0.045] transition-all duration-500 font-noto-serif-jp translate-y-8 translate-x-4"
          style={{ color: `rgb(${theme.glowColor})` }}
        >
          {kanjiWatermark}
        </div>

        <div className={`p-8 sm:p-10 flex flex-col h-full relative z-10 ${isFeatured ? 'md:p-12 lg:p-14' : ''}`}>

          {/* Cyber Glow Ambient Latar Belakang — Adaptive size */}
          <div
            className={`absolute top-0 right-0 blur-[45px] md:blur-[55px] rounded-full -mr-10 -mt-10 pointer-events-none transition-all duration-300 opacity-20 group-hover:opacity-35 ${
              isFeatured ? 'size-[220px] md:size-[280px]' : 'size-[140px] md:size-[200px]'
            }`}
            style={{ backgroundColor: `rgba(${theme.glowColor}, 0.25)` }}
          />

          {/* Header */}
          <div className="flex justify-between items-start mb-5 sm:mb-8 relative z-10">
            <div className="space-y-1 sm:space-y-2.5 min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <div className="w-5 sm:w-8 h-[1px]" style={{ backgroundColor: `rgba(${theme.glowColor}, 0.4)` }} />
                <span className={`text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] ${theme.accentText}`}>
                  {cat.lessonCount || 0} Pelajaran • {isJlpt ? "Jalur JLPT" : "Modul Spesialis"}
                </span>
              </div>
              <h4 className={`font-black text-foreground tracking-tighter leading-[0.9] uppercase ${
                isFeatured ? 'text-2xl sm:text-4xl md:text-5xl lg:text-6xl' : 'text-xl sm:text-3xl md:text-4xl'
              }`}>
                {cat.title}
              </h4>
            </div>
            <div
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shadow-md transition-all duration-200 shrink-0 border ml-3 bg-background/50"
              style={{
                borderColor: isHovered ? `rgba(${theme.glowColor}, 0.45)` : `rgb(var(--border-rgb)/0.55)`,
                color: `rgb(${theme.glowColor})`
              }}
              role="img"
              aria-label={`Ikon Kategori ${cat.title}`}
            >
              <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-200 group-hover:rotate-6 group-hover:scale-105" />
            </div>
          </div>

          {/* Deskripsi */}
          <p className="text-xs sm:text-sm text-muted-foreground font-semibold leading-relaxed mb-6 sm:mb-8 max-w-xl relative z-10 group-hover:text-foreground transition-colors line-clamp-2 sm:line-clamp-3">
            {cat.description || "Tingkatkan kompetensi penguasaan bahasa Jepang terarah melalui kurikulum premium kami."}
          </p>

          {/* Daftar Pelajaran (Previews) — Compact & Adaptive */}
          {cat.previews && cat.previews.length > 0 && (
            <div className="mb-6 sm:mb-8 relative z-10">
              {/* Mobile: horizontal scroll, Desktop: 2-col or 3-col bento grid layout */}
              <div className="flex flex-col gap-3 overflow-x-auto sm:overflow-visible pb-2 sm:pb-0 -mx-1 px-1 sm:mx-0 sm:px-0 scrollbar-none">
                {cat.previews.map((preview) => (
                  <PreviewItem
                    key={preview._id}
                    preview={preview}
                    catSlug={cat.slug}
                    glowColor={theme.glowColor}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Tombol Aksi di Bagian Bawah */}
          <div className="mt-auto pt-6 border-t border-border/80 relative z-10">
            <Link
              href={ROUTES.COURSES.CATEGORY(cat.slug)}
              className="inline-flex items-center gap-2.5 sm:gap-3 px-5 py-3 sm:px-7 sm:py-4 rounded-xl font-black uppercase tracking-widest text-[9px] sm:text-[10px] transition-all duration-200 active:scale-95 group/btn border shadow-sm"
              style={{
                backgroundColor: isHovered ? `rgb(${theme.glowColor})` : 'hsl(var(--foreground))',
                color: isHovered ? 'hsl(var(--primary-foreground))' : 'hsl(var(--background))',
                borderColor: isHovered ? `rgb(${theme.glowColor})` : 'transparent',
                boxShadow: isHovered ? `0 6px 18px rgba(${theme.glowColor}, 0.18)` : 'none'
              }}
              aria-label={`Jelajahi Rute Kursus ${cat.title}`}
            >
              <span>Jelajahi Rute</span>
              <ArrowRight size={12} className="group-hover/btn:translate-x-1 transition-transform duration-300" />
            </Link>
          </div>
        </div>
      </Card>
    </m.div>
  );
}
