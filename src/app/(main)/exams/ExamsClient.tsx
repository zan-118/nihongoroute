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
import { ROUTES } from "@/lib/routes";

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
// INTERFACES
// ======================
export interface ExamData {
  id?: string;
  _id?: string;
  title: string;
  description?: string;
  levelCode?: string;
  slug?: string;
  timeLimit: number;
  passingScore: number;
}

// ======================
// MAIN EXECUTION
// ======================

export default function ExamsClient({ exams }: { exams: ExamData[] }) {
  // ======================
  // RENDER
  // ======================
  return (
    <div className="w-full px-4 sm:px-6 relative overflow-hidden bg-background text-foreground transition-colors duration-300 min-h-screen pt-8 sm:pt-12 pb-24">
      {/* Background Ambient Decor */}
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-destructive/5 rounded-full blur-[150px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[10%] left-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

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
            <div className="w-3.5 h-3.5 rounded-full bg-destructive animate-pulse shadow-[0_0_15px_rgba(var(--destructive-rgb),0.5)]" />
            <Badge
              variant="outline"
              className="text-destructive text-destructive font-bold uppercase tracking-widest text-xs md:text-xs border-destructive/30 px-4 py-1.5 bg-destructive/5 backdrop-blur-md rounded-xl h-auto"
            >
              Simulasi JLPT Aktif
            </Badge>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-tighter leading-none mb-10 text-foreground drop-shadow-2xl"
          >
            Pusat <br />{" "}
            <span className="text-destructive drop-shadow-[0_0_30px_rgba(var(--destructive-rgb),0.5)]">
              Simulasi
            </span>
          </motion.h1>

          <motion.div
            variants={itemVariants}
            className="p-6 md:p-8 rounded-2xl border-l-4 border-destructive bg-card border-border shadow-2xl relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-red-600/5 to-transparent pointer-events-none" />
            <p className="text-sm md:text-lg text-muted-foreground font-medium leading-relaxed relative z-10">
              Cek sejauh mana kemampuanmu dengan simulasi standar resmi. Jangan tegang, pasti bisa!
            </p>
          </motion.div>
        </header>

        {/* WARNING SECTION */}
        <motion.div variants={itemVariants} className="mb-12">
          <Card className="p-5 md:p-6 border-warning/30 bg-warning/5 flex items-start gap-4 rounded-2xl shadow-lg">
            <div className="w-10 h-10 rounded-xl bg-warning/10 border border-warning/20 flex items-center justify-center shrink-0">
               <AlertTriangle className="text-warning text-warning" size={20} />
            </div>
            <div>
              <h4 className="text-warning text-warning font-bold uppercase tracking-widest text-xs md:text-xs mb-1">
                Catatan Penting
              </h4>
              <p className="text-muted-foreground text-xs md:text-sm font-medium leading-relaxed">
                Cek sinyal dulu ya! Kalau kamu keluar di tengah jalan, progres ujianmu bakal hilang otomatis.
              </p>
            </div>
          </Card>
        </motion.div>

        {/* EXAM LIST GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 pb-20">
          {exams.length > 0 ? (
            exams.map((exam) => (
              <motion.div
                key={exam.id || exam._id}
                variants={itemVariants}
                className="h-full"
              >
                <Link
                  href={ROUTES.EXAMS.SESSION(exam.slug || exam.id || "")}
                  className="block h-full"
                >
                  <Card className="p-6 md:p-8 group hover:border-destructive/40 hover:bg-destructive/[0.02] transition-all duration-300 flex flex-col h-full relative overflow-hidden cursor-pointer bg-card rounded-2xl border-border hover:shadow-[0_0_40px_rgba(var(--destructive-rgb),0.06)]">
                    
                    <div className="flex justify-between items-start mb-8 md:mb-10 relative z-10">
                      <Badge
                        variant="outline"
                        className="px-3 py-1.5 text-xs md:text-xs font-bold uppercase tracking-widest text-destructive text-destructive border-destructive/30 bg-muted rounded-lg h-auto"
                      >
                        {exam.levelCode || "GENERAL"}
                      </Badge>
                      <div className="w-10 h-10 md:w-11 md:h-11 bg-muted border border-border rounded-xl flex items-center justify-center text-muted-foreground group-hover:bg-destructive group-hover:text-destructive-foreground group-hover:border-none transition-all duration-300">
                        <Activity size={18} />
                      </div>
                    </div>

                    <h2 className="text-2xl md:text-3xl font-black text-foreground group-hover:text-destructive dark:group-hover:text-destructive transition-colors uppercase tracking-tight mb-4 leading-tight relative z-10">
                      {exam.title}
                    </h2>

                    {exam.description && (
                      <p className="text-muted-foreground text-xs md:text-sm font-medium mb-8 line-clamp-2 relative z-10 group-hover:text-foreground transition-colors">
                        {exam.description}
                      </p>
                    )}

                    <div className="mt-auto relative z-10">
                      <div className="grid grid-cols-2 gap-3 mb-8 md:mb-10">
                        <div className="p-4 flex flex-col gap-1 items-center text-center rounded-xl bg-muted border border-border group-hover:border-destructive/20 transition-all duration-300">
                          <Clock size={16} className="text-destructive mb-1" />
                          <span className="text-[8px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground">
                            Waktu
                          </span>
                          <span className="font-bold text-foreground text-base md:text-xl">
                            {exam.timeLimit}m
                          </span>
                        </div>
                        <div className="p-4 flex flex-col gap-1 items-center text-center rounded-xl bg-muted border border-border group-hover:border-destructive/20 transition-all duration-300">
                          <Target size={16} className="text-success mb-1" />
                          <span className="text-[8px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground">
                            Passing
                          </span>
                          <span className="font-bold text-success text-success text-base md:text-xl">
                            {exam.passingScore}p
                          </span>
                        </div>
                      </div>

                      <div className="w-full bg-muted border border-border p-4 md:p-5 flex items-center justify-between group-hover:border-destructive/40 group-hover:bg-destructive group-hover:text-destructive-foreground transition-all duration-300 rounded-xl shadow-sm">
                        <span className="text-xs md:text-xs font-bold uppercase tracking-widest text-muted-foreground group-hover:text-destructive-foreground transition-colors">
                          Mulai Ujian
                        </span>
                        <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-foreground/10 flex items-center justify-center group-hover:bg-destructive-foreground/10 transition-all duration-300">
                           <ChevronRight size={16} />
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))
          ) : (
            <motion.div variants={itemVariants} className="col-span-full">
              <Card className="p-16 md:p-24 text-center bg-muted/20 border border-dashed border-border rounded-2xl shadow-none">
                <span className="text-5xl mb-6 block opacity-30">圦</span>
                <p className="text-muted-foreground font-bold text-sm md:text-base uppercase tracking-widest">
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
