/**
 * @file CoursesClient.tsx
 * @description Antarmuka interaktif untuk halaman landing kursus.
 * Menampilkan kategori JLPT dan kategori umum (General) yang diambil dari Sanity.
 * @module CoursesClient
 */

"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Zap, ArrowRight, BookOpen } from "lucide-react";
import { Card } from "@/components/ui/card";

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
  previews?: { _id: string; title: string; slug: string }[];
}

interface CoursesClientProps {
  categories: Category[];
}

export default function CoursesClient({ categories }: CoursesClientProps) {
  const jlptCategories = categories.filter((cat) => cat.type === "jlpt");
  const generalCategories = categories.filter((cat) => cat.type === "general");

  return (
    <div className="w-full px-6 relative overflow-hidden bg-background text-foreground transition-colors duration-300 min-h-screen pt-12 pb-24">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-cyan-500/5 dark:bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        className="max-w-7xl mx-auto relative z-10"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* HERO HEADER */}
        <header className="mb-20">
          <motion.h1
            variants={itemVariants}
            className="text-4xl md:text-7xl font-black uppercase tracking-tighter text-foreground"
          >
            MAU MULAI <br />
            <span className="text-primary drop-shadow-sm dark:drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]">
              DARI
            </span>{" "}
            MANA?
          </motion.h1>
        </header>

        {/* SECTION: BASICS (FOUNDATION) */}
        <motion.section variants={itemVariants} className="mb-24">
          <div className="flex items-center gap-6 mb-8">
            <h3 className="text-xs md:text-xs font-bold uppercase tracking-widest text-primary/60 dark:text-primary/50">
              Dasar Bahasa
            </h3>
            <div className="h-[1px] flex-1 bg-border" />
          </div>
          <Link href="/courses/basics">
            <motion.div>
              <Card className="rounded-2xl p-6 md:p-8 bg-card border border-border shadow-xl cursor-pointer group hover:border-primary/40 hover:bg-primary/[0.02] transition-all duration-300 relative overflow-hidden">
                <div className="flex justify-between items-center relative z-10">
                  <h4 className="text-2xl md:text-3xl font-black uppercase text-foreground group-hover:text-primary transition-colors tracking-tight">
                    Kuasai: <span className="text-primary group-hover:text-foreground transition-colors">Kana</span>
                  </h4>
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-muted border border-border flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white dark:group-hover:text-black group-hover:border-none transition-all duration-300">
                    <Zap size={24} />
                  </div>
                </div>
              </Card>
            </motion.div>
          </Link>
        </motion.section>

        {/* SECTION: JLPT TRACKS */}
        {jlptCategories.length > 0 && (
          <motion.section variants={itemVariants} className="mb-24">
            <div className="flex items-center gap-6 mb-10">
              <h3 className="text-xs md:text-xs font-bold uppercase tracking-widest text-primary/60 dark:text-primary/50">
                Jalur Level JLPT
              </h3>
              <div className="h-[1px] flex-1 bg-border" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {jlptCategories.map((cat) => {
                // Assign vibrant colors based on level
                const colorMap: Record<string, string> = {
                  "N5": "from-cyan-500/20 to-cyan-500/5",
                  "N4": "from-emerald-500/20 to-emerald-500/5",
                  "N3": "from-indigo-500/20 to-indigo-500/5",
                  "N2": "from-purple-500/20 to-purple-500/5",
                  "N1": "from-rose-500/20 to-rose-500/5",
                };
                
                const textGlowMap: Record<string, string> = {
                  "N5": "text-cyan-500 drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]",
                  "N4": "text-emerald-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]",
                  "N3": "text-indigo-500 drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]",
                  "N2": "text-purple-500 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]",
                  "N1": "text-rose-500 drop-shadow-[0_0_15px_rgba(244,63,94,0.5)]",
                };

                const bgColor = colorMap[cat.title] || "from-primary/20 to-primary/5";
                const textGlow = textGlowMap[cat.title] || "text-primary drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]";
                const kanji = cat.title.includes("1") ? "壱" : cat.title.includes("2") ? "弐" : cat.title.includes("3") ? "参" : cat.title.includes("4") ? "肆" : "伍";

                return (
                  <motion.div key={cat._id} variants={itemVariants} className="h-full">
                    <Link
                      href={`/courses/${cat.slug}`}
                      className="group flex flex-col h-full"
                    >
                      <Card className={`flex flex-col h-full min-h-[260px] bg-card rounded-[2.5rem] p-8 border border-border shadow-2xl cursor-pointer hover:border-transparent transition-all duration-500 group relative overflow-hidden`}>
                        {/* Level-specific Gradient Background on Hover */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                        
                        {/* Kanji Watermark */}
                        <div className="absolute -right-4 -top-8 text-[10rem] font-black text-foreground/[0.03] dark:text-foreground/[0.05] group-hover:text-foreground/[0.08] transition-all duration-700 pointer-events-none select-none font-japanese">
                          {kanji}
                        </div>

                        <div className="relative z-10 flex flex-col h-full">
                          <span className={`text-6xl md:text-7xl font-black text-foreground/20 group-hover:${textGlow} transition-all duration-500 mb-6 block tracking-tighter`}>
                            {cat.title}
                          </span>

                          <p className="text-xs md:text-sm text-muted-foreground font-semibold leading-relaxed group-hover:text-foreground transition-colors mb-8">
                            {cat.description || `Kuasai materi ${cat.title} dengan kurikulum terstruktur dan metode SRS.`}
                          </p>

                          <div className="mt-auto flex items-center justify-between pt-6 border-t border-border group-hover:border-white/10 transition-colors">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground group-hover:text-foreground transition-colors">
                              Mulai Jalur
                            </span>
                            <div className="w-10 h-10 rounded-xl bg-muted border border-border flex items-center justify-center group-hover:bg-foreground group-hover:text-background dark:group-hover:bg-white dark:group-hover:text-black group-hover:border-none transition-all duration-500 shadow-lg">
                              <ArrowRight size={18} />
                            </div>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </motion.section>
        )}

        {/* SECTION: GENERAL TOPICS */}
        {generalCategories.length > 0 && (
          <motion.section variants={itemVariants}>
            <div className="flex items-center gap-6 mb-10">
              <h3 className="text-xs md:text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-500/50">
                Topik Umum & Praktis
              </h3>
              <div className="h-[1px] flex-1 bg-border" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
              {generalCategories.map((cat) => (
                <motion.div key={cat._id} variants={itemVariants} className="h-full">
                  <Card className="flex flex-col h-full bg-card rounded-[2.5rem] p-8 md:p-12 border border-border shadow-2xl relative overflow-hidden group">
                    {/* Decor Background inside card */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-[80px] rounded-full -mr-20 -mt-20 pointer-events-none group-hover:bg-amber-500/10 transition-all duration-700" />
                    
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 relative z-10">
                      <div>
                        <span className="text-xs font-black uppercase tracking-[0.2em] text-amber-600 dark:text-amber-500/60 mb-3 block">
                          Kategori Umum
                        </span>
                        <h4 className="text-3xl md:text-5xl font-black text-foreground tracking-tight leading-none">
                          {cat.title}
                        </h4>
                      </div>
                      <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-muted border border-border flex items-center justify-center text-amber-600 dark:text-amber-500 shadow-inner">
                        <BookOpen size={28} />
                      </div>
                    </div>

                    <p className="text-sm md:text-base text-muted-foreground font-medium leading-relaxed mb-10 max-w-xl relative z-10">
                      {cat.description || "Eksplorasi materi bahasa Jepang di luar kurikulum standar JLPT."}
                    </p>

                    {/* Preview List */}
                    {cat.previews && cat.previews.length > 0 && (
                      <div className="grid gap-3 mb-10 relative z-10">
                        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 block">
                          Pratinjau Materi:
                        </span>
                        {cat.previews.map((preview) => (
                          <Link
                            key={preview._id}
                            href={`/courses/${cat.slug}/${preview.slug}`}
                            className="group/item flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-border hover:bg-amber-500/10 hover:border-amber-500/30 transition-all duration-300"
                          >
                            <span className="text-xs md:text-sm font-bold text-muted-foreground group-hover/item:text-foreground transition-colors">
                              {preview.title}
                            </span>
                            <ArrowRight size={14} className="text-muted-foreground/30 group-hover/item:text-amber-500 transition-colors" />
                          </Link>
                        ))}
                      </div>
                    )}

                    <div className="mt-auto pt-8 border-t border-border relative z-10">
                      <Link
                        href={`/courses/${cat.slug}`}
                        className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-amber-500 hover:bg-foreground text-white dark:text-black font-black uppercase tracking-widest text-xs dark:hover:bg-white transition-all duration-300 shadow-lg"
                      >
                        Buka Semua Materi <ArrowRight size={16} />
                      </Link>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}
      </motion.div>
    </div>
  );
}
