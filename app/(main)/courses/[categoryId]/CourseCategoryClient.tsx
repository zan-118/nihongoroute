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
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AppBreadcrumbs from "@/components/layout/AppBreadcrumbs";

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
 */
interface Lesson {
  _id: string;
  title: string;
  slug: string;
  summary?: string;
}

export default function CourseCategoryClient({
  data,
  categoryId,
}: {
  data: {
    category: {
      title: string;
      description?: string;
      type: string;
    };
    lessons: Lesson[];
  };
  categoryId: string;
}) {
  const isSideQuest = data.category.type === "general";
  const themeColor = isSideQuest ? "text-amber-600 dark:text-amber-500" : "text-cyan-600 dark:text-cyan-400";
  const themeBorder = isSideQuest ? "border-amber-500" : "border-cyan-400";
    
  // ======================
  // RENDER
  // ======================
  return (
    <div className="w-full px-4 md:px-6 relative overflow-hidden bg-background text-foreground transition-colors duration-300 min-h-screen pt-12 pb-24">
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
              className="w-fit h-auto py-2.5 px-5 rounded-xl border border-border bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted transition-all text-[9px] font-bold uppercase tracking-widest neo-inset shadow-none"
            >
              <Link href="/courses">← Kembali</Link>
            </Button>
          </div>

          <motion.nav
            variants={itemVariants}
            className="mb-8 flex items-center gap-4"
          >
            <div className="h-[1px] flex-1 bg-border" />
            <span
              className={`text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded border hidden sm:block ${isSideQuest ? "bg-amber-500/10 text-amber-600 dark:text-amber-500 border-amber-500/20" : "bg-cyan-400/10 text-cyan-600 dark:text-cyan-400 border-cyan-400/20"}`}
            >
              {isSideQuest ? "Bahan Belajar Seru" : "Jalur Utama"}
            </span>
          </motion.nav>

          <motion.h1
            variants={itemVariants}
            className={`text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter leading-none mb-8 drop-shadow-lg ${isSideQuest ? "text-amber-500" : "text-foreground"}`}
          >
            {data.category.title}
          </motion.h1>

          {data.category.description && (
            <motion.div
              variants={itemVariants}
              className={`p-6 md:p-8 rounded-2xl border-l-4 bg-card border-border shadow-sm ${themeBorder}`}
            >
              <p className="text-sm md:text-lg text-muted-foreground font-medium leading-relaxed">
                {data.category.description}
              </p>
            </motion.div>
          )}
        </header>

        {/* AREA LATIHAN SECTION */}
        {!isSideQuest && (
          <motion.section variants={itemVariants} className="mb-20 md:mb-24">
            <div className="mb-6 md:mb-8 flex items-center gap-4">
              <h3
                className={`text-lg md:text-xl font-black uppercase tracking-tight flex items-center gap-3 ${themeColor}`}
              >
                Area Latihan
              </h3>
              <div className="h-[1px] flex-1 bg-border" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
              <Link href={`/courses/${categoryId}/flashcards`} className="group flex flex-col h-full">
                <Card className="p-6 md:p-8 bg-card border border-border rounded-2xl hover:border-cyan-400/40 hover:bg-cyan-400/[0.02] transition-all duration-300 flex flex-col items-center text-center gap-5 h-full cursor-pointer relative overflow-hidden group hover:shadow-xl">
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-muted border border-border rounded-xl text-cyan-500 dark:text-cyan-400 flex items-center justify-center group-hover:bg-cyan-500 dark:group-hover:bg-cyan-400 group-hover:text-white dark:group-hover:text-black transition-all duration-300 shadow-inner relative z-10">
                    <Layers size={24} />
                  </div>
                  <div className="mt-auto relative z-10">
                    <p className="text-lg md:text-xl font-black text-foreground group-hover:text-cyan-500 dark:group-hover:text-cyan-400 transition-colors uppercase tracking-tight mb-1">
                      Kosakata
                    </p>
                    <p className="text-muted-foreground text-[9px] font-bold uppercase tracking-widest">
                      Mode Flashcard
                    </p>
                  </div>
                </Card>
              </Link>

              <Link href={`/courses/${categoryId}/kanji`} className="group flex flex-col h-full">
                <Card className="p-6 md:p-8 bg-card border border-border rounded-2xl hover:border-purple-500/40 hover:bg-purple-500/[0.02] transition-all duration-300 flex flex-col items-center text-center gap-5 h-full cursor-pointer relative overflow-hidden group hover:shadow-xl">
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-muted border border-border rounded-xl text-purple-500 dark:text-purple-400 flex items-center justify-center group-hover:bg-purple-500 group-hover:text-white transition-all duration-300 shadow-inner relative z-10">
                    <PenTool size={24} />
                  </div>
                  <div className="mt-auto relative z-10">
                    <p className="text-lg md:text-xl font-black text-foreground group-hover:text-purple-500 dark:group-hover:text-purple-400 transition-colors uppercase tracking-tight mb-1">
                      Kamus Kanji
                    </p>
                    <p className="text-muted-foreground text-[9px] font-bold uppercase tracking-wider">
                      Baca & Tulis
                    </p>
                  </div>
                </Card>
              </Link>

              <Link href={`/courses/${categoryId}/survival`} className="group flex flex-col h-full">
                <Card className="p-6 md:p-8 bg-card border border-border rounded-2xl hover:border-red-500/40 hover:bg-red-500/[0.02] transition-all duration-300 flex flex-col items-center text-center gap-5 h-full cursor-pointer relative overflow-hidden group hover:shadow-xl">
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-muted border border-border rounded-xl text-red-500 flex items-center justify-center group-hover:bg-red-500 group-hover:text-white transition-all duration-300 shadow-inner relative z-10">
                    <Flame size={24} />
                  </div>
                  <div className="mt-auto relative z-10">
                    <p className="text-lg md:text-xl font-black text-foreground group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors uppercase tracking-tight mb-1">
                      Survival
                    </p>
                    <p className="text-muted-foreground text-[9px] font-bold uppercase tracking-widest">
                      Adu Kecepatan
                    </p>
                  </div>
                </Card>
              </Link>
            </div>
          </motion.section>
        )}

        {/* DAFTAR SILABUS SECTION */}
        <motion.section variants={itemVariants} className="pb-12">
          <div className="mb-6 md:mb-8 flex items-center gap-4">
            <h3
              className={`text-lg md:text-xl font-black uppercase tracking-wider flex items-center gap-3 ${themeColor}`}
            >
              Daftar Materi
            </h3>
            <div className="h-[1px] flex-1 bg-border" />
          </div>

          {data.lessons && data.lessons.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {data.lessons.map((lesson: Lesson, index: number) => (
                <motion.div
                  key={lesson._id}
                  variants={itemVariants}
                  whileHover={{ y: -8 }}
                >
                  <Link
                    href={`/courses/${categoryId}/${lesson.slug}`}
                    className="group flex flex-col h-full"
                  >
                    <Card
                      className={`p-6 md:p-8 bg-card border border-border rounded-3xl group transition-all duration-300 flex flex-col items-start gap-6 cursor-pointer hover:border-cyan-400/40 hover:bg-cyan-400/[0.02] h-full shadow-lg hover:shadow-2xl relative overflow-hidden`}
                    >
                      <div
                        className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center font-black text-base font-mono bg-muted border border-border transition-all duration-300 ${isSideQuest ? "text-amber-500 group-hover:bg-amber-500 group-hover:text-white" : "text-cyan-500 dark:text-cyan-400 group-hover:bg-cyan-500 dark:group-hover:bg-cyan-400 group-hover:text-white dark:group-hover:text-black"}`}
                      >
                        {(index + 1).toString().padStart(2, "0")}
                      </div>

                      <div className="flex-1">
                        <h4 className="text-xl md:text-2xl font-black text-foreground group-hover:text-cyan-500 dark:group-hover:text-cyan-400 transition-all uppercase tracking-tight mb-3 leading-tight">
                          {lesson.title}
                        </h4>
                        {lesson.summary && (
                          <p className="text-muted-foreground text-xs font-medium line-clamp-3 opacity-70 group-hover:opacity-100 transition-opacity leading-relaxed">
                            {lesson.summary}
                          </p>
                        )}
                      </div>

                      <div className="mt-auto pt-6 w-full flex items-center justify-between border-t border-border">
                        <span className={`text-[9px] font-bold uppercase tracking-widest ${isSideQuest ? "text-amber-500/50 group-hover:text-amber-500" : "text-cyan-500 dark:text-cyan-400/50 group-hover:text-cyan-500 dark:group-hover:text-cyan-400"}`}>
                          Baca Materi
                        </span>
                        <div
                          className={`w-8 h-8 rounded-lg border border-border flex items-center justify-center transition-all duration-300 bg-muted/50 ${isSideQuest ? "group-hover:bg-amber-500 group-hover:text-white" : "group-hover:bg-cyan-500 dark:group-hover:bg-cyan-400 group-hover:text-white dark:group-hover:text-black"}`}
                        >
                          <ChevronRight size={14} />
                        </div>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 md:py-32 bg-muted/20 border border-dashed border-border rounded-2xl text-center px-8 relative overflow-hidden group">
              <div className="w-20 h-20 bg-muted border border-border rounded-2xl flex items-center justify-center mb-8 group-hover:border-cyan-400/30 transition-all duration-500">
                <Sparkles size={32} className="text-muted-foreground group-hover:text-cyan-400 transition-colors" />
              </div>
              
              <h4 className="text-2xl md:text-3xl font-black text-foreground uppercase tracking-tight mb-3">
                Materi Lagi Diracik!
              </h4>
              <p className="max-w-md text-muted-foreground text-xs md:text-sm font-semibold leading-relaxed">
                Bagian ini masih dalam proses pengembangan. Sabar ya, materi terbaik sedang disiapkan buat kamu!
              </p>
            </div>
          )}
        </motion.section>
      </motion.div>
    </div>
  );
}
