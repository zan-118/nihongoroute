/**
 * LOKASI FILE: app/(main)/courses/[categoryId]/CourseCategoryClient.tsx
 * KONSEP: Cyber-Dark Neumorphic + Framer Motion
 */

"use client";

import Link from "next/link";
import { motion, Variants } from "framer-motion";
import {
  ArrowLeft,
  Layers,
  PenTool,
  Flame,
  Award,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

// --- KONFIGURASI ANIMASI ---
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

export default function CourseCategoryClient({
  data,
  categoryId,
}: {
  data: any;
  categoryId: string;
}) {
  const isSideQuest = data.category.type === "general";
  const themeColor = isSideQuest ? "text-amber-500" : "text-cyan-400";
  const themeBorder = isSideQuest ? "border-amber-500" : "border-cyan-400";
  const themeBgHover = isSideQuest
    ? "hover:bg-amber-500/5 hover:border-amber-500/50"
    : "hover:bg-cyan-400/5 hover:border-cyan-400/50";

  return (
    // DIUBAH: Tag main diganti div. Dihapus pt-32 pb-40.
    // Lebar diatur agar konsisten dengan layout global.
    <div className="w-full px-4 md:px-6 relative overflow-hidden">
      {/* Background Decor Ambient */}
      <div
        className={`absolute top-0 left-[-10%] w-[500px] h-[500px] rounded-full blur-[150px] pointer-events-none ${isSideQuest ? "bg-amber-500/5" : "bg-cyan-500/5"}`}
      />
      <div className="absolute bottom-[20%] right-[-5%] w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        className="max-w-5xl mx-auto relative z-10"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* HEADER & BREADCRUMB */}
        <header className="mb-20">
          <motion.nav
            variants={itemVariants}
            className="mb-8 flex items-center gap-4"
          >
            <Button
              variant="outline"
              asChild
              className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest"
            >
              <Link href="/courses">
                <ArrowLeft size={14} className="mr-2" /> Pusat Rute
              </Link>
            </Button>
            <div className="h-[1px] flex-1 bg-white/5" />
            <span
              className={`text-[10px] font-mono font-black uppercase tracking-widest px-3 py-1 rounded border hidden sm:block ${isSideQuest ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : "bg-cyan-400/10 text-cyan-400 border-cyan-400/20"}`}
            >
              {isSideQuest ? "Side Quest" : "Main Track"}
            </span>
          </motion.nav>

          <motion.h1
            variants={itemVariants}
            className={`text-5xl md:text-7xl lg:text-8xl font-black uppercase italic tracking-tighter leading-none mb-8 drop-shadow-lg ${isSideQuest ? "text-amber-400" : "text-white"}`}
          >
            {data.category.title}
          </motion.h1>

          {data.category.description && (
            <motion.div
              variants={itemVariants}
              className={`neo-inset p-8 md:p-10 rounded-[2rem] border-l-8 ${themeBorder}`}
            >
              <p className="text-sm md:text-lg text-slate-200 font-medium leading-relaxed italic">
                {data.category.description}
              </p>
            </motion.div>
          )}
        </header>

        {/* AREA LATIHAN (MINI GAMES) */}
        <motion.section variants={itemVariants} className="mb-24">
          <div className="mb-10 flex items-center gap-4">
            <h3
              className={`text-xl font-black uppercase tracking-widest italic flex items-center gap-3 ${themeColor}`}
            >
              <span className="text-2xl not-italic">式</span> Area Latihan
            </h3>
            <div className="h-[1px] flex-1 bg-white/5" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <motion.div
              whileHover={{ y: -5 }}
              whileTap={{ scale: 0.98 }}
              className="h-full"
            >
              <Link
                href={`/courses/${categoryId}/flashcards`}
                className="group flex flex-col h-full"
                passHref
                legacyBehavior
              >
                <Card className="p-6 md:p-8 group hover:border-cyan-400/50 transition-all duration-300 flex flex-col items-center text-center gap-4 h-full cursor-pointer">
                  <div className="w-16 h-16 neo-inset text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Layers size={28} />
                  </div>
                  <div className="mt-auto">
                    <p className="text-xl font-black text-white group-hover:text-cyan-400 transition-colors uppercase italic tracking-tight mb-1">
                      Kosakata
                    </p>
                    <p className="text-slate-300 text-[10px] font-mono font-bold uppercase tracking-widest">
                      Mode Flashcard
                    </p>
                  </div>
                </Card>
              </Link>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              whileTap={{ scale: 0.98 }}
              className="h-full"
            >
              <Link
                href={`/courses/${categoryId}/kanji`}
                className="group flex flex-col h-full"
                passHref
                legacyBehavior
              >
                <Card className="p-6 md:p-8 group hover:border-purple-500/50 transition-all duration-300 flex flex-col items-center text-center gap-4 h-full cursor-pointer">
                  <div className="w-16 h-16 neo-inset text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <PenTool size={28} />
                  </div>
                  <div className="mt-auto">
                    <p className="text-xl font-black text-white group-hover:text-purple-400 transition-colors uppercase italic tracking-tight mb-1">
                      Kamus Kanji
                    </p>
                    <p className="text-slate-300 text-[10px] font-mono font-bold uppercase tracking-widest">
                      Baca & Tulis
                    </p>
                  </div>
                </Card>
              </Link>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              whileTap={{ scale: 0.98 }}
              className="sm:col-span-2 md:col-span-1 h-full"
            >
              <Link
                href={`/courses/${categoryId}/survival`}
                className="group flex flex-col h-full"
                passHref
                legacyBehavior
              >
                <Card className="p-6 md:p-8 group hover:border-red-500/50 transition-all duration-300 flex flex-col items-center text-center gap-4 h-full cursor-pointer">
                  <div className="w-16 h-16 neo-inset text-red-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Flame size={28} />
                  </div>
                  <div className="mt-auto">
                    <p className="text-xl font-black text-white group-hover:text-red-400 transition-colors uppercase italic tracking-tight mb-1">
                      Survival
                    </p>
                    <p className="text-slate-300 text-[10px] font-mono font-bold uppercase tracking-widest">
                      Adu Kecepatan
                    </p>
                  </div>
                </Card>
              </Link>
            </motion.div>
          </div>
        </motion.section>

        {/* UJIAN SIMULASI */}
        {data.mockExams && data.mockExams.length > 0 && (
          <motion.section variants={itemVariants} className="mb-24">
            <div className="mb-10 flex items-center gap-4">
              <h3 className="text-xl font-black uppercase tracking-widest italic flex items-center gap-3 text-amber-500">
                <span className="text-2xl not-italic">統</span> Ujian Simulasi
              </h3>
              <div className="h-[1px] flex-1 bg-white/5" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.mockExams.map((exam: any) => (
                <motion.div
                  key={exam._id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="h-full"
                >
                  <Link
                    href={`/exams/${exam._id}`}
                    className="group flex flex-col h-full"
                    passHref
                    legacyBehavior
                  >
                    <Card className="p-8 group hover:border-amber-500/50 hover:bg-amber-500/5 transition-all duration-300 flex items-center justify-between gap-6 h-full cursor-pointer">
                      <div className="flex-1">
                        <span className="inline-block px-3 py-1 text-[9px] font-black uppercase tracking-[0.3em] bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-md mb-3">
                          Sertifikasi Live
                        </span>
                        <h4 className="text-2xl font-black text-white uppercase italic tracking-tighter group-hover:text-amber-400 transition-colors mb-4">
                          {exam.title}
                        </h4>
                        <div className="flex gap-4 text-[10px] font-mono font-bold uppercase tracking-widest text-slate-300 mt-auto">
                          <span className="neo-inset px-2 py-1">
                            🕒 {exam.timeLimit} Menit
                          </span>
                          <span className="neo-inset px-2 py-1">
                            🎯 Pass: {exam.passingScore}/180
                          </span>
                        </div>
                      </div>
                      <div className="w-16 h-16 neo-inset text-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0 hidden sm:flex">
                        <Award size={28} />
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* DAFTAR SILABUS (LESSONS) */}
        <motion.section variants={itemVariants}>
          <div className="mb-10 flex items-center gap-4">
            <h3
              className={`text-xl font-black uppercase tracking-widest italic flex items-center gap-3 ${themeColor}`}
            >
              <span className="text-2xl not-italic">答</span> Daftar Materi
            </h3>
            <div className="h-[1px] flex-1 bg-white/5" />
          </div>

          {data.lessons && data.lessons.length > 0 ? (
            <div className="grid gap-6">
              {data.lessons.map((lesson: any, index: number) => (
                <motion.div
                  key={lesson._id}
                  variants={itemVariants}
                  whileHover={{ x: 10 }}
                >
                  <Link
                    href={`/courses/${categoryId}/${lesson.slug}`}
                    className="group flex flex-col"
                    passHref
                    legacyBehavior
                  >
                    <Card
                      className={`p-6 md:p-8 group ${themeBgHover} transition-all duration-300 flex flex-col sm:flex-row items-start sm:items-center gap-6 cursor-pointer`}
                    >
                      {/* Nomor Bab (Inset) */}
                      <div
                        className={`w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center font-black text-xl font-mono neo-inset transition-colors ${isSideQuest ? "text-amber-500 group-hover:bg-amber-500/20" : "text-cyan-400 group-hover:bg-cyan-400/20"}`}
                      >
                        {(index + 1).toString().padStart(2, "0")}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="text-xl md:text-3xl font-black text-white group-hover:tracking-wide transition-all italic uppercase tracking-tighter mb-2">
                          {lesson.title}
                        </h4>
                        {lesson.summary && (
                          <p className="text-slate-300 text-sm font-medium line-clamp-2 leading-relaxed">
                            {lesson.summary}
                          </p>
                        )}
                      </div>

                      {/* Icon Panah Kanan */}
                      <div
                        className={`w-10 h-10 shrink-0 rounded-full neo-inset items-center justify-center transition-colors hidden md:flex ${isSideQuest ? "text-amber-500 group-hover:bg-amber-500/20" : "text-cyan-400 group-hover:bg-cyan-400/20"}`}
                      >
                        <ChevronRight
                          size={18}
                          className="group-hover:translate-x-1 transition-transform"
                        />
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center p-16 neo-inset">
              <span className="text-5xl mb-6 block opacity-50">圦</span>
              <p className="text-slate-300 font-mono text-sm font-bold uppercase tracking-widest">
                Materi sedang dalam tahap penyusunan.
              </p>
            </div>
          )}
        </motion.section>
      </motion.div>
    </div>
  );
}
