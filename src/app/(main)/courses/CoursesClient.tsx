/**
 * @file CoursesClient.tsx
 * @description Antarmuka interaktif untuk halaman landing kursus.
 * Menampilkan kategori JLPT dan kategori umum dari Supabase dengan kartu bertipe seragam.
 * @module CoursesClient
 */

"use client";

import React from "react";
import { motion } from "framer-motion";
import { GeneralCategoryCard } from "@/components/features/course/GeneralCategoryCard";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
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
    <div className="w-full relative overflow-hidden bg-background text-foreground transition-colors duration-300 min-h-screen pb-32">
      {/* 1. ADVANCED BACKGROUND DECOR */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Cyber Grid */}
        <div 
          className="absolute inset-0 opacity-20" 
          style={{ 
            backgroundImage: `linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)`,
            backgroundSize: '100px 100px'
          }}
        />
        
        {/* Animated Ambient Blobs menggunakan RGB CSS Variables */}
        <div 
          className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] animate-pulse" 
          style={{ backgroundColor: 'rgba(var(--primary-rgb), 0.08)' }}
        />
        <div 
          className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] animate-pulse" 
          style={{ backgroundColor: 'rgba(var(--secondary-rgb), 0.08)', animationDelay: '2s' }} 
        />

        {/* Massive Background Typography */}
        <div className="absolute top-20 left-0 w-full flex justify-center select-none overflow-hidden h-[400px]">
          <span className="text-[20vw] font-black uppercase tracking-[-0.05em] text-foreground/[0.02] dark:text-foreground/[0.03] leading-none whitespace-nowrap">
            SYLLABUS ・ シラバス
          </span>
        </div>
      </div>

      <motion.div
        className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 pt-20 md:pt-32"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* 2. DRAMATIC HERO HEADER */}
        <header className="mb-24 md:mb-32 text-center md:text-left">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12">
            <div className="space-y-6">
              <motion.div variants={itemVariants} className="flex items-center gap-3 justify-center md:justify-start">
                <div className="w-12 h-[2px] bg-primary" />
                <span className="text-xs font-black uppercase tracking-[0.3em] text-primary">Direktori Belajar</span>
              </motion.div>
              <motion.h1
                variants={itemVariants}
                className="text-6xl sm:text-7xl md:text-9xl font-black uppercase tracking-tighter leading-[0.85] text-foreground"
              >
                PILIH RUTE <br />
                <span className="text-primary drop-shadow-[0_0_25px_rgba(var(--primary-rgb),0.3)]">
                  BELAJAR
                </span>
              </motion.h1>

              {/* Quick Stats Bar */}
              <motion.div 
                variants={itemVariants}
                className="flex items-center justify-center md:justify-start gap-8 pt-4"
              >
                <div className="flex flex-col">
                  <span className="text-3xl font-black text-foreground">{categories.length}</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Kategori</span>
                </div>
                <div className="w-[1px] h-10 bg-border" />
                <div className="flex flex-col">
                  <span className="text-3xl font-black text-foreground">{totalLessons}</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Materi Pelajaran</span>
                </div>
              </motion.div>
            </div>
            
            <motion.p 
              variants={itemVariants}
              className="max-w-md text-muted-foreground text-sm md:text-lg font-medium leading-relaxed lg:mb-8"
            >
              Mulai petualangan bahasa Jepang Anda dengan kurikulum terstruktur yang dirancang untuk penguasaan cepat dan retensi jangka panjang.
            </motion.p>
          </div>
        </header>


        {/* 3. SECTION: JLPT TRACKS (Rerendered with the gorgeous GeneralCategoryCard style) */}
        {jlptCategories.length > 0 && (
          <motion.section variants={itemVariants} className="mb-32">
            <div className="flex flex-col md:flex-row md:items-center gap-8 mb-16">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-[1px] bg-primary/40" />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60">System Core</span>
                </div>
                <h3 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-foreground">
                  JLPT Mastery Tracks
                </h3>
              </div>
              <div className="h-[1px] flex-1 bg-gradient-to-r from-border/50 to-transparent" />
              <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/5 border border-primary/10">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                <span className="text-[10px] font-black uppercase tracking-widest text-primary/80">Rute Terstruktur</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
              {jlptCategories.map((cat) => (
                <GeneralCategoryCard key={cat._id} cat={cat} variants={itemVariants} />
              ))}
            </div>
          </motion.section>
        )}

        {/* 4. SECTION: GENERAL TOPICS */}
        {generalCategories.length > 0 && (
          <motion.section variants={itemVariants}>
            <div className="flex flex-col md:flex-row md:items-center gap-8 mb-16">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-[1px] bg-warning/40" />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-warning/60">Expansion Modules</span>
                </div>
                <h3 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-foreground">
                  Practical Competency
                </h3>
              </div>
              <div className="h-[1px] flex-1 bg-gradient-to-r from-border/50 to-transparent" />
              <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-warning/5 border border-warning/10">
                <div className="w-1.5 h-1.5 rounded-full bg-warning animate-ping" />
                <span className="text-[10px] font-black uppercase tracking-widest text-warning/80">Materi Tematik</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
              {generalCategories.map((cat) => (
                <GeneralCategoryCard key={cat._id} cat={cat} variants={itemVariants} />
              ))}
            </div>
          </motion.section>
        )}
      </motion.div>
    </div>
  );
}
