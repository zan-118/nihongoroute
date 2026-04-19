/**
 * @file app/(main)/exams/ExamsClient.tsx
 * @description Antarmuka Daftar Ujian interaktif. Menerima properti (props) data mentah dari `exams/page.tsx` lalu membungkusnya dengan transisi Framer Motion agar tampil dinamis kepada pengguna.
 * @module Client Component
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
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Variabel transisi kontainer induk untuk merender daftar kartu secara sekuensial
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

// Variabel transisi individu (efek pantul dari bawah)
const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } },
};

/**
 * Komponen Penampil Data Antrean Ujian.
 * Menampilkan grid kartu ujian berdasarkan data yang diturunkan oleh Server Component.
 * 
 * @param {Object} props - Properti komponen.
 * @param {Array} props.exams - Array objek yang merinci judul, batas waktu, dan nilai lulus simulasi ujian.
 * @returns {JSX.Element} Grid navigasi interaktif menuju modul `MockExamEngine`.
 */
export default function ExamsClient({ exams }: { exams: any[] }) {
  return (
    <div className="w-full px-6 relative overflow-hidden">
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
            <Badge
              variant="outline"
              className="text-red-500 font-mono font-black uppercase tracking-[0.3em] text-[10px] border-red-500/20 px-3 py-1 bg-red-500/5 neo-inset"
            >
              Live Testing Center
            </Badge>
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
            className="p-8 md:p-10 rounded-[2rem] border-l-8 border-red-500 bg-red-500/5 neo-inset"
          >
            <p className="text-sm md:text-lg text-slate-200 font-medium leading-relaxed italic">
              Uji kesiapan Anda dengan mesin simulasi berstandar resmi. Sistem
              akan menghitung skor Anda secara real-time berdasarkan bobot soal
              JLPT asli.
            </p>
          </motion.div>
        </header>

        {/* PERINGATAN */}
        <motion.div variants={itemVariants} className="mb-12">
          <Card className="p-6 border-amber-500/20 bg-amber-500/5 flex items-start gap-4 rounded-2xl">
            <AlertTriangle className="text-amber-500 shrink-0 mt-1" size={24} />
            <div>
              <h4 className="text-amber-500 font-black uppercase tracking-widest text-xs mb-1">
                Perhatian Sebelum Memulai
              </h4>
              <p className="text-slate-200 text-sm leading-relaxed">
                Pastikan koneksi internet stabil. Jika Anda keluar dari halaman
                ujian sebelum menekan tombol "Selesai", progres jawaban Anda tidak
                akan tersimpan.
              </p>
            </div>
          </Card>
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
                className="h-full"
              >
                <Link
                  href={`/exams/${exam._id}`}
                  className="block h-full"
                  passHref
                  legacyBehavior
                >
                  <Card className="p-8 group hover:border-red-500/50 hover:bg-red-500/5 transition-all duration-300 flex flex-col h-full relative overflow-hidden cursor-pointer neo-card rounded-[2rem] border-white/5">
                    {/* Efek Glow Latar Belakang */}
                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-red-500/10 rounded-full blur-[40px] group-hover:bg-red-500/20 transition-colors pointer-events-none" />

                    <div className="flex justify-between items-start mb-8 relative z-10">
                      <Badge
                        variant="outline"
                        className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-red-500 border-red-500/20 neo-inset rounded-lg"
                      >
                        {exam.levelCode?.toUpperCase() || "General"}
                      </Badge>
                      <div className="w-12 h-12 neo-inset text-slate-300 flex items-center justify-center group-hover:text-red-500 transition-colors rounded-full">
                        <Activity size={20} />
                      </div>
                    </div>

                    <h2 className="text-2xl md:text-3xl font-black text-white group-hover:text-red-400 transition-colors uppercase italic tracking-tighter mb-4 leading-tight relative z-10">
                      {exam.title}
                    </h2>

                    {exam.description && (
                      <p className="text-slate-300 text-sm mb-8 line-clamp-2 relative z-10">
                        {exam.description}
                      </p>
                    )}

                    <div className="mt-auto relative z-10">
                      <div className="grid grid-cols-2 gap-3 mb-8">
                        <div className="neo-inset p-3 flex flex-col gap-1 items-center text-center rounded-xl bg-black/20">
                          <Clock size={16} className="text-slate-200 mb-1" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">
                            Durasi
                          </span>
                          <span className="font-mono font-bold text-white">
                            {exam.timeLimit} Menit
                          </span>
                        </div>
                        <div className="neo-inset p-3 flex flex-col gap-1 items-center text-center rounded-xl bg-black/20">
                          <Target size={16} className="text-slate-200 mb-1" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">
                            Target
                          </span>
                          <span className="font-mono font-bold text-emerald-400">
                            {exam.passingScore} Poin
                          </span>
                        </div>
                      </div>

                      <div className="w-full neo-inset p-4 flex items-center justify-between group-hover:border-red-500/30 transition-colors rounded-xl bg-black/20">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-200 group-hover:text-red-400">
                          Mulai Simulasi
                        </span>
                        <ChevronRight
                          size={16}
                          className="text-slate-300 group-hover:text-red-400 group-hover:translate-x-1 transition-transform"
                        />
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))
          ) : (
            <motion.div variants={itemVariants} className="col-span-full">
              <Card className="neo-inset p-16 text-center border-white/5 bg-cyber-surface/30 shadow-none rounded-[3rem]">
                <span className="text-5xl mb-6 block opacity-50">🚧</span>
                <p className="text-slate-300 font-mono text-sm font-bold uppercase tracking-widest">
                  Sistem ujian sedang dalam pemeliharaan.
                </p>
              </Card>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
