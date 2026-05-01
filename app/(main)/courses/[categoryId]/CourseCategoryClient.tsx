/**
 * @file CourseCategoryClient.tsx
 * @description Antarmuka Daftar Materi untuk level spesifik. 
 * Menampilkan pilihan latihan (flashcard, kanji, survival), simulasi ujian, dan daftar pelajaran.
 * @module CourseCategoryClient
 */

"use client";

// ======================
// IMPORTS
// ======================
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import {
  Layers,
  PenTool,
  Flame,
  Award,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AppBreadcrumbs from "@/components/AppBreadcrumbs";

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
 * Komponen CourseCategoryClient: Menampilkan struktur kurikulum level spesifik.
 * 
 * @param {Object} props - Properti komponen.
 * @param {any} props.data - Data kategori, pelajaran, dan ujian.
 * @param {string} props.categoryId - ID Kategori (e.g., "n5").
 * @returns {JSX.Element} Antarmuka kategori materi.
 */
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
    
  // ======================
  // RENDER
  // ======================
  return (
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
        {/* HEADER & BREADCRUMB SECTION */}
        <header className="mb-20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
            <AppBreadcrumbs 
              items={[
                { label: "Pusat Belajar", href: "/courses" },
                { label: data.category.title, active: true }
              ]} 
            />
            <Button
              variant="ghost"
              asChild
              className="w-fit h-auto py-2.5 px-5 rounded-xl border border-white/5 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all text-[10px] font-black uppercase tracking-widest neo-inset"
            >
              <Link href="/library">← Ke Pustaka</Link>
            </Button>
          </div>

          <motion.nav
            variants={itemVariants}
            className="mb-8 flex items-center gap-4"
          >
            <div className="h-[1px] flex-1 bg-white/5" />
            <span
              className={`text-[10px] font-mono font-black uppercase tracking-widest px-3 py-1 rounded border hidden sm:block ${isSideQuest ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : "bg-cyan-400/10 text-cyan-400 border-cyan-400/20"}`}
            >
              {isSideQuest ? "Bahan Belajar Seru" : "Jalur Utama"}
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

        {/* AREA LATIHAN (MINI GAMES) SECTION */}
        <motion.section variants={itemVariants} className="mb-20 md:mb-24">
          <div className="mb-8 md:mb-10 flex items-center gap-4">
            <h3
              className={`text-lg md:text-xl font-black uppercase tracking-[0.3em] italic flex items-center gap-3 ${themeColor}`}
            >
              <span className="text-2xl not-italic opacity-50">式</span> Area Latihan
            </h3>
            <div className="h-[1px] flex-1 bg-white/5" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            <motion.div
              whileHover={{ y: -8 }}
              whileTap={{ scale: 0.98 }}
              className="h-full"
            >
              <Link
                href={`/courses/${categoryId}/flashcards`}
                className="group flex flex-col h-full"
              >
                <Card className="p-8 md:p-10 bg-slate-900/40 backdrop-blur-xl border-white/10 rounded-[2.5rem] hover:border-cyan-400/50 hover:bg-cyan-400/[0.02] transition-all duration-500 flex flex-col items-center text-center gap-6 h-full cursor-pointer relative overflow-hidden group hover:shadow-[0_20px_40px_rgba(34,211,238,0.1)]">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-white/5 border border-white/10 rounded-2xl md:rounded-3xl text-cyan-400 flex items-center justify-center group-hover:bg-cyan-400 group-hover:text-black transition-all duration-500 shadow-inner relative z-10">
                    <Layers size={32} />
                  </div>
                  <div className="mt-auto relative z-10">
                    <p className="text-xl md:text-2xl font-black text-white group-hover:text-cyan-400 transition-colors uppercase italic tracking-tighter mb-2">
                      Kosakata
                    </p>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">
                      Mode Flashcard
                    </p>
                  </div>
                </Card>
              </Link>
            </motion.div>

            <motion.div
              whileHover={{ y: -8 }}
              whileTap={{ scale: 0.98 }}
              className="h-full"
            >
              <Link
                href={`/courses/${categoryId}/kanji`}
                className="group flex flex-col h-full"
              >
                <Card className="p-8 md:p-10 bg-slate-900/40 backdrop-blur-xl border-white/10 rounded-[2.5rem] hover:border-purple-500/50 hover:bg-purple-500/[0.02] transition-all duration-500 flex flex-col items-center text-center gap-6 h-full cursor-pointer relative overflow-hidden group hover:shadow-[0_20px_40px_rgba(168,85,247,0.1)]">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-white/5 border border-white/10 rounded-2xl md:rounded-3xl text-purple-400 flex items-center justify-center group-hover:bg-purple-500 group-hover:text-white transition-all duration-500 shadow-inner relative z-10">
                    <PenTool size={32} />
                  </div>
                  <div className="mt-auto relative z-10">
                    <p className="text-xl md:text-2xl font-black text-white group-hover:text-purple-400 transition-colors uppercase italic tracking-tighter mb-2">
                      Kamus Kanji
                    </p>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">
                      Baca & Tulis
                    </p>
                  </div>
                </Card>
              </Link>
            </motion.div>

            <motion.div
              whileHover={{ y: -8 }}
              whileTap={{ scale: 0.98 }}
              className="sm:col-span-2 md:col-span-1 h-full"
            >
              <Link
                href={`/courses/${categoryId}/survival`}
                className="group flex flex-col h-full"
              >
                <Card className="p-8 md:p-10 bg-slate-900/40 backdrop-blur-xl border-white/10 rounded-[2.5rem] hover:border-red-500/50 hover:bg-red-500/[0.02] transition-all duration-500 flex flex-col items-center text-center gap-6 h-full cursor-pointer relative overflow-hidden group hover:shadow-[0_20px_40px_rgba(239,68,68,0.1)]">
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-white/5 border border-white/10 rounded-2xl md:rounded-3xl text-red-500 flex items-center justify-center group-hover:bg-red-500 group-hover:text-white transition-all duration-500 shadow-inner relative z-10">
                    <Flame size={32} />
                  </div>
                  <div className="mt-auto relative z-10">
                    <p className="text-xl md:text-2xl font-black text-white group-hover:text-red-400 transition-colors uppercase italic tracking-tighter mb-2">
                      Survival
                    </p>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">
                      Adu Kecepatan
                    </p>
                  </div>
                </Card>
              </Link>
            </motion.div>
          </div>
        </motion.section>

        {/* DAFTAR SILABUS (LESSONS) SECTION */}
        <motion.section variants={itemVariants} className="pb-12">
          <div className="mb-8 md:mb-10 flex items-center gap-4">
            <h3
              className={`text-lg md:text-xl font-black uppercase tracking-[0.3em] italic flex items-center gap-3 ${themeColor}`}
            >
              <span className="text-2xl not-italic opacity-50">答</span> Daftar Materi
            </h3>
            <div className="h-[1px] flex-1 bg-white/5" />
          </div>

          {data.lessons && data.lessons.length > 0 ? (
            <div className="grid gap-4 md:gap-6">
              {data.lessons.map((lesson: any, index: number) => (
                <motion.div
                  key={lesson._id}
                  variants={itemVariants}
                  whileHover={{ x: 12 }}
                >
                  <Link
                    href={`/courses/${categoryId}/${lesson.slug}`}
                    className="group flex flex-col"
                  >
                    <Card
                      className={`p-5 md:p-7 bg-slate-900/40 backdrop-blur-md border-white/5 rounded-3xl md:rounded-[2.5rem] group ${themeBgHover} transition-all duration-500 flex flex-col sm:flex-row items-start sm:items-center gap-6 cursor-pointer hover:border-white/20`}
                    >
                      <div
                        className={`w-12 h-12 md:w-14 md:h-14 shrink-0 rounded-xl md:rounded-2xl flex items-center justify-center font-black text-lg md:text-xl font-mono bg-white/5 border border-white/10 transition-all duration-500 ${isSideQuest ? "text-amber-500 group-hover:bg-amber-500 group-hover:text-black group-hover:border-none" : "text-cyan-400 group-hover:bg-cyan-400 group-hover:text-black group-hover:border-none"}`}
                      >
                        {(index + 1).toString().padStart(2, "0")}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="text-lg md:text-2xl font-black text-white group-hover:text-cyan-400 transition-all italic uppercase tracking-tighter mb-1">
                          {lesson.title}
                        </h4>
                        {lesson.summary && (
                          <p className="text-slate-400 text-[11px] md:text-xs font-bold italic line-clamp-1 leading-relaxed opacity-70 group-hover:opacity-100 transition-opacity">
                            {lesson.summary}
                          </p>
                        )}
                      </div>

                      <div
                        className={`w-10 h-10 shrink-0 rounded-full border border-white/10 items-center justify-center transition-all duration-500 hidden md:flex ${isSideQuest ? "text-amber-500 group-hover:bg-amber-500 group-hover:text-black group-hover:border-none shadow-[0_0_15px_rgba(245,158,11,0.3)]" : "text-cyan-400 group-hover:bg-cyan-400 group-hover:text-black group-hover:border-none shadow-[0_0_15px_rgba(34,211,238,0.3)]"}`}
                      >
                        <ChevronRight
                          size={18}
                          className="group-hover:translate-x-1.5 transition-transform"
                        />
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 md:py-32 bg-slate-900/40 backdrop-blur-xl border border-dashed border-white/10 rounded-[3rem] md:rounded-[5rem] text-center px-8 relative overflow-hidden group">
              {/* Decorative background glow */}
              <div className="absolute inset-0 bg-gradient-to-b from-cyan-400/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
              
              <div className="w-24 h-24 md:w-32 md:h-32 bg-white/5 border border-white/10 rounded-[2.5rem] flex items-center justify-center mb-10 group-hover:scale-110 group-hover:border-cyan-400/40 transition-all duration-700 shadow-2xl relative z-10">
                <Sparkles size={48} className="text-slate-600 group-hover:text-cyan-400 transition-colors duration-700" />
              </div>
              
              <h4 className="text-2xl md:text-4xl font-black text-white italic uppercase tracking-tighter mb-4 relative z-10">
                Sabar ya, <span className="text-cyan-400">Materi Lagi Diracik!</span>
              </h4>
              <p className="max-w-md text-slate-400 text-sm md:text-base font-bold italic leading-relaxed relative z-10">
                Wah, bagian ini masih dalam proses masak nih. Sabar ya, kami pasti bakal kasih materi paling oke buat kamu. Balik lagi nanti ya!
              </p>
              
              <div className="mt-12 flex flex-col sm:flex-row gap-4 relative z-10">
                <Button asChild variant="ghost" className="rounded-xl font-black uppercase tracking-widest text-[10px] h-12 px-8 bg-white/5 border border-white/10 hover:bg-white/10">
                  <Link href="/courses">Kembali ke Rute</Link>
                </Button>
                <Button asChild variant="ghost" className="rounded-xl font-black uppercase tracking-widest text-[10px] h-12 px-8 bg-cyan-400/10 text-cyan-400 border border-cyan-400/20 hover:bg-cyan-400 hover:text-black">
                  <Link href="/library">Buka Pustaka</Link>
                </Button>
              </div>
            </div>
          )}
        </motion.section>
      </motion.div>
    </div>
  );
}
