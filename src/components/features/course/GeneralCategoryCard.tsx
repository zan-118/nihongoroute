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
import { ROUTES } from "../../../lib/routes";

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
      className="flex items-center justify-between p-2.5 sm:p-3.5 rounded-lg sm:rounded-xl border transition-all duration-300 group/item shrink-0 min-w-0"
      style={{
        backgroundColor: hovered ? `rgba(${glowColor}, 0.08)` : `rgba(var(--background-rgb), 0.3)`,
        borderColor: hovered ? `rgba(${glowColor}, 0.4)` : `rgba(var(--border-rgb), 0.4)`,
        boxShadow: hovered ? `0 4px 16px rgba(${glowColor}, 0.08)` : 'none'
      }}
    >
      <span className="text-[10px] sm:text-xs font-bold text-muted-foreground group-hover/item:text-foreground transition-colors truncate pr-3">
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
export function GeneralCategoryCard({ cat, variants }: GeneralCategoryCardProps) {
  const [isHovered, setIsHovered] = React.useState(false);
  
  // Tentukan kunci warna berdasarkan judul (misal: "N5 Course" -> "N5")
  const jlptLevelKey = Object.keys(colorMap).find(key => cat.title.toUpperCase().includes(key));
  const theme = colorMap[jlptLevelKey || "general"];
  const isJlpt = cat.type === "jlpt" || !!jlptLevelKey;

  const IconComponent = isJlpt ? GraduationCap : BookOpen;

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
        className="flex flex-col h-full rounded-2xl sm:rounded-3xl overflow-hidden group transition-all duration-500 glass"
        style={{
          borderColor: isHovered ? `rgba(${theme.glowColor}, 0.3)` : `rgba(var(--border-rgb), 0.4)`,
          boxShadow: isHovered ? `0 16px 40px rgba(${theme.glowColor}, 0.1), 0 0 20px rgba(${theme.glowColor}, 0.05)` : 'none'
        }}
      >
        <div className="p-4 sm:p-6 md:p-8 lg:p-10 flex flex-col h-full relative">
          
          {/* Cyber Glow Ambient Latar Belakang — Compact */}
          <div 
            className="absolute top-0 right-0 size-[150px] md:size-[250px] blur-[80px] md:blur-[100px] rounded-full -mr-12 -mt-12 pointer-events-none transition-all duration-700 opacity-15 group-hover:opacity-30"
            style={{ backgroundColor: `rgba(${theme.glowColor}, 0.2)` }}
          />
          
          {/* Header */}
          <div className="flex justify-between items-start mb-3 sm:mb-6 relative z-10">
            <div className="space-y-1 sm:space-y-2 min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <div className="w-5 sm:w-8 h-[1px]" style={{ backgroundColor: `rgba(${theme.glowColor}, 0.4)` }} />
                <span className={`text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] ${theme.accentText}`}>
                  {cat.lessonCount || 0} Lessons • {isJlpt ? "JLPT" : "SPECIALIZED"}
                </span>
              </div>
              <h4 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-foreground tracking-tighter leading-[0.9] uppercase">
                {cat.title}
              </h4>
            </div>
            <div 
              className="w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg transition-all duration-500 shrink-0 border ml-3"
              style={{
                backgroundColor: isHovered ? `rgba(${theme.glowColor}, 0.1)` : `rgba(var(--background-rgb), 0.5)`,
                borderColor: isHovered ? `rgba(${theme.glowColor}, 0.4)` : `rgba(var(--border-rgb), 0.6)`,
                color: `rgb(${theme.glowColor})`
              }}
              role="img"
              aria-label={`Ikon Kategori ${cat.title}`}
            >
              <IconComponent className="w-4 h-4 sm:w-6 sm:h-6 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110" />
            </div>
          </div>

          {/* Deskripsi */}
          <p className="text-xs sm:text-sm text-muted-foreground font-medium leading-relaxed mb-4 sm:mb-6 max-w-xl relative z-10 group-hover:text-foreground transition-colors line-clamp-2 sm:line-clamp-3">
            {cat.description || "Tingkatkan kompetensi penguasaan bahasa Jepang terarah melalui kurikulum premium kami."}
          </p>

          {/* Daftar Pelajaran (Previews) — Compact */}
          {cat.previews && cat.previews.length > 0 && (
            <div className="mb-4 sm:mb-6 relative z-10">
              {/* Mobile: horizontal scroll, Desktop: 2-col grid */}
              <div className="flex sm:grid sm:grid-cols-2 gap-2 sm:gap-3 overflow-x-auto sm:overflow-visible pb-1 sm:pb-0 -mx-1 px-1 sm:mx-0 sm:px-0 scrollbar-none">
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
          <div className="mt-auto pt-4 sm:pt-6 border-t border-border relative z-10">
            <Link
              href={ROUTES.COURSES.CATEGORY(cat.slug)}
              className="inline-flex items-center gap-2 sm:gap-3 px-4 py-2.5 sm:px-6 sm:py-3.5 rounded-lg sm:rounded-xl font-black uppercase tracking-widest text-[9px] sm:text-[10px] transition-all duration-500 active:scale-95 group/btn border"
              style={{
                backgroundColor: isHovered ? `rgb(${theme.glowColor})` : 'var(--foreground)',
                color: isHovered ? 'var(--primary-foreground)' : 'var(--background)',
                borderColor: isHovered ? `rgb(${theme.glowColor})` : 'transparent',
                boxShadow: isHovered ? `0 8px 24px rgba(${theme.glowColor}, 0.2)` : 'none'
              }}
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
