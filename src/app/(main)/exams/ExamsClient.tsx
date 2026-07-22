/**
 * @file ExamsClient.tsx
 * @description Antarmuka Daftar Ujian interaktif.
 * Menerima data mentah dari server dan membungkusnya dengan transisi Framer Motion.
 * @module ExamsClient
 */

"use client";

// ======================
// IMPOR
// ======================
import { useState, useMemo } from "react";
import Link from "next/link";
import { m, Variants } from "framer-motion";
import {
  Activity,
  Clock,
  Target,
  ChevronRight,
  AlertTriangle,
} from "@/components/ui/icons";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ROUTES } from "@/lib/routes";

// ======================
// KONFIGURASI / KONSTANTA
// ======================

/**
 * Framer Motion container animation configuration.
 */
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

/**
 * Framer Motion item animation configuration.
 */
const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } },
};

// ======================
// ANTARMUKA
// ======================

/**
 * Exam data structure.
 */
export interface ExamData {
  /** Unique identifier. */
  id?: string;
  /** Alternative MongoDB identifier. */
  _id?: string;
  /** Exam title. */
  title: string;
  /** Optional description. */
  description?: string | null;
  /** JLPT level code (e.g., N5, N4). */
  levelCode?: string;
  /** URL slug. */
  slug?: string | null;
  /** Time limit in minutes. */
  timeLimit: number;
  /** Minimum score to pass. */
  passingScore: number;
}

// ======================
// EKSEKUSI UTAMA
// ======================

/**
 * Menentukan tipe seksi ujian berdasarkan slug dan title.
 * 
 * @param {ExamData} exam Data ujian yang akan diuji
 * @returns {"moji-goi" | "bunpou" | "reading" | "listening" | "simulasi"} Tipe seksi ujian
 */
const getExamSectionType = (exam: ExamData): "moji-goi" | "bunpou" | "reading" | "listening" | "simulasi" => {
  const slug = (exam.slug || "").toLowerCase();
  const title = (exam.title || "").toLowerCase();
  
  // Match vocabulary keywords
  if (
    slug.includes("moji-goi") || 
    title.includes("moji/goi") || 
    title.includes("moji-goi") || 
    title.includes("kosakata")
  ) {
    return "moji-goi";
  }
  // Match grammar keywords
  if (
    slug.includes("bunpou") || 
    title.includes("bunpou") || 
    title.includes("tata bahasa")
  ) {
    return "bunpou";
  }
  // Match reading keywords
  if (
    slug.includes("reading") || 
    title.includes("reading") || 
    title.includes("membaca") || 
    slug.includes("dokkai") || 
    title.includes("dokkai")
  ) {
    return "reading";
  }
  // Match listening keywords
  if (
    slug.includes("listening") || 
    title.includes("listening") || 
    title.includes("mendengar") || 
    slug.includes("choukai") || 
    title.includes("choukai")
  ) {
    return "listening";
  }
  
  // Default to full simulation
  return "simulasi";
};

/**
 * Komponen ExamsClient: Merender antarmuka daftar ujian JLPT interaktif dengan animasi stagger Framer Motion.
 *
 * @param {Object} props Properti komponen.
 * @param {ExamData[]} props.exams Daftar data ujian dari database Supabase.
 * @returns {JSX.Element} Antarmuka daftar simulasi ujian.
 */
