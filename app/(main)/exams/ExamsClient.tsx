/**
 * @file ExamsClient.tsx
 * @description Antarmuka Daftar Ujian interaktif. 
 * Menerima data mentah dari server dan membungkusnya dengan transisi Framer Motion.
 * @module ExamsClient
 */

"use client";

// ======================
// IMPORTS
// ======================
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import {
  Activity,
  Clock,
  Target,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// ======================
// CONFIG / CONSTANTS
// ======================
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } },
};

// ======================
// MAIN EXECUTION
// ======================

/**
 * Komponen ExamsClient: Menampilkan grid kartu ujian dengan animasi.
 * 
 * @param {Object} props - Properti komponen.
 * @param {any[]} props.exams - Daftar objek data ujian.
 * @returns {JSX.Element} Antarmuka daftar ujian.
 */// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function ExamsClient({ exams }: { exams: any[] }) {
  // ======================
  // RENDER
  // ======================
  return (
    <div className="w-full px-6 relative overflow-hidden">
      {/* Background Ambient Decor */}
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-red-500/5 rounded-full blur-[150px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[10%] left-[-10%] w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        className="max-w-5xl mx-auto relative z-10"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* HEADER SECTION */}
        <header className="mb-20">
          <motion.div
            variants={itemVariants}
            className="flex items-center gap-4 mb-8"
          >
            <div className="w-3.5 h-3.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_15px_#ef4444]" />
            <Badge
              variant="outline"
              className="text-red-500 font-black uppercase tracking-[0.4em] text-[10px] md:text-xs border-red-500/30 px-4 py-1.5 bg-red-500/5 backdrop-blur-md rounded-xl h-auto"
            >
              Simulasi JLPT Aktif
            </Badge>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-5xl md:text-7xl lg:text-9xl font-black uppercase italic tracking-tighter leading-none mb-10 text-white drop-shadow-2xl"
          >
            Pusat <br />{" "}
            <span className="text-red-500 drop-shadow-[0_0_30px_rgba(239,68,68,0.5)]">
              Simulasi
            </span>
          </motion.h1>

          <motion.div
            variants={itemVariants}
            className="p-8 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] border-l-8 border-red-600 bg-slate-900/40 backdrop-blur-xl border-white/10 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-red-600/5 to-transparent pointer-events-none" />
            <p className="text-sm md:text-xl text-slate-200 font-bold leading-relaxed italic relative z-10">
              Cek sejauh mana kemampuanmu dengan simulasi standar resmi. Jangan tegang, pasti bisa!
            </p>
          </motion.div>
        </header>

        {/* WARNING SECTION */}
        <motion.div variants={itemVariants} className="mb-16">
          <Card className="p-6 md:p-8 border-amber-500/30 bg-amber-500/5 backdrop-blur-md flex items-start gap-5 rounded-[2rem] shadow-lg">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
               <AlertTriangle className="text-amber-500" size={24} />
            </div>
            <div>
              <h4 className="text-amber-500 font-black uppercase tracking-[0.3em] text-xs md:text-sm mb-2">
                Catatan Penting
              </h4>
              <p className="text-slate-300 text-xs md:text-base font-bold italic leading-relaxed">
                Cek sinyal dulu ya! Kalau kamu keluar di tengah jalan, progres ujianmu bakal hilang otomatis. Sayang kan?
              </p>
            </div>
          </Card>
        </motion.div>

        {/* EXAM LIST GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 pb-20">
          {exams.length > 0 ? (
            exams.map((exam) => (
              <motion.div
                key={exam._id}
                variants={itemVariants}
                whileHover={{ y: -12 }}
                whileTap={{ scale: 0.98 }}
                className="h-full"
              >
                <Link
                  href={`/exams/${exam._id}`}
                  className="block h-full"
                >
                  <Card className="p-8 md:p-12 group hover:border-red-500/50 hover:bg-red-500/[0.02] transition-all duration-500 flex flex-col h-full relative overflow-hidden cursor-pointer bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] md:rounded-[4rem] border-white/10 hover:shadow-[0_20px_50px_rgba(239,68,68,0.15)] shadow-2xl">
                    {/* Interactive Red Glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-red-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    
                    <div className="absolute -bottom-10 -right-10 text-[10rem] md:text-[14rem] font-black italic text-white/[0.03] group-hover:text-red-600/[0.07] transition-all duration-700 pointer-events-none uppercase italic">
                       {exam.levelCode?.toUpperCase() || "GL"}
                    </div>

                    <div className="flex justify-between items-start mb-10 md:mb-12 relative z-10">
                      <Badge
                        variant="outline"
                        className="px-4 py-2 text-[9px] md:text-xs font-black uppercase tracking-[0.3em] text-red-500 border-red-500/30 bg-black/40 backdrop-blur-md rounded-xl h-auto"
                      >
                        LEVEL_{exam.levelCode?.toUpperCase() || "GENERAL"}
                      </Badge>
                      <div className="w-12 h-12 md:w-16 md:h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-slate-500 group-hover:bg-red-600 group-hover:text-white group-hover:border-none transition-all duration-500 shadow-inner">
                        <Activity size={24} className="md:w-8 md:h-8" />
                      </div>
                    </div>

                    <h2 className="text-2xl md:text-4xl lg:text-5xl font-black text-white group-hover:text-red-400 transition-colors uppercase italic tracking-tighter mb-6 leading-tight relative z-10">
                      {exam.title}
                    </h2>

                    {exam.description && (
                      <p className="text-slate-400 text-xs md:text-base font-bold italic mb-10 line-clamp-2 relative z-10 group-hover:text-slate-200 transition-colors">
                        {exam.description}
                      </p>
                    )}

                    <div className="mt-auto relative z-10">
                      <div className="grid grid-cols-2 gap-4 mb-10 md:mb-12">
                        <div className="p-4 md:p-6 flex flex-col gap-2 items-center text-center rounded-2xl md:rounded-3xl bg-white/5 border border-white/10 group-hover:border-red-500/20 transition-all duration-500">
                          <Clock size={20} className="text-red-400 mb-1 md:w-6 md:h-6" />
                          <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
                            Batas Waktu
                          </span>
                          <span className="font-mono font-black text-white text-base md:text-2xl">
                            {exam.timeLimit}m
                          </span>
                        </div>
                        <div className="p-4 md:p-6 flex flex-col gap-2 items-center text-center rounded-2xl md:rounded-3xl bg-white/5 border border-white/10 group-hover:border-red-500/20 transition-all duration-500">
                          <Target size={20} className="text-emerald-400 mb-1 md:w-6 md:h-6" />
                          <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
                            Skor Minimum
                          </span>
                          <span className="font-mono font-black text-emerald-400 text-base md:text-2xl">
                            {exam.passingScore}p
                          </span>
                        </div>
                      </div>

                      <div className="w-full bg-white/5 border border-white/10 p-5 md:p-7 flex items-center justify-between group-hover:border-red-500/40 group-hover:bg-red-600 group-hover:text-black transition-all duration-500 rounded-2xl md:rounded-[2rem] shadow-xl">
                        <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-slate-300 group-hover:text-black transition-colors">
                          Mulai Ujian Yuk!
                        </span>
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-black/20 transition-all duration-500">
                           <ChevronRight
                             size={20}
                             className="group-hover:translate-x-1.5 transition-transform"
                           />
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))
          ) : (
            <motion.div variants={itemVariants} className="col-span-full">
              <Card className="p-20 text-center bg-slate-900/40 backdrop-blur-xl border border-dashed border-white/10 rounded-[3rem] md:rounded-[5rem]">
                <span className="text-6xl mb-8 block opacity-30">圦</span>
                <p className="text-slate-500 font-black text-sm md:text-base uppercase tracking-[0.5em] italic">
                  Lagi Gak Ada Ujian Nih
                </p>
              </Card>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

