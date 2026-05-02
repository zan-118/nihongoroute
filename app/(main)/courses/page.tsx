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
import { Zap, ArrowRight } from "lucide-react";
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
        <motion.section variants={itemVariants}>
          <div className="flex items-center gap-6 mb-10">
            <h3 className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-cyan-400/50">
              Jalur Level JLPT
            </h3>
            <div className="h-[1px] flex-1 bg-white/5" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
            {jlptLevels.map((level) => (
              <motion.div
                key={level}
                variants={itemVariants}
                className="h-full"
              >
                <Link
                  href={`/courses/${level.toLowerCase()}`}
                  className="group flex flex-col h-full"
                >
                  <Card className="flex flex-col h-full min-h-[220px] bg-white/[0.03] rounded-2xl p-6 md:p-8 border-white/[0.08] shadow-lg cursor-pointer hover:border-cyan-400/40 hover:bg-cyan-400/[0.02] transition-all duration-300 group hover:shadow-[0_15px_30px_rgba(0,0,0,0.3)]">
                    <span className="text-4xl md:text-5xl font-black text-slate-700/40 group-hover:text-cyan-400 transition-colors duration-300 mb-4 block tracking-tight">
                      {level}
                    </span>
                    
                    <div className="mt-auto flex flex-col gap-5 relative z-10">
                      <p className="text-[11px] md:text-xs text-slate-500 font-medium leading-relaxed group-hover:text-slate-300 transition-colors">
                        Materi lengkap untuk persiapan ujian {level}.
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
      </motion.div>
    </div>
  );
}

