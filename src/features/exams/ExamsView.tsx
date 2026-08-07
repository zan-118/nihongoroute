/**
 * @file ExamsView.tsx
 * @description Interactive JLPT exam simulation catalog view component with level filtering, mode tabs, and exam detail cards.
 * @module features/exams
 */

"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { m, Variants } from "framer-motion";
import {
 Pulse,
 Time,
 Target,
 ChevronRight,
 Alert,
} from "@/components/ui/icons";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ROUTES } from "@/lib/routes";
import {
 type ExamData,
 type ExamModeFilter,
 type ExamSubFilter,
 getExamSectionType,
 filterExams,
} from "@/features/exams/exam-catalog-engine";

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

export interface ExamsViewProps {
 exams: ExamData[];
}

export function ExamsView({ exams }: ExamsViewProps) {
 const [activeFilter, setActiveFilter] = useState<string>("all");
 const [activeMode, setActiveMode] = useState<ExamModeFilter>("all");
 const [activeSubFilter, setActiveSubFilter] = useState<ExamSubFilter>("all");

 const handleModeChange = (mode: ExamModeFilter) => {
 setActiveMode(mode);
 setActiveSubFilter("all");
 };

 const filteredExams = useMemo(() => {
 return filterExams(exams, activeFilter, activeMode, activeSubFilter);
 }, [exams, activeFilter, activeMode, activeSubFilter]);

 return (
 <div className="w-full px-4 sm:px-6 relative overflow-hidden bg-transparent text-foreground transition-colors duration-300 min-h-screen pt-8 sm:pt-12 pb-24">
 <div className="absolute top-[-8%] right-[-5%] size-105 bg-destructive/5 rounded-full blur-[70px] pointer-events-none ambient-glow will-change-transform" />
 <div className="absolute bottom-[10%] left-[-10%] size-90 bg-primary/5 rounded-full blur-[60px] pointer-events-none ambient-glow will-change-transform" />

 <m.div
 className="max-w-5xl mx-auto relative z-10"
 initial="hidden"
 animate="visible"
 variants={containerVariants}
 >
 <header className="mb-20">
 <m.div
 variants={itemVariants}
 className="flex items-center gap-4 mb-8"
 >
 <div className="size-3.5 rounded-full bg-destructive shadow-[0_0_8px_hsl(var(--destructive)/0.35)]" />
 <Badge
 variant="outline"
 className="text-destructive font-bold uppercase tracking-widest text-xs md:text-xs border-destructive/30 px-4 py-1.5 bg-destructive/5 rounded-xl h-auto"
 >
 Simulasi JLPT Aktif
 </Badge>
 </m.div>

 <m.h1
 variants={itemVariants}
 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-tighter leading-none mb-10 text-foreground drop-shadow-lg"
 >
 Pusat <br />{" "}
 <span className="text-destructive drop-shadow-[0_0_14px_hsl(var(--destructive)/0.3)]">
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

 <m.div variants={itemVariants} className="mb-12">
 <Card className="p-5 md:p-6 border-warning/30 bg-warning/5 flex items-start gap-4 rounded-lg shadow-lg">
 <div className="size-10 rounded-xl bg-warning/10 border border-warning/20 flex items-center justify-center shrink-0">
 <Alert className="text-warning" size={20} />
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
 ? "bg-destructive text-destructive-foreground border-transparent shadow-[0_0_12px_hsl(var(--destructive)/0.25)] scale-105"
 : "bg-card border-border hover:border-destructive/30 text-muted-foreground"
 }`}
 >
 {tab.label}
 </button>
 );
 })}
 </m.div>

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
 onClick={() => handleModeChange(tab.id as ExamModeFilter)}
 className={`px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
 isActive
 ? "bg-primary text-primary-foreground border-transparent shadow-[0_0_12px_hsl(var(--primary)/0.25)] scale-105"
 : "bg-card border-border hover:border-primary/30 text-muted-foreground"
 }`}
 >
 {tab.label}
 </button>
 );
 })}
 </m.div>

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
 onClick={() => setActiveSubFilter(subTab.id as ExamSubFilter)}
 className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border ${
 isActive
 ? "bg-secondary text-secondary-foreground border-transparent shadow-[0_0_10px_hsl(var(--secondary)/0.2)] scale-105"
 : "bg-card border-border hover:border-secondary/40 text-muted-foreground"
 }`}
 >
 {subTab.label}
 </button>
 );
 })}
 </m.div>
 )}

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
 <div className="relative group h-full">
 <div className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 pointer-events-none z-20">
 <div className="absolute top-0 right-0 w-3.5 h-px bg-destructive/20 group-hover:bg-destructive transition-colors duration-500" />
 <div className="absolute top-0 right-0 w-px h-3.5 bg-destructive/20 group-hover:bg-destructive transition-colors duration-500" />
 </div>

 <Card className="p-6 md:p-8 bg-card border border-border/50 dark:border-white/10 rounded-2xl group hover:bg-destructive/1 hover:border-destructive/40 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] flex flex-col h-full relative overflow-hidden cursor-pointer shadow-[0_4px_25px_rgba(0,0,0,0.015)]">

 <div className="flex justify-between items-start mb-8 md:mb-10 relative z-10">
 <div className="flex flex-wrap gap-2">
 <Badge
 variant="outline"
 className="px-3 py-1.5 text-xs md:text-xs font-bold uppercase tracking-widest text-destructive border-destructive/30 bg-muted rounded-[4px] h-auto"
 >
 {exam.levelCode || "GENERAL"}
 </Badge>
 {(() => {
 const sectionType = getExamSectionType(exam);
 let badgeText = "Simulasi";
 let badgeColorClass = "text-destructive border-destructive/30 bg-destructive/5";

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
 className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-[4px] h-auto ${badgeColorClass}`}
 >
 {badgeText}
 </Badge>
 );
 })()}
 </div>
 <div className="w-10 h-10 md:w-11 md:h-11 bg-muted border border-border/80 rounded-lg flex items-center justify-center text-muted-foreground group-hover:bg-destructive group-hover:text-destructive-foreground group-hover:border-none transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]">
 <Pulse size={18} />
 </div>
 </div>

 <h2 className="text-2xl md:text-3xl text-foreground group-hover:text-destructive dark:group-hover:text-destructive transition-colors uppercase tracking-tight mb-4 leading-tight relative z-10 font-bold">
 {exam.title}
 </h2>

 {exam.description && (
 <p className="text-muted-foreground text-xs md:text-sm font-semibold mb-8 line-clamp-2 relative z-10 group-hover:text-foreground transition-colors">
 {exam.description}
 </p>
 )}

 <div className="mt-auto relative z-10">
 <div className="grid grid-cols-2 gap-3 mb-8 md:mb-10">
 <div className="p-4 flex flex-col gap-1 items-center text-center rounded-lg bg-muted border border-border/60 group-hover:border-destructive/20 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]">
 <Time size={16} className="text-destructive mb-1" />
 <span className="text-[8px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground">
 Waktu
 </span>
 <span className="font-bold text-foreground text-base md:text-xl">
 {exam.timeLimit}m
 </span>
 </div>
 <div className="p-4 flex flex-col gap-1 items-center text-center rounded-lg bg-muted border border-border/60 group-hover:border-destructive/20 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]">
 <Target size={16} className="text-success mb-1" />
 <span className="text-[8px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground">
 Passing
 </span>
 <span className="font-bold text-success text-base md:text-xl">
 {exam.passingScore}p
 </span>
 </div>
 </div>

 <div className="w-full bg-muted border border-border/80 p-4 md:p-5 flex items-center justify-between group-hover:border-destructive/40 group-hover:bg-destructive group-hover:text-destructive-foreground transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] rounded-lg rounded-br-none shadow-sm">
 <span className="text-xs md:text-xs font-bold uppercase tracking-widest text-muted-foreground group-hover:text-destructive-foreground transition-colors">
 Mulai Ujian
 </span>
 <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-foreground/10 flex items-center justify-center group-hover:bg-destructive-foreground/15 group-hover:translate-x-1 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]">
 <ChevronRight size={16} />
 </div>
 </div>
 </div>
 </Card>
 </div>
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

export default ExamsView;
