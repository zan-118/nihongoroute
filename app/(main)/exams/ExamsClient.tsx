/**
 * LOKASI FILE: app/(main)/exams/ExamsClient.tsx
 * KONSEP: Cyber-Dark Neumorphic + Framer Motion
 */

"use client";

import Link from "next/link";
import { motion, Variants } from "framer-motion";
import {
  Activity,
  Clock,
  Target,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";

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

export default function ExamsClient({ exams }: { exams: any[] }) {
  return (
    <main className="min-h-screen bg-[#080a0f] text-slate-300 pt-32 pb-40 px-6 relative overflow-hidden">
      {/* Background Ambient */}
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-red-500/5 rounded-full blur-[150px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[10%] left-[-10%] w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        className="max-w-5xl mx-auto relative z-10"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* HEADER */}
        <header className="mb-20">
          <motion.div
            variants={itemVariants}
            className="flex items-center gap-3 mb-6"
          >
            <div className="w-3 h-3 rounded-full bg-red-500 animate-ping shadow-[0_0_10px_#ef4444]" />
            <span className="text-red-500 font-mono font-black uppercase tracking-[0.3em] text-[10px]">
              Live Testing Center
            </span>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-5xl md:text-7xl lg:text-8xl font-black uppercase italic tracking-tighter leading-none mb-8 text-white drop-shadow-lg"
          >
            Simulasi <br />{" "}
            <span className="text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.4)]">
              Ujian JLPT
            </span>
          </motion.h1>

          <motion.div
            variants={itemVariants}
            className="neo-inset p-8 md:p-10 rounded-[2rem] border-l-8 border-red-500 bg-red-500/5"
          >
            <p className="text-sm md:text-lg text-slate-400 font-medium leading-relaxed italic">
              Uji kesiapan Anda dengan mesin simulasi berstandar resmi. Sistem
              akan menghitung skor Anda secara real-time berdasarkan bobot soal
              JLPT asli.
            </p>
          </motion.div>
        </header>

        {/* PERINGATAN */}
        <motion.div
          variants={itemVariants}
          className="mb-12 neo-card p-6 border-amber-500/20 bg-amber-500/5 flex items-start gap-4"
        >
          <AlertTriangle className="text-amber-500 shrink-0 mt-1" size={24} />
          <div>
            <h4 className="text-amber-500 font-black uppercase tracking-widest text-xs mb-1">
              Perhatian Sebelum Memulai
            </h4>
            <p className="text-slate-400 text-sm leading-relaxed">
              Pastikan koneksi internet stabil. Jika Anda keluar dari halaman
              ujian sebelum menekan tombol "Selesai", progres jawaban Anda tidak
              akan tersimpan.
            </p>
          </div>
        </motion.div>

        {/* DAFTAR UJIAN GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {exams.length > 0 ? (
            exams.map((exam) => (
              <motion.div
                key={exam._id}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  href={`/exams/${exam._id}`}
                  className="neo-card p-8 group hover:border-red-500/50 hover:bg-red-500/5 transition-all duration-300 flex flex-col h-full relative overflow-hidden"
                >
                  {/* Efek Glow Latar Belakang */}
                  <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-red-500/10 rounded-full blur-[40px] group-hover:bg-red-500/20 transition-colors pointer-events-none" />

                  <div className="flex justify-between items-start mb-8 relative z-10">
                    <span className="neo-inset px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-red-500 border border-red-500/20">
                      {exam.levelCode?.toUpperCase() || "General"}
                    </span>
                    <div className="w-12 h-12 neo-inset text-slate-500 flex items-center justify-center group-hover:text-red-500 transition-colors rounded-full">
                      <Activity size={20} />
                    </div>
                  </div>

                  <h2 className="text-2xl md:text-3xl font-black text-white group-hover:text-red-400 transition-colors uppercase italic tracking-tighter mb-4 leading-tight relative z-10">
                    {exam.title}
                  </h2>

                  {exam.description && (
                    <p className="text-slate-500 text-sm mb-8 line-clamp-2 relative z-10">
                      {exam.description}
                    </p>
                  )}

                  <div className="mt-auto grid grid-cols-2 gap-3 mb-8 relative z-10">
                    <div className="neo-inset p-3 flex flex-col gap-1 items-center text-center">
                      <Clock size={16} className="text-slate-400 mb-1" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                        Durasi
                      </span>
                      <span className="font-mono font-bold text-white">
                        {exam.timeLimit} Menit
                      </span>
                    </div>
                    <div className="neo-inset p-3 flex flex-col gap-1 items-center text-center">
                      <Target size={16} className="text-slate-400 mb-1" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                        Target
                      </span>
                      <span className="font-mono font-bold text-emerald-400">
                        {exam.passingScore} Poin
                      </span>
                    </div>
                  </div>

                  <div className="w-full neo-inset p-4 flex items-center justify-between group-hover:border-red-500/30 transition-colors relative z-10">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-red-400">
                      Mulai Simulasi
                    </span>
                    <ChevronRight
                      size={16}
                      className="text-slate-500 group-hover:text-red-400 group-hover:translate-x-1 transition-transform"
                    />
                  </div>
                </Link>
              </motion.div>
            ))
          ) : (
            <motion.div
              variants={itemVariants}
              className="col-span-full neo-inset p-16 text-center"
            >
              <span className="text-5xl mb-6 block opacity-50">🚧</span>
              <p className="text-slate-500 font-mono text-sm font-bold uppercase tracking-widest">
                Sistem ujian sedang dalam pemeliharaan.
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </main>
  );
}
