/**
 * @file LessonGrid.tsx
 * @description Lesson grid component with pagination and completion status indicators synced with Supabase.
 * @module features/courses/components
 */

"use client";

// ==========================================
// Import & Dependencies
// ==========================================
import { m, Variants } from "framer-motion";
import { Sparkles, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { LessonCard } from "./LessonCard";

// ==========================================
// Component Interfaces
// ==========================================

/**
 * Lesson data structure.
 */
interface Lesson {
 _id: string;
 title: string;
 slug: string;
 summary?: string;
 image_url?: string;
}

/**
 * Props for LessonGrid component.
 */
interface LessonGridProps {
 lessons: Lesson[];
 currentPage: number;
 totalPages: number;
 onPageChange: (page: number) => void;
 categoryId: string;
 isSideQuest: boolean;
 completedLessons: Record<string, { isDeleted?: boolean; [key: string]: unknown }>;
 itemVariants: Variants;
}

// ======================
// EKSEKUSI UTAMA
// ======================

/**
 * Renders grid of lessons with pagination controls.
 */
export function LessonGrid({
 lessons,
 currentPage,
 totalPages,
 onPageChange,
 categoryId,
 isSideQuest,
 completedLessons,
 itemVariants,
}: LessonGridProps) {
 return (
 <m.section variants={itemVariants} className="pb-24 md:pb-32">
 <div className="mb-5 md:mb-8 flex items-center gap-4">
 <h3 className="text-xs sm:text-sm uppercase tracking-[0.2em] sm:tracking-[0.3em] text-muted-foreground">Daftar Pelajaran</h3>
 <div className="h-[1px] flex-1 bg-border" />
 </div>

 {lessons.length > 0 ? (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
 {lessons.map((lesson, index) => (
 <LessonCard
 key={lesson._id}
 lesson={lesson}
 // Calculate global index for animation delay
 index={index + (currentPage - 1) * 12} // Adjusted index for pagination
 categoryId={categoryId}
 isSideQuest={isSideQuest}
 // Set progress to 100 if lesson is completed and not deleted
 progress={completedLessons[lesson._id] && !completedLessons[lesson._id].isDeleted ? 100 : 0}
 />
 ))}
 </div>
 ) : (
 <div
 className="flex flex-col items-center justify-center py-16 sm:py-24 md:py-32 glass rounded-lg sm:rounded-xl text-center px-6 sm:px-10 border border-dashed border-border relative overflow-hidden"
 style={{
 backgroundColor: "hsl(var(--card)/0.2)",
 boxShadow: "0 10px 30px hsl(var(--foreground)/ 0.04)"
 }}
 >
 {/* Accent light glow */}
 <div className="absolute size-28 rounded-full bg-primary/5 blur-lg pointer-events-none" />

 <div
 className="size-14 sm:size-16 bg-background/50 border border-border rounded-lg flex items-center justify-center mb-5 sm:mb-6 shadow-md relative z-10 transition-transform duration-200 hover:scale-105"
 style={{
 backgroundColor: "hsl(var(--background)/0.5)"
 }}
 >
 <Sparkles size={28} className="text-muted-foreground/60" aria-hidden="true" />
 </div>

 <h4 className="text-lg sm:text-xl md:text-2xl text-foreground tracking-tight mb-2 sm:mb-3 uppercase relative z-10">
 Materi Sedang Disiapkan
 </h4>
 <p className="max-w-md text-muted-foreground text-xs sm:text-sm font-medium leading-relaxed relative z-10">
 Kami sedang merancang pelajaran terbaik untuk bagian ini. Tetap pantau untuk pengalaman belajar yang luar biasa!
 </p>
 </div>
 )}

 {/* Controls Halaman — Compact Mobile */}
 {totalPages > 1 && (
 <div className="flex flex-col items-center gap-4 mt-8 sm:mt-10 md:mt-14 relative z-10">
 <div className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] sm:tracking-[0.3em]">
 Halaman <span className="text-foreground">{currentPage}</span> dari {totalPages}
 </div>
 <div
 className="flex items-center gap-1 sm:gap-1.5 p-1.5 sm:p-2 rounded-xl sm:rounded-lg border"
 style={{
 backgroundColor: "hsl(var(--card)/0.3)",
 borderColor: "hsl(var(--border)/0.4)",
 boxShadow: "0 8px 24px hsl(var(--foreground)/ 0.08)"
 }}
 >
 <Button
 variant="ghost"
 size="icon"
 aria-label="Halaman pertama"
 onClick={() => onPageChange(1)}
 disabled={currentPage === 1}
 className="size-9 sm:size-10 rounded-lg sm:rounded-xl hover:bg-background transition-all disabled:opacity-20 border border-transparent hover:border-border"
 >
 <ChevronsLeft size={16} />
 </Button>
 <Button
 variant="ghost"
 size="icon"
 aria-label="Halaman sebelumnya"
 onClick={() => onPageChange(currentPage - 1)}
 disabled={currentPage === 1}
 className="size-9 sm:size-10 rounded-lg sm:rounded-xl hover:bg-background transition-all disabled:opacity-20 border border-transparent hover:border-border"
 >
 <ChevronLeft size={16} />
 </Button>

 <div className="flex items-center gap-1 px-1 sm:px-1.5">
 {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
 let pageNum;
 // Calculate page numbers to display in pagination bar
 if (totalPages <= 5) pageNum = i + 1;
 else if (currentPage <= 3) pageNum = i + 1;
 else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
 else pageNum = currentPage - 2 + i;

 const isCurrent = currentPage === pageNum;

 return (
 <Button
 key={pageNum}
 variant={isCurrent ? "default" : "ghost"}
 onClick={() => onPageChange(pageNum)}
 className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl font-bold transition-all border text-xs"
 style={{
 backgroundColor: isCurrent ? 'hsl(var(--foreground))' : 'transparent',
 color: isCurrent ? 'hsl(var(--background))' : 'hsl(var(--muted-foreground))',
 borderColor: isCurrent ? 'hsl(var(--foreground))' : 'hsl(var(--border)/0.3)'
 }}
 >
 {pageNum}
 </Button>
 );
 })}
 </div>

 <Button
 variant="ghost"
 size="icon"
 aria-label="Halaman berikutnya"
 onClick={() => onPageChange(currentPage + 1)}
 disabled={currentPage === totalPages}
 className="size-9 sm:size-10 rounded-lg sm:rounded-xl hover:bg-background transition-all disabled:opacity-20 border border-transparent hover:border-border"
 >
 <ChevronRight size={16} />
 </Button>
 <Button
 variant="ghost"
 size="icon"
 aria-label="Halaman terakhir"
 onClick={() => onPageChange(totalPages)}
 disabled={currentPage === totalPages}
 className="size-9 sm:size-10 rounded-lg sm:rounded-xl hover:bg-background transition-all disabled:opacity-20 border border-transparent hover:border-border"
 >
 <ChevronsRight size={16} />
 </Button>
 </div>
 </div>
 )}
 </m.section>
 );
}