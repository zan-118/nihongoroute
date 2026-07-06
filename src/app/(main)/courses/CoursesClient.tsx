/**
 * @file CoursesClient.tsx
 * @description Antarmuka interaktif untuk halaman landing kursus.
 * Menampilkan kategori JLPT dan kategori umum dari Supabase dengan kartu bertipe seragam.
 * @module CoursesClient
 */

"use client";

// ======================
// IMPOR
// ======================
import React from "react";
import { m } from "framer-motion";
import { GeneralCategoryCard } from "@/components/features/course/GeneralCategoryCard";

// ======================
// KONSTANTA ANIMASI
// ======================
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { y: 16, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

interface Category {
  _id: string;
  title: string;
  slug: string;
  type: string;
  description?: string;
  lessonCount?: number;
  previews?: { _id: string; title: string; slug: string }[];
}

import { useUserStore } from "@/store/useUserStore";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Trophy, BookOpen, Layers } from "lucide-react";

interface Category {
  _id: string;
  title: string;
  slug: string;
  type: string;
  description?: string;
  lessonCount?: number;
  previews?: { _id: string; title: string; slug: string }[];
}

interface CoursesClientProps {
  categories: Category[];
}

export default function CoursesClient({ categories }: CoursesClientProps) {
  const completedLessons = useUserStore((s) => s.completedLessons);

  const { totalLessons, lessonsDoneCount, globalProgress, jlptCategories, generalCategories } =
    React.useMemo(() => {
      let lessonsTotal = 0;
      const jlpt: Category[] = [];
      const general: Category[] = [];

      for (const category of categories) {
        lessonsTotal += category.lessonCount || 0;

        if (category.type === "jlpt") {
          jlpt.push(category);
        } else if (category.type === "general" || category.type === "article") {
          general.push(category);
        }
      }

      const doneCount = Object.values(completedLessons).filter(
        (record) => record && record.completedAt && !record.isDeleted
      ).length;

      return {
        generalCategories: general,
        globalProgress:
          lessonsTotal > 0 ? Math.min(100, Math.round((doneCount / lessonsTotal) * 100)) : 0,
        jlptCategories: jlpt,
        lessonsDoneCount: doneCount,
        totalLessons: lessonsTotal,
      };
    }, [categories, completedLessons]);

  return (
    <div className="w-full relative overflow-hidden bg-transparent text-foreground transition-colors duration-300 min-h-screen pb-24 md:pb-32">
      {/* 1. DEKORASI LATAR BELAKANG — Subtle Only */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-0 left-0 w-full h-[300px] md:h-[400px]"
          style={{ background: 'linear-gradient(180deg, rgb(var(--primary-rgb)/0.05) 0%, transparent 100%)' }}
        />
        <div
          className="absolute bottom-0 right-0 w-[260px] h-[260px] rounded-full blur-[55px] opacity-15"
          style={{ backgroundColor: 'rgb(var(--secondary-rgb)/0.06)' }}
        />
      </div>

      <m.div
        className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 relative z-10 pt-6 md:pt-16"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* BENTO GRID CONTAINER */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">

          {/* BENTO CARD 1: JUMBO HEADER & GLOBAL STATS (SPAN 3) */}
          <m.div
            variants={itemVariants}
            className="lg:col-span-3 p-8 sm:p-10 md:p-14 rounded-[2.5rem] bg-card/25 border border-border/80 shadow-md relative overflow-hidden group transition-all duration-300 glass"
          >
            <div className="absolute top-0 right-0 size-64 bg-primary/5 rounded-full blur-[55px] pointer-events-none group-hover:bg-primary/8 transition-all duration-500" />
            <div className="absolute inset-0 bg-asanoha opacity-[0.02] pointer-events-none" />

            <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-8 md:gap-12">
              <div className="space-y-4 max-w-2xl">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 px-3.5 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] shadow-none">
                    <Sparkles size={10} className="mr-1.5 text-primary" /> Direktori Belajar
                  </Badge>
                </div>
                <h1 className="text-3xl sm:text-5xl md:text-6xl uppercase tracking-tighter leading-[0.9] text-foreground">
                  PILIH RUTE <br />
                  <span className="text-primary font-bold">
                    BELAJAR
                  </span>
                </h1>
                <p className="text-muted-foreground text-xs sm:text-sm md:text-base font-semibold leading-relaxed">
                  Mulai petualangan bahasa Jepang Anda dengan kurikulum terstruktur untuk penguasaan cepat dan retensi jangka panjang.
                </p>
              </div>

              {/* GLOBAL PROGRESS MODULE */}
              <div className="w-full xl:w-auto xl:min-w-[320px] p-6 rounded-xl bg-background/50 border border-border/80 glass relative overflow-hidden transition-all duration-200 hover:border-primary/25">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <Trophy size={12} className="text-primary" /> Progres Global
                    </span>
                    <span className="text-xs font-black text-primary font-mono">{globalProgress}%</span>
                  </div>

                  <Progress
                    value={globalProgress}
                    className="h-2.5 bg-muted border border-border relative overflow-hidden"
                    indicatorClassName="bg-primary"
                  />

                  <div className="flex justify-between items-center gap-4 pt-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-base font-black text-foreground">{lessonsDoneCount}</span>
                      <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Selesai</span>
                    </div>
                    <div className="w-1.5 h-1.5 rounded-full bg-border" />
                    <div className="flex items-center gap-1.5">
                      <span className="text-base font-black text-foreground">{totalLessons}</span>
                      <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Total Materi</span>
                    </div>
                    <div className="w-1.5 h-1.5 rounded-full bg-border" />
                    <div className="flex items-center gap-1.5">
                      <span className="text-base font-black text-foreground">{categories.length}</span>
                      <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Rute</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </m.div>

          {/* BENTO CARD 2: FEATURED COURSE (JLPT N5 - SPAN 2) */}
          {jlptCategories.map((cat) => {
            const isFeatured = cat.title.toUpperCase().includes("N5");
            if (!isFeatured) return null;
            return (
              <m.div key={cat._id} variants={itemVariants} className="lg:col-span-2">
                <GeneralCategoryCard cat={cat} variants={itemVariants} isFeatured={true} />
              </m.div>
            );
          })}

          {/* BENTO CARD 3: OTHER JLPT TRACKS (SPAN 1 EACH) */}
          {jlptCategories.map((cat) => {
            const isFeatured = cat.title.toUpperCase().includes("N5");
            if (isFeatured) return null;
            return (
              <m.div key={cat._id} variants={itemVariants} className="lg:col-span-1">
                <GeneralCategoryCard cat={cat} variants={itemVariants} isFeatured={false} />
              </m.div>
            );
          })}

          {/* BENTO CARD 4: PRACTICAL COMPETENCY TRACKS (SPAN 1 EACH) */}
          {generalCategories.map((cat) => (
            <m.div key={cat._id} variants={itemVariants} className="lg:col-span-1">
              <GeneralCategoryCard cat={cat} variants={itemVariants} isFeatured={false} />
            </m.div>
          ))}

        </div>
      </m.div>
    </div>
  );
}
