"use client";

/**
 * @file ContinueLearning.tsx
 * @description Dashboard component rendering "Continue Learning" shortcut card.
 * Analyzes user completed lesson history from Zustand store, detects active courses, and highlights the next incomplete lesson.
 * @module features/dashboard/components
 */

// ==========================================
// Import & Dependencies
// ==========================================
import { useUserStore } from "@/store/useUserStore";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, ArrowRight, BookOpen, Check } from "@/components/ui/icons";
import Link from "next/link";
import { useMemo } from "react";
import { m } from "framer-motion";

// ==========================================
// Component Props Interface
// ==========================================
/**
 * Props for ContinueLearning component.
 * Contains course metadata array.
 */
interface ContinueLearningProps {
 courseMetadata: Array<{
 _id: string;
 title: string;
 slug: string;
 lessons: Array<{
 _id: string;
 title: string;
 slug: string;
 }>;
 }>;
}

// ==========================================
// Main Component
// ==========================================
/**
 * ContinueLearning component.
 * Render shortcut to next incomplete lesson.
 * Show progress bar and percentage.
 */
export default function ContinueLearning({ courseMetadata }: ContinueLearningProps) {
 // Get completed lessons from Zustand store.
 const completedLessons = useUserStore(s => s.completedLessons);

 // Logika untuk menemukan kursus aktif dan pelajaran berikutnya berdasarkan riwayat penyelesaian
 // Compute active course and next lesson.
 const activeData = useMemo(() => {
 if (!courseMetadata || courseMetadata.length === 0) return null;

 // 1. Hitung progres untuk setiap kategori/kursus
 // Map courses to calculate progress and last update time.
 const stats = courseMetadata.map(cat => {
 const lessons = cat.lessons || [];
 const completedInCat = lessons.filter(lesson => {
 const record = completedLessons[lesson._id];
 return record && record.completedAt;
 });
 
 const totalLessons = lessons.length;
 const progress = totalLessons > 0 
 ? (completedInCat.length / totalLessons) * 100 
 : 0;
 
 // Temukan waktu pelajaran terakhir yang diperbarui di kategori ini
 // Find latest update timestamp.
 const lastUpdate = lessons.reduce((max, lesson) => {
 const ts = completedLessons[lesson._id]?.updatedAt || 0;
 return ts > max ? ts : max;
 }, 0);

 return { ...cat, lessons, progress, lastUpdate, completedCount: completedInCat.length, totalLessons };
 });

 // 2. Temukan kursus "Aktif" (memiliki progres tetapi belum 100%, dan paling baru diperbarui)
 // Jika tidak ada yang memiliki progres, pilih kategori pertama (biasanya N5)
 // Find course in progress. Fallback to first incomplete.
 let active = stats
 .filter(s => s.progress > 0 && s.progress < 100)
 .sort((a, b) => b.lastUpdate - a.lastUpdate)[0] as typeof stats[number] | undefined;

 if (!active) {
 // Jika tidak ada kursus yang selesai sebagian, cari kursus pertama yang belum 100%
 // Fallback to first incomplete course.
 active = stats.find(s => s.progress < 100);
 }

 if (!active || !active.lessons || active.lessons.length === 0) return null;

 // 3. Temukan pelajaran berikutnya dalam urutan kursus aktif yang belum diselesaikan
 // Find first uncompleted lesson.
 const nextLessonIndex = active.lessons.findIndex(l => !completedLessons[l._id]?.completedAt);
 const nextLesson = active.lessons[nextLessonIndex] || active.lessons[0];

 if (!nextLesson) return null;

 return {
 courseTitle: active.title,
 courseSlug: active.slug,
 progress: active.progress,
 lessonTitle: nextLesson.title,
 lessonSlug: nextLesson.slug,
 completedCount: active.completedCount,
 totalLessons: active.totalLessons,
 isNew: active.progress === 0
 };
 }, [courseMetadata, completedLessons]);

 if (!activeData) return null;

 return (
 <div className="w-full space-y-[21px]">
 <div className="flex flex-col gap-2">
 <div className="flex items-center gap-[13px]">
 <div className="w-[34px] h-[1px] bg-primary/40" />
 <h2 className="text-[10px] uppercase tracking-[0.2em] text-primary">
 Lanjut Belajar
 </h2>
 </div>
 <div className="flex items-end justify-between">
 <h3 className="text-xl md:text-2xl text-foreground tracking-tight">
 {activeData.isNew ? "Mulai Perjalanan" : "Lanjut Belajar"}
 </h3>
 <Link href="/courses" className="text-[10px] font-bold text-primary hover:text-foreground transition-colors uppercase tracking-widest flex items-center gap-1 group">
 Lihat Semua <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
 </Link>
 </div>
 </div>

 <div className="relative group">
 {/* Tombou Register Mark (L-shape offset 6px outside rounded-2xl) */}
 <div className="absolute -top-[6px] -right-[6px] w-[14px] h-[14px] pointer-events-none z-20">
 <div 
 className="absolute top-0 right-0 w-[14px] h-[1px] transition-colors duration-500" 
 style={{ backgroundColor: activeData.progress === 100 ? "var(--success)" : "var(--primary)" }}
 />
 <div 
 className="absolute top-0 right-0 w-[1px] h-[14px] transition-colors duration-500" 
 style={{ backgroundColor: activeData.progress === 100 ? "var(--success)" : "var(--primary)" }}
 />
 </div>

 <Card className="relative overflow-hidden border border-border/50 dark:border-white/10 bg-card p-0 rounded-2xl shadow-[0_4px_25px_rgba(0,0,0,0.015)] group-hover:border-primary/50 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]">
 {/* Subtle background progression tint */}
 <div 
 className="absolute left-0 top-0 bottom-0 bg-primary/5 transition-all duration-1000 ease-out pointer-events-none" 
 style={{ width: `${activeData.progress}%` }}
 />

 <div className="relative z-10 flex flex-col md:flex-row items-center gap-[34px] p-[34px]">
 {/* Area Ikon / Miniatur */}
 <div className="shrink-0 relative transition-transform duration-300 group-hover:scale-105">
 <div className="size-[89px] rounded-lg bg-card border border-border/60 flex items-center justify-center shadow-md overflow-hidden group-hover:border-primary/30 transition-colors">
 {activeData.progress === 100 ? (
 <Check size={34} className="text-success" />
 ) : (
 <BookOpen size={34} className="text-primary group-hover:scale-110 transition-transform duration-500" />
 )}
 </div>
 
 {/* Lencana Persentase Progres */}
 <div className={`absolute -bottom-2 -right-2 text-background text-[10px] font-black px-3 py-1 rounded-[4px] border border-border shadow-md transition-colors ${activeData.progress === 100 ? 'bg-success text-success-foreground border-success/30' : 'bg-foreground'}`}>
 {Math.round(activeData.progress)}%
 </div>
 </div>

 {/* Area Informasi Judul & Progres */}
 <div className="flex-1 text-center md:text-left">
 <div className="flex flex-col gap-1 mb-[13px]">
 <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] opacity-80">
 {activeData.courseTitle}
 </span>
 <h4 className="text-2xl md:text-3xl text-foreground tracking-tight line-clamp-1 transition-colors group-hover:text-primary font-bold">
 {activeData.lessonTitle}
 </h4>
 </div>
 
 <div className="flex items-center justify-center md:justify-start gap-4">
 <div className="flex items-center gap-2">
 <div className="flex -space-x-1">
 {/* Render progress dots based on percentage */}
 {[...Array(3)].map((_, i) => {
 const isDotActive = i < Math.floor(activeData.progress / 33);
 return (
 <div 
 key={`progress-dot-${i}`} 
 className={`w-1.5 h-3 rounded-full border border-background transition-all duration-500 ${
 isDotActive 
 ? activeData.progress === 100
 ? 'bg-success'
 : 'bg-primary' 
 : 'bg-background/10'
 }`} 
 />
 );
 })}
 </div>
 <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
 {activeData.completedCount} / {activeData.totalLessons} Pelajaran
 </span>
 </div>
 </div>
 </div>

 {/* Area Tombol Aksi - Asymmetric Calligraphic Cut */}
 <div className="w-full md:w-auto shrink-0 transition-transform active:scale-[0.98]">
 <Button asChild className="w-full md:w-auto h-[70px] pl-8 pr-6 rounded-lg rounded-br-none bg-foreground text-background hover:bg-primary hover:text-primary-foreground font-black uppercase tracking-widest transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group border-none">
 <Link href={`/courses/${activeData.courseSlug}/${activeData.lessonSlug}`} className="flex items-center justify-between gap-4">
 <span>{activeData.isNew ? "Mulai" : "Lanjut"}</span>
 <span className="flex h-9 w-9 items-center justify-center rounded-full bg-background/20 group-hover:bg-primary-foreground/20 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:rotate-12">
 <Play size={14} fill="currentColor" />
 </span>
 </Link>
 </Button>
 </div>
 </div>

 {/* Batang Progres Tipis di Sisi Bawah Card */}
 <div className="absolute bottom-0 left-0 w-full h-[2px] bg-border/50">
 <m.div 
 initial={{ width: 0 }}
 animate={{ width: `${activeData.progress}%` }}
 transition={{ duration: 1.5, ease: "easeOut" }}
 className={`h-full relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before: before: before: before: ${
 activeData.progress === 100
 ? "bg-success"
 : "bg-primary"
 }`}
 />
 </div>
 </Card>
 </div>
 </div>
 );
}