export default function ExamsClient({ exams }: { exams: ExamData[] }) {
  // Active level filter state (all, n5, n4, etc.)
  const [activeFilter, setActiveFilter] = useState<string>("all");
  // Active mode filter state (all, simulasi, latihan)
  const [activeMode, setActiveMode] = useState<"all" | "simulasi" | "latihan">("all");
  // Active sub-filter state for practice mode
  const [activeSubFilter, setActiveSubFilter] = useState<"all" | "moji-goi" | "bunpou" | "reading" | "listening">("all");

  /**
   * Check if exam is practice session.
   */
  const checkIsPractice = (exam: ExamData) => {
    return getExamSectionType(exam) !== "simulasi";
  };

  /**
   * Update mode and reset sub-filter.
   */
  const handleModeChange = (mode: "all" | "simulasi" | "latihan") => {
    setActiveMode(mode);
    setActiveSubFilter("all");
  };

  // Filter exams based on level, mode, and sub-filter criteria
  const filteredExams = useMemo(() => {
    return exams.filter((exam) => {
      const level = (exam.levelCode || "").toLowerCase().trim();
      let matchLevel = true;
      
      // Apply level filter
      if (activeFilter !== "all") {
        if (activeFilter === "general") {
          matchLevel = !["n1", "n2", "n3", "n4", "n5"].includes(level);
        } else {
          matchLevel = level === activeFilter;
        }
      }

      let matchMode = true;
      const sectionType = getExamSectionType(exam);
      const isPractice = sectionType !== "simulasi";

      // Apply mode filter
      if (activeMode !== "all") {
        const mode = isPractice ? "latihan" : "simulasi";
        matchMode = mode === activeMode;
      }

      let matchSubFilter = true;
      // Apply sub-filter for practice mode
      if (activeMode === "latihan" && activeSubFilter !== "all") {
        matchSubFilter = sectionType === activeSubFilter;
      }

      return matchLevel && matchMode && matchSubFilter;
    });
  }, [exams, activeFilter, activeMode, activeSubFilter]);

  // ======================
  // RENDER UTAMA
  // ======================
  return (
    <div className="w-full px-4 sm:px-6 relative overflow-hidden bg-transparent text-foreground transition-colors duration-300 min-h-screen pt-8 sm:pt-12 pb-24">
      {/* Dekorasi Ambient Latar Belakang */}
      <div className="absolute top-[-8%] right-[-5%] size-[420px] bg-destructive/5 rounded-full blur-[70px] pointer-events-none ambient-glow will-change-transform" />
      <div className="absolute bottom-[10%] left-[-10%] size-[360px] bg-primary/5 rounded-full blur-[60px] pointer-events-none ambient-glow will-change-transform" />

      <m.div
        className="max-w-5xl mx-auto relative z-10"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* BAGIAN TAJUK UTAMA (HEADER) */}
        <header className="mb-20">
          <m.div
            variants={itemVariants}
            className="flex items-center gap-4 mb-8"
          >
            <div className="size-3.5 rounded-full bg-destructive shadow-[0_0_8px_rgb(var(--destructive-rgb)/0.35)]" />
            <Badge
              variant="outline"
              className="text-destructive font-bold uppercase tracking-widest text-xs md:text-xs border-destructive/30 px-4 py-1.5 bg-destructive/5  rounded-xl h-auto"
            >
              Simulasi JLPT Aktif
            </Badge>
          </m.div>

          <m.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-tighter leading-none mb-10 text-foreground drop-shadow-lg"
          >
            Pusat <br />{" "}
            <span className="text-destructive drop-shadow-[0_0_14px_rgb(var(--destructive-rgb)/0.3)]">
              Simulasi
            </span>
          </m.h1>

          <m.div
            variants={itemVariants}
            className="p-6 md:p-8 rounded-lg border border-border/80 border-l-[3px] border-l-destructive/70 bg-card/60 glass shadow-xl relative overflow-hidden"
          >
          <div className="absolute inset-0 bg-destructive/5 pointer-events-none" />
            <p className="text-sm md:text-lg text-muted-foreground font-medium leading-relaxed relative z-10">
              Cek sejauh mana kemampuanmu dengan simulasi standar resmi. Jangan tegang, pasti bisa!
            </p>
          </m.div>
        </header>

        {/* BAGIAN PERINGATAN */}
        <m.div variants={itemVariants} className="mb-12">
          <Card className="p-5 md:p-6 border-warning/30 bg-warning/5 flex items-start gap-4 rounded-lg shadow-lg">
            <div className="size-10 rounded-xl bg-warning/10 border border-warning/20 flex items-center justify-center shrink-0">
               <AlertTriangle className="text-warning" size={20} />
            </div>
            <div>
              <h4 className="text-warning uppercase tracking-widest text-xs md:text-xs mb-1">
                Catatan Penting
              </h4>
              <p className="text-muted-foreground text-xs md:text-sm font-medium leading-relaxed">
                Cek sinyal dulu ya! Kalau kamu keluar di tengah jalan, progres ujianmu bakal hilang otomatis.
              </p>
            </div>
          </Card>
        </m.div>

        {/* TAB FILTER LEVEL */}
        <m.div variants={itemVariants} className="mb-10 flex flex-wrap gap-2 overflow-x-auto pb-2 no-scrollbar">
          {[
            { id: "all", label: "Semua" },
            { id: "n5", label: "JLPT N5" },
            { id: "n4", label: "JLPT N4" },
            { id: "n3", label: "JLPT N3" },
            { id: "n2", label: "JLPT N2" },
            { id: "n1", label: "JLPT N1" },
            { id: "general", label: "Lainnya" },
          ].map((tab) => {
            const isActive = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFilter(tab.id)}
                className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all border ${
                  isActive
                    ? "bg-destructive text-destructive-foreground border-transparent shadow-[0_0_12px_rgba(var(--destructive-rgb),0.25)] scale-105"
                    : "bg-card border-border hover:border-destructive/30 text-muted-foreground"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </m.div>

        {/* TAB FILTER MODE */}
        <m.div variants={itemVariants} className="mb-10 flex flex-wrap gap-2 overflow-x-auto pb-2 no-scrollbar border-t border-border/40 pt-4">
          {[
            { id: "all", label: "Semua Tipe" },
            { id: "simulasi", label: "Simulasi Lengkap" },
            { id: "latihan", label: "Latihan Sesi" },
          ].map((tab) => {
            const isActive = activeMode === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleModeChange(tab.id as "all" | "simulasi" | "latihan")}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                  isActive
                    ? "bg-primary text-primary-foreground border-transparent shadow-[0_0_12px_rgba(var(--primary-rgb),0.25)] scale-105"
                    : "bg-card border-border hover:border-primary/30 text-muted-foreground"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </m.div>

        {/* TAB SUB-FILTER SEKSI LATIHAN */}
        {activeMode === "latihan" && (
          <m.div 
            variants={itemVariants} 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 flex flex-wrap gap-2 overflow-x-auto pb-2 no-scrollbar border-t border-border/30 pt-4"
          >
            {[
              { id: "all", label: "Semua Latihan" },
              { id: "moji-goi", label: "Kosakata (Moji-Goi)" },
              { id: "bunpou", label: "Tata Bahasa (Bunpou)" },
              { id: "reading", label: "Membaca (Dokkai)" },
              { id: "listening", label: "Mendengar (Choukai)" },
            ].map((subTab) => {
              const isActive = activeSubFilter === subTab.id;
              return (
                <button
                  key={subTab.id}
                  type="button"
                  onClick={() => setActiveSubFilter(subTab.id as "all" | "moji-goi" | "bunpou" | "reading" | "listening")}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border ${
                    isActive
                      ? "bg-secondary text-secondary-foreground border-transparent shadow-[0_0_10px_rgba(var(--secondary-rgb),0.2)] scale-105"
                      : "bg-card border-border hover:border-secondary/40 text-muted-foreground"
                  }`}
                >
                  {subTab.label}
                </button>
              );
            })}
          </m.div>
        )}

        {/* KISI DAFTAR UJIAN */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 pb-20">
          {filteredExams.length > 0 ? (
            filteredExams.map((exam) => (
              <m.div
                key={exam.id || exam._id}
                variants={itemVariants}
                className="h-full"
              >
                <Link
                  href={ROUTES.EXAMS.SESSION(exam.slug || exam.id || "")}
                  className="block h-full"
                >
                  <Card className="p-6 md:p-8 group hover:border-destructive/40 hover:bg-destructive/[0.02] transition-all duration-200 flex flex-col h-full relative overflow-hidden cursor-pointer bg-card rounded-lg border-border hover:shadow-lg">

                    <div className="flex justify-between items-start mb-8 md:mb-10 relative z-10">
                      <div className="flex flex-wrap gap-2">
                        <Badge
                          variant="outline"
                          className="px-3 py-1.5 text-xs md:text-xs font-bold uppercase tracking-widest text-destructive border-destructive/30 bg-muted rounded-lg h-auto"
                        >
                          {exam.levelCode || "GENERAL"}
                        </Badge>
                        {(() => {
                          const sectionType = getExamSectionType(exam);
                          let badgeText = "Simulasi";
                          let badgeColorClass = "text-destructive border-destructive/30 bg-destructive/5";

                          // Determine badge color and text based on section type
                          if (sectionType === "moji-goi") {
                            badgeText = "Moji-Goi";
                            badgeColorClass = "text-warning border-warning/30 bg-warning/5";
                          } else if (sectionType === "bunpou") {
                            badgeText = "Bunpou";
                            badgeColorClass = "text-secondary border-secondary/30 bg-secondary/5";
                          } else if (sectionType === "reading") {
                            badgeText = "Dokkai";
                            badgeColorClass = "text-success border-success/30 bg-success/5";
                          } else if (sectionType === "listening") {
                            badgeText = "Choukai";
                            badgeColorClass = "text-primary border-primary/30 bg-primary/5";
                          }

                          return (
                            <Badge
                              variant="outline"
                              className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-lg h-auto ${badgeColorClass}`}
                            >
                              {badgeText}
                            </Badge>
                          );
                        })()}
                      </div>
                      <div className="w-10 h-10 md:w-11 md:h-11 bg-muted border border-border rounded-xl flex items-center justify-center text-muted-foreground group-hover:bg-destructive group-hover:text-destructive-foreground group-hover:border-none transition-all duration-300">
                        <Activity size={18} />
                      </div>
                    </div>

                    <h2 className="text-2xl md:text-3xl text-foreground group-hover:text-destructive dark:group-hover:text-destructive transition-colors uppercase tracking-tight mb-4 leading-tight relative z-10">
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
                          <span className="font-bold text-success text-base md:text-xl">
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
              </m.div>
            ))
          ) : (
            <m.div variants={itemVariants} className="col-span-full">
              <Card className="p-16 md:p-24 text-center bg-muted/20 border border-dashed border-border rounded-lg shadow-none">
                <span className="text-5xl mb-6 block opacity-30">圦</span>
                <p className="text-muted-foreground font-bold text-sm md:text-base uppercase tracking-widest">
                  Lagi Gak Ada Ujian Nih
                </p>
              </Card>
            </m.div>
          )}
        </div>
      </m.div>
    </div>
  );
}