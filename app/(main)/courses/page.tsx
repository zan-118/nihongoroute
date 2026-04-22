/**
 * @file page.tsx
 * @description Halaman utama direktori silabus pembelajaran (Course Landing Page).
 * Mengarahkan pengguna menuju pusat ujian simulasi, fondasi aksara (Kana), atau lintasan level JLPT.
 * @module CoursesLandingPage
 */

"use client";

// ======================
// IMPORTS
// ======================
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Zap, Play, ArrowRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

// ======================
// CONFIG / CONSTANTS
// ======================
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

// ======================
// MAIN EXECUTION
// ======================

/**
 * Komponen CoursesLandingPage: Menampilkan pilihan jalur belajar JLPT.
 * 
 * @returns {JSX.Element} Antarmuka navigasi pilihan jalur belajar.
 */
export default function CoursesLandingPage() {
  const jlptLevels = ["N5", "N4", "N3", "N2"];

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
            className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter text-white"
          >
            PILIH{" "}
            <span className="text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]">
              RUTE
            </span>{" "}
            <br /> BELAJAR.
          </motion.h1>
        </header>



        {/* SECTION: BASICS (FOUNDATION) */}
        <motion.section variants={itemVariants} className="mb-24">
          <div className="flex items-center gap-6 mb-10">
            <h3 className="text-xs md:text-sm font-black uppercase tracking-[0.5em] text-cyan-400/60 italic">
              Core_Protocol
            </h3>
            <div className="h-[1px] flex-1 bg-white/5" />
          </div>
          <Link href="/courses/basics">
            <motion.div whileHover={{ x: 10 }}>
              <Card className="rounded-[2rem] md:rounded-[3rem] p-10 md:p-12 bg-slate-900/40 backdrop-blur-xl border-white/10 shadow-2xl cursor-pointer group hover:border-cyan-400/30 transition-all overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex justify-between items-center relative z-10">
                  <h4 className="text-3xl md:text-5xl font-black italic uppercase text-white group-hover:text-cyan-400 transition-colors tracking-tighter">
                    Mastery: <span className="text-cyan-400 group-hover:text-white transition-colors">Kana</span>
                  </h4>
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-400 group-hover:text-black transition-all duration-500 shadow-inner">
                    <Zap size={32} />
                  </div>
                </div>
              </Card>
            </motion.div>
          </Link>
        </motion.section>

        {/* SECTION: JLPT TRACKS */}
        <motion.section variants={itemVariants}>
          <div className="flex items-center gap-6 mb-12">
            <h3 className="text-xs md:text-sm font-black uppercase tracking-[0.5em] text-cyan-400/60 italic">
              Level_Tracks
            </h3>
            <div className="h-[1px] flex-1 bg-white/5" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
            {jlptLevels.map((level, idx) => (
              <motion.div
                key={level}
                variants={itemVariants}
                whileHover={{ y: -12, transition: { duration: 0.3 } }}
                className="h-full"
              >
                <Link
                  href={`/courses/${level.toLowerCase()}`}
                  className="group flex flex-col h-full"
                >
                  <Card className="flex flex-col h-full min-h-[320px] bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] md:rounded-[3.5rem] p-8 md:p-10 border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.4)] cursor-pointer hover:border-cyan-400/40 hover:bg-cyan-400/[0.02] transition-all duration-500 relative overflow-hidden group hover:shadow-[0_20px_50px_rgba(34,211,238,0.1)]">
                    {/* Interactive Glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    
                    <span className="text-6xl md:text-8xl font-black italic text-slate-800/40 group-hover:text-cyan-400 transition-colors duration-500 mb-6 block tracking-tighter">
                      {level}
                    </span>
                    
                    <div className="mt-auto flex flex-col gap-6 relative z-10">
                      <p className="text-[11px] md:text-xs text-slate-400 italic font-bold leading-relaxed group-hover:text-slate-200 transition-colors">
                        Materi terstruktur dan komprehensif untuk penguasaan level {level}.
                      </p>
                      <div className="flex items-center justify-between border-t border-white/10 pt-6">
                        <span className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.3em] text-slate-500 group-hover:text-cyan-400 transition-colors">
                          Mulai Rute
                        </span>
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-cyan-400 group-hover:text-black group-hover:border-none transition-all duration-500 shadow-lg group-hover:translate-x-2">
                          <ArrowRight size={18} />
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </motion.div>
    </div>
  );
}

