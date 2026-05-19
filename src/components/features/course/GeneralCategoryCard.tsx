"use client";

import React from "react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { ArrowRight, BookOpen, GraduationCap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ROUTES } from "../../../lib/routes";

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

/**
 * Komponen kartu kategori adaptif dengan visual premium Cyber-glass.
 * Digunakan baik untuk Kategori Utama JLPT maupun Kategori Tematik Umum.
 */
export function GeneralCategoryCard({ cat, variants }: GeneralCategoryCardProps) {
  // Tentukan kunci warna berdasarkan judul (misal: "N5 Course" -> "N5")
  const jlptLevelKey = Object.keys(colorMap).find(key => cat.title.toUpperCase().includes(key));
  const theme = colorMap[jlptLevelKey || "general"];
  const isJlpt = cat.type === "jlpt" || !!jlptLevelKey;

  const IconComponent = isJlpt ? GraduationCap : BookOpen;

  return (
    <motion.div 
      variants={variants} 
      className="h-full"
      whileHover={{ y: -8 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <Card className={`flex flex-col h-full min-h-[480px] bg-card/30 backdrop-blur-xl border border-border rounded-[2.5rem] overflow-hidden group transition-all duration-500 shadow-xl hover:shadow-[0_20px_50px_rgba(0,0,0,0.15)] ${theme.accentBorder} glass`}>
        <div className="p-8 md:p-12 flex flex-col h-full relative">
          
          {/* Cyber Glow Ambient Latar Belakang */}
          <div 
            className="absolute top-0 right-0 w-[300px] h-[300px] blur-[120px] rounded-full -mr-20 -mt-20 pointer-events-none transition-all duration-700 opacity-20 group-hover:opacity-40"
            style={{ backgroundColor: `rgba(${theme.glowColor}, 0.2)` }}
          />
          
          {/* Header */}
          <div className="flex justify-between items-start mb-12 relative z-10">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-[1px]" style={{ backgroundColor: `rgba(${theme.glowColor}, 0.4)` }} />
                <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${theme.accentText}`}>
                  {cat.lessonCount || 0} Lessons • {isJlpt ? "JLPT TRACK" : "SPECIALIZED"}
                </span>
              </div>
              <h4 className="text-5xl md:text-6xl font-black text-foreground tracking-tighter leading-[0.85] uppercase">
                {cat.title}
              </h4>
            </div>
            <div 
              className={`w-16 h-16 rounded-2xl bg-background/50 border border-border flex items-center justify-center shadow-xl transition-all duration-500 ${theme.btnHoverBg} ${theme.iconBg}`}
              role="img"
              aria-label={`Ikon Kategori ${cat.title}`}
            >
              <IconComponent size={32} />
            </div>
          </div>

          {/* Deskripsi */}
          <p className="text-sm md:text-lg text-muted-foreground font-medium leading-relaxed mb-12 max-w-xl relative z-10 group-hover:text-foreground transition-colors">
            {cat.description || "Tingkatkan kompetensi penguasaan bahasa Jepang terarah melalui kurikulum premium kami."}
          </p>

          {/* Daftar Pelajaran (Previews) */}
          {cat.previews && cat.previews.length > 0 && (
            <div className="grid gap-4 mb-12 relative z-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {cat.previews.map((preview) => (
                  <Link
                    key={preview._id}
                    href={ROUTES.COURSES.LESSON(cat.slug, preview.slug)}
                    className={`flex items-center justify-between p-5 rounded-2xl bg-background/40 border border-border hover:bg-background/80 transition-all duration-300 group/item hover:shadow-[0_0_15px_rgba(${theme.glowColor},0.1)]`}
                  >
                    <span className="text-xs font-black text-muted-foreground group-hover/item:text-foreground transition-colors truncate pr-4">
                      {preview.title}
                    </span>
                    <ArrowRight 
                      size={14} 
                      className={`opacity-0 group-hover/item:opacity-100 group-hover/item:translate-x-1 transition-all ${theme.iconBg}`} 
                    />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Tombol Aksi di Bagian Bawah */}
          <div className="mt-auto pt-10 border-t border-border relative z-10">
            <Link
              href={ROUTES.COURSES.CATEGORY(cat.slug)}
              className="inline-flex items-center gap-4 px-10 py-5 rounded-2xl bg-foreground text-background font-black uppercase tracking-widest text-[10px] transition-all duration-500 shadow-xl hover:scale-105 active:scale-95 group/btn"
            >
              <span>Jelajahi Rute</span>
              <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
