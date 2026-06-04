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

interface CoursesClientProps {
  categories: Category[];
}

export default function CoursesClient({ categories }: CoursesClientProps) {
  const jlptCategories = categories.filter((cat) => cat.type === "jlpt");
  const generalCategories = categories.filter((cat) => cat.type === "general");
  
  const totalLessons = categories.reduce((acc, cat) => acc + (cat.lessonCount || 0), 0);

  return (
    <div className="w-full relative overflow-hidden bg-background text-foreground transition-colors duration-300 min-h-screen pb-24 md:pb-32">
      {/* 1. DEKORASI LATAR BELAKANG — Subtle Only */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Subtle gradient accent — not massive blobs */}
        <div 
          className="absolute top-0 left-0 w-full h-[300px] md:h-[400px]" 
          style={{ background: 'linear-gradient(180deg, rgba(var(--primary-rgb), 0.04) 0%, transparent 100%)' }}
        />
        <div 
          className="absolute bottom-0 right-0 w-[300px] h-[300px] rounded-full blur-[100px] opacity-30" 
          style={{ backgroundColor: 'rgba(var(--secondary-rgb), 0.06)' }}
        />
      </div>

      <m.div
        className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 relative z-10 pt-6 md:pt-16"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* 2. HERO COMPACT — Mobile-First */}
        <header className="mb-10 md:mb-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-12">
            <div className="space-y-3 md:space-y-5">
              <m.div variants={itemVariants} className="flex items-center gap-3">
                <div className="w-8 md:w-12 h-[2px] bg-primary" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Direktori Belajar</span>
              </m.div>
              <m.h1
                variants={itemVariants}
                className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-tighter leading-[0.9] text-foreground"
              >
                PILIH RUTE <br />
                <span className="text-primary drop-shadow-[0_0_20px_rgba(var(--primary-rgb),0.25)]">
                  BELAJAR
                </span>
              </m.h1>

              {/* Quick Stats — Inline Compact */}
              <m.div 
                variants={itemVariants}
                className="flex items-center gap-5 md:gap-8 pt-1"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl md:text-2xl font-black text-foreground">{categories.length}</span>
                  <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Kategori</span>
                </div>
                <div className="w-[1px] h-5 md:h-7 bg-border" />
                <div className="flex items-center gap-2">
                  <span className="text-xl md:text-2xl font-black text-foreground">{totalLessons}</span>
                  <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Materi</span>
                </div>
              </m.div>
            </div>
            
            <m.p 
              variants={itemVariants}
              className="max-w-sm text-muted-foreground text-sm md:text-base font-medium leading-relaxed md:mb-4"
            >
              Mulai petualangan bahasa Jepang Anda dengan kurikulum terstruktur untuk penguasaan cepat dan retensi jangka panjang.
            </m.p>
          </div>
        </header>


        {/* 3. SEKSI: RUTE JLPT */}
        {jlptCategories.length > 0 && (
          <m.section variants={itemVariants} className="mb-12 md:mb-24">
            <div className="flex items-center gap-4 md:gap-6 mb-6 md:mb-10">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-6 md:w-8 h-[1px] bg-primary/50" />
                  <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-primary/70">System Core</span>
                </div>
                <h3 className="text-xl sm:text-2xl md:text-4xl font-black uppercase tracking-tighter text-foreground">
                  JLPT Mastery Tracks
                </h3>
              </div>
              <div 
                className="h-[1px] flex-1 hidden sm:block" 
                style={{ backgroundImage: 'linear-gradient(90deg, rgba(var(--border-rgb), 0.5), transparent)' }}
              />
              <div 
                className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg border"
                style={{ backgroundColor: 'rgba(var(--primary-rgb), 0.05)', borderColor: 'rgba(var(--primary-rgb), 0.1)' }}
              >
                <div className="size-1.5 rounded-full bg-primary animate-ping" />
                <span 
                  className="text-[9px] font-black uppercase tracking-widest"
                  style={{ color: 'rgba(var(--primary-rgb), 0.8)' }}
                >
                  Rute Terstruktur
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
              {jlptCategories.map((cat) => (
                <GeneralCategoryCard key={cat._id} cat={cat} variants={itemVariants} />
              ))}
            </div>
          </m.section>
        )}

        {/* 4. SEKSI: TOPIK UMUM */}
        {generalCategories.length > 0 && (
          <m.section variants={itemVariants}>
            <div className="flex items-center gap-4 md:gap-6 mb-6 md:mb-10">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-6 md:w-8 h-[1px] bg-warning/50" />
                  <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-warning/70">Expansion Modules</span>
                </div>
                <h3 className="text-xl sm:text-2xl md:text-4xl font-black uppercase tracking-tighter text-foreground">
                  Practical Competency
                </h3>
              </div>
              <div 
                className="h-[1px] flex-1 hidden sm:block" 
                style={{ backgroundImage: 'linear-gradient(90deg, rgba(var(--border-rgb), 0.5), transparent)' }}
              />
              <div 
                className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg border"
                style={{ backgroundColor: 'rgba(var(--warning-rgb), 0.05)', borderColor: 'rgba(var(--warning-rgb), 0.1)' }}
              >
                <div className="size-1.5 rounded-full bg-warning animate-ping" />
                <span 
                  className="text-[9px] font-black uppercase tracking-widest"
                  style={{ color: 'rgba(var(--warning-rgb), 0.8)' }}
                >
                  Materi Tematik
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
              {generalCategories.map((cat) => (
                <GeneralCategoryCard key={cat._id} cat={cat} variants={itemVariants} />
              ))}
            </div>
          </m.section>
        )}
      </m.div>
    </div>
  );
}
