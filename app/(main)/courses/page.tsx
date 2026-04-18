/**
 * LOKASI FILE: app/(main)/courses/page.tsx
 * KONSEP: Cyber-Dark Neumorphic + Framer Motion
 */

"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Zap, Play, ArrowRight, BookOpen } from "lucide-react";

// Variabel animasi untuk kontainer
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

export default function CoursesLandingPage() {
  const jlptLevels = ["N5", "N4", "N3", "N2"];

  return (
    // DIUBAH: Tag main diganti div. Dihapus pt-32 pb-40.
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

        {/* SECTION 1: EXAM CENTER */}
        <motion.section variants={itemVariants} className="mb-16">
          <Link href="/exams" className="group block">
            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="bg-[#0d1117] rounded-[2.5rem] p-8 md:p-12 border border-white/5 shadow-[15px_15px_35px_#050608,-10px_-10px_30px_rgba(255,255,255,0.02)] hover:border-cyan-400/30 transition-colors"
            >
              <div className="flex flex-col md:flex-row justify-between items-center gap-10">
                <div className="max-w-md text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                    <span className="w-2 h-2 bg-cyan-400 rounded-full animate-ping" />
                    <span className="text-cyan-400 font-black text-[10px] tracking-[0.3em] uppercase">
                      Test Center Live
                    </span>
                  </div>
                  <h2 className="text-4xl font-black italic uppercase text-white mb-4">
                    JLPT Mock Exam
                  </h2>
                  <p className="text-sm text-slate-300 line-clamp-2">
                    Uji kemampuan instan dengan simulasi waktu nyata berstandar
                    resmi.
                  </p>
                </div>
                {/* DIUBAH: Warna tombol Play Exam menjadi Cyan (Aksi Utama), bukan Merah (Bahaya) */}
                <div className="bg-cyan-400 text-black p-6 rounded-3xl shadow-[0_0_25px_rgba(34,211,238,0.4)]">
                  <Play fill="currentColor" size={32} />
                </div>
              </div>
            </motion.div>
          </Link>
        </motion.section>

        {/* SECTION 2: BASICS */}
        <motion.section variants={itemVariants} className="mb-24">
          <div className="flex items-center gap-4 mb-8">
            <h3 className="text-xs font-black uppercase tracking-[0.4em] text-cyan-400">
              Foundation
            </h3>
            <div className="h-[1px] flex-1 bg-white/5" />
          </div>
          <Link href="/courses/basics">
            <motion.div
              whileHover={{ x: 10 }}
              className="bg-[#0d1117] rounded-[2rem] p-10 border border-white/5 shadow-[10px_10px_25px_#050608,-8px_-8px_20px_rgba(255,255,255,0.01)]"
            >
              <div className="flex justify-between items-center">
                <h4 className="text-3xl font-black italic uppercase text-white group-hover:text-cyan-400">
                  Kana Mastery
                </h4>
                <Zap className="text-cyan-400" size={30} />
              </div>
            </motion.div>
          </Link>
        </motion.section>

        {/* SECTION 3: JLPT TRACKS */}
        <motion.section variants={itemVariants}>
          <div className="flex items-center gap-4 mb-10">
            <h3 className="text-xs font-black uppercase tracking-[0.4em] text-cyan-400">
              JLPT Tracks
            </h3>
            <div className="h-[1px] flex-1 bg-white/5" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {jlptLevels.map((level) => (
              <motion.div
                key={level}
                variants={itemVariants}
                whileHover={{ y: -10, transition: { duration: 0.2 } }}
                className="h-full"
              >
                {/* DIUBAH: Tambahkan h-full dan flex-col agar tinggi kartu di grid seragam */}
                <Link
                  href={`/courses/${level.toLowerCase()}`}
                  className="group flex flex-col h-full min-h-[288px] bg-gradient-to-br from-[#121620] to-[#0d1117] rounded-[2.5rem] p-8 border border-white/[0.05] shadow-[12px_12px_25px_#050608,-10px_-10px_25px_rgba(255,255,255,0.02)]"
                >
                  <span className="text-5xl font-black italic text-slate-800 group-hover:text-cyan-400 transition-colors mb-4 block">
                    {level}
                  </span>
                  {/* mt-auto memastikan bagian bawah kartu selalu sejajar, tak peduli isinya */}
                  <div className="mt-auto flex flex-col gap-4">
                    <p className="text-xs text-slate-300 line-clamp-2">
                      Materi terstruktur dan komprehensif untuk level {level}.
                    </p>
                    <div className="flex items-center justify-between border-t border-white/5 pt-4">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 group-hover:text-white transition-colors">
                        Mulai Rute
                      </span>
                      <ArrowRight
                        className="group-hover:text-cyan-400 transition-colors"
                        size={18}
                      />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </motion.div>
    </div>
  );
}
