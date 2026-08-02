/**
 * @file CoursesView.tsx
 * @description Interactive landing view component for course syllabus categories, progress indicators, and path selection.
 * @module features/courses
 */

"use client";

import React from "react";
import { m } from "framer-motion";
import { GeneralCategoryCard } from "@/features/courses/components/GeneralCategoryCard";
import { useUserStore } from "@/store/useUserStore";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Sparkles, Trophy } from "@/components/ui/icons";

const containerVariants = {
 hidden: { opacity: 0 },
 visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
 hidden: { y: 16, opacity: 0 },
 visible: { y: 0, opacity: 1 },
};

export interface Category {
 _id: string;
 title: string;
 slug: string;
 type: string;
 description?: string;
 lessonCount?: number;
 previews?: { _id: string; title: string; slug: string }[];
}

export interface CoursesViewProps {
 categories: Category[];
}

export function CoursesView({ categories }: CoursesViewProps) {
 const completedLessons = useUserStore((s) => s.completedLessons);

 const { totalLessons, lessonsDoneCount, globalProgress, sortedCategories } =
 React.useMemo(() => {
 let lessonsTotal = 0;
 const jlpt: Category[] = [];
 const general: Category[] = [];

 for (const category of categories) {
 lessonsTotal += category.lessonCount || 0;

 if (category.type === "jlpt") {
 jlpt.push(category);
 } else if (category.type === "general" || category.type === "article") {
 general.push(category);
 }
 }

 jlpt.sort((a, b) => {
 const aNum = Number.parseInt(a.title.match(/N(\d)/)?.[1] || "6", 10);
 const bNum = Number.parseInt(b.title.match(/N(\d)/)?.[1] || "6", 10);
 return bNum - aNum;
 });

 const doneCount = Object.values(completedLessons).filter(
 (record) => record && record.completedAt && !record.isDeleted
 ).length;

 return {
 globalProgress:
 lessonsTotal > 0 ? Math.min(100, Math.round((doneCount / lessonsTotal) * 100)) : 0,
 lessonsDoneCount: doneCount,
 totalLessons: lessonsTotal,
 sortedCategories: [...jlpt, ...general],
 };
 }, [categories, completedLessons]);

 return (
 <div className="w-full relative overflow-hidden bg-transparent text-foreground transition-colors duration-300 min-h-screen pb-24 md:pb-32">
 <div className="absolute inset-0 pointer-events-none">
 <div
 className="absolute top-0 left-0 w-full h-75 md:h-100"
 style={{ background: 'linear-gradient(180deg, hsl(var(--primary)/0.05) 0%, transparent 100%)' }}
 />
 <div
 className="absolute bottom-0 right-0 w-65 h-65 rounded-full blur-[55px] opacity-15"
 style={{ backgroundColor: 'hsl(var(--secondary)/0.06)' }}
 />
 </div>

 <m.div
 className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 relative z-10 pt-6 md:pt-16"
 initial="hidden"
 animate="visible"
 variants={containerVariants}
 >
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
 <m.div
 variants={itemVariants}
 className="lg:col-span-3 relative group/jumbo"
 >
 <div className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 pointer-events-none z-20">
 <div className="absolute top-0 right-0 w-3.5 h-px bg-primary/20 group-hover/jumbo:bg-primary transition-colors duration-500" />
 <div className="absolute top-0 right-0 w-px h-3.5 bg-primary/20 group-hover/jumbo:bg-primary transition-colors duration-500" />
 </div>

 <Card className="h-full bg-card border border-border/50 dark:border-white/10 rounded-2xl p-8 sm:p-10 md:p-14 relative overflow-hidden shadow-[0_4px_25px_rgba(0,0,0,0.015)]">
 <div className="absolute top-0 right-0 size-64 bg-primary/5 rounded-full blur-[55px] pointer-events-none group-hover:bg-primary/8 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ambient-glow will-change-transform" />
 <div className="absolute inset-0 \-5 pointer-events-none" />
 
 <div className="absolute -bottom-10 -right-6 text-[15rem] md:text-[22rem] font-black font-noto-serif-jp opacity-[0.015] pointer-events-none select-none text-primary">
 道
 </div>

 <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-8 md:gap-12">
 <div className="space-y-4 max-w-2xl">
 <div className="flex items-center gap-3">
 <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 px-3.5 py-1 rounded-[4px] text-[9px] font-black uppercase tracking-[0.2em] shadow-none">
 <Sparkles size={10} className="mr-1.5 text-primary animate-pulse" /> Direktori Belajar
 </Badge>
 </div>
 <h1 className="text-3xl sm:text-5xl md:text-6xl uppercase tracking-tighter leading-[0.9] text-foreground font-bold">
 PILIH RUTE <br />
 <span className="text-primary font-bold">
 BELAJAR
 </span>
 </h1>
 <p className="text-muted-foreground text-xs sm:text-sm md:text-base font-semibold leading-relaxed">
 Mulai petualangan bahasa Jepangmu dengan kurikulum terstruktur untuk penguasaan cepat dan retensi jangka panjang.
 </p>
 </div>

 <div className="w-full xl:w-auto xl:min-w-[320px] p-6 rounded-lg bg-card border border-border/80 relative overflow-hidden transition-all duration-500 hover:border-primary/45 shadow-sm">
 <div className="space-y-4">
 <div className="flex items-center justify-between">
 <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
 <Trophy size={12} className="text-primary" /> Progres Global
 </span>
 <span className="text-xs font-black text-primary font-mono">{globalProgress}%</span>
 </div>

 <Progress
 value={globalProgress}
 className="h-2.5 bg-muted border border-border relative overflow-hidden"
 indicatorClassName="bg-primary"
 />

 <div className="flex justify-between items-center gap-4 pt-1">
 <div className="flex items-center gap-1.5">
 <span className="text-base font-black text-foreground">{lessonsDoneCount}</span>
 <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Selesai</span>
 </div>
 <div className="w-1.5 h-1.5 rounded-full bg-border" />
 <div className="flex items-center gap-1.5">
 <span className="text-base font-black text-foreground">{totalLessons}</span>
 <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Total Materi</span>
 </div>
 <div className="w-1.5 h-1.5 rounded-full bg-border" />
 <div className="flex items-center gap-1.5">
 <span className="text-base font-black text-foreground">{categories.length}</span>
 <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Rute</span>
 </div>
 </div>
 </div>
 </div>
 </div>
 </Card>
 </m.div>

 {sortedCategories.map((cat) => (
 <m.div key={cat._id} variants={itemVariants} className="lg:col-span-1">
 <GeneralCategoryCard cat={cat} variants={itemVariants} isFeatured={false} />
 </m.div>
 ))}

 </div>
 </m.div>
 </div>
 );
}

export default CoursesView;
