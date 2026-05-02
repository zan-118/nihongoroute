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
    <div className="w-full px-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none" />

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
            className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-white"
          >
            MAU MULAI <br />
            <span className="text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]">
              DARI
            </span>{" "}
            MANA?
          </motion.h1>
        </header>

        {/* SECTION: BASICS (FOUNDATION) */}
        <motion.section variants={itemVariants} className="mb-24">
          <div className="flex items-center gap-6 mb-8">
            <h3 className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-cyan-400/50">
              Dasar Bahasa
            </h3>
            <div className="h-[1px] flex-1 bg-white/5" />
          </div>
          <Link href="/courses/basics">
            <motion.div>
              <Card className="rounded-2xl p-6 md:p-8 bg-white/[0.03] border-white/[0.08] shadow-xl cursor-pointer group hover:border-cyan-400/40 hover:bg-cyan-400/[0.02] transition-all duration-300 relative">
                <div className="flex justify-between items-center relative z-10">
                  <h4 className="text-2xl md:text-3xl font-black uppercase text-white group-hover:text-cyan-400 transition-colors tracking-tight">
                    Kuasai: <span className="text-cyan-400 group-hover:text-white transition-colors">Kana</span>
                  </h4>
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-cyan-400 group-hover:bg-cyan-400 group-hover:text-black group-hover:border-none transition-all duration-300">
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
              <h3 className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-cyan-400/50">
                Jalur Level JLPT
              </h3>
              <div className="h-[1px] flex-1 bg-white/5" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
              {jlptCategories.map((cat) => (
                <motion.div key={cat._id} variants={itemVariants} className="h-full">
                  <Link
                    href={`/courses/${cat.slug}`}
                    className="group flex flex-col h-full"
                  >
                    <Card className="flex flex-col h-full min-h-[220px] bg-white/[0.03] rounded-2xl p-6 md:p-8 border-white/[0.08] shadow-lg cursor-pointer hover:border-cyan-400/40 hover:bg-cyan-400/[0.02] transition-all duration-300 group hover:shadow-[0_15px_30px_rgba(0,0,0,0.3)]">
                      <span className="text-4xl md:text-5xl font-black text-slate-700/40 group-hover:text-cyan-400 transition-colors duration-300 mb-4 block tracking-tight">
                        {cat.title}
                      </span>

                      <div className="mt-auto flex flex-col gap-5 relative z-10">
                        <p className="text-[11px] md:text-xs text-slate-500 font-medium leading-relaxed group-hover:text-slate-300 transition-colors">
                          {cat.description || `Materi lengkap untuk persiapan ujian ${cat.title}.`}
                        </p>
                        <div className="flex items-center justify-between border-t border-white/[0.06] pt-5">
                          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-600 group-hover:text-cyan-400 transition-colors">
                            Mulai Belajar
                          </span>
                          <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center group-hover:bg-cyan-400 group-hover:text-black group-hover:border-none transition-all duration-300">
                            <ArrowRight size={14} />
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* SECTION: GENERAL TOPICS */}
        {generalCategories.length > 0 && (
          <motion.section variants={itemVariants}>
            <div className="flex items-center gap-6 mb-10">
              <h3 className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-amber-500/50">
                Topik Umum & Praktis
              </h3>
              <div className="h-[1px] flex-1 bg-white/5" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
              {generalCategories.map((cat) => (
                <motion.div key={cat._id} variants={itemVariants} className="h-full">
                  <Card className="flex flex-col h-full bg-white/[0.03] rounded-[2.5rem] p-8 md:p-12 border-white/[0.08] shadow-2xl relative overflow-hidden group">
                    {/* Decor Background inside card */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-[80px] rounded-full -mr-20 -mt-20 pointer-events-none group-hover:bg-amber-500/10 transition-all duration-700" />
                    
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 relative z-10">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500/60 mb-3 block">
                          Kategori Umum
                        </span>
                        <h4 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-none">
                          {cat.title}
                        </h4>
                      </div>
                      <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-amber-500 shadow-inner">
                        <BookOpen size={28} />
                      </div>
                    </div>

                    <p className="text-sm md:text-base text-slate-400 font-medium leading-relaxed mb-10 max-w-xl relative z-10">
                      {cat.description || "Eksplorasi materi bahasa Jepang di luar kurikulum standar JLPT."}
                    </p>

                    {/* Preview List */}
                    {cat.previews && cat.previews.length > 0 && (
                      <div className="grid gap-3 mb-10 relative z-10">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-600 mb-2 block">
                          Pratinjau Materi:
                        </span>
                        {cat.previews.map((preview) => (
                          <Link
                            key={preview._id}
                            href={`/courses/${cat.slug}/${preview.slug}`}
                            className="group/item flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-amber-500/10 hover:border-amber-500/30 transition-all duration-300"
                          >
                            <span className="text-xs md:text-sm font-bold text-slate-300 group-hover/item:text-white transition-colors">
                              {preview.title}
                            </span>
                            <ArrowRight size={14} className="text-slate-600 group-hover/item:text-amber-500 transition-colors" />
                          </Link>
                        ))}
                      </div>
                    )}

                    <div className="mt-auto pt-8 border-t border-white/[0.06] relative z-10">
                      <Link
                        href={`/courses/${cat.slug}`}
                        className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-amber-500 text-black font-black uppercase tracking-widest text-[10px] hover:bg-white hover:scale-105 transition-all duration-300 shadow-[0_10px_20px_rgba(245,158,11,0.2)]"
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
