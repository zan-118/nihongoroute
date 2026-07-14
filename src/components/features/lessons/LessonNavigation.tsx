/**
 * @file LessonNavigation.tsx
 * @description Komponen navigasi footer pelajaran (LessonNavigation) untuk beralih antara materi sebelumnya, materi selanjutnya, atau kembali ke daftar silabus.
 */

// ======================
// IMPOR
// ======================
import React from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

// ======================
// ANTARMUKA / TIPE DATA
// ======================

/**
 * Minimal lesson data structure for navigation links.
 */
export interface MinimalLessonData {
  /** Unique identifier slug for the lesson URL */
  slug: string;
  /** Display title of the lesson */
  title: string;
}

/**
 * Props for the LessonNavigation component.
 */
interface LessonNavigationProps {
  /** Previous lesson data or null if first lesson */
  prevLesson: MinimalLessonData | null;
  /** Next lesson data or null if last lesson */
  nextLesson: MinimalLessonData | null;
  /** Course level code identifier */
  levelCode: string;
  /** Course category identifier fallback */
  categoryId: string;
}

// ======================
// EKSEKUSI UTAMA
// ======================

/**
 * Footer navigation component to switch between lessons or return to course syllabus.
 */
export const LessonNavigation: React.FC<LessonNavigationProps> = ({ 
  prevLesson, 
  nextLesson, 
  levelCode, 
  categoryId 
}) => {
  return (
    <nav className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-12 border-t border-border mt-auto mb-20">
      {/* Render previous lesson link if available */}
      {prevLesson ? (
        <Link
          /* Fallback to categoryId if levelCode is empty */
          href={`/courses/${levelCode || categoryId}/${prevLesson.slug}`}
          className="neo-card h-full p-8 group flex flex-col justify-center items-start hover:bg-[rgb(var(--primary-rgb)/0.05)] hover:border-[rgb(var(--primary-rgb)/0.3)] transition-all duration-300"
        >
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-primary mb-3 flex items-center gap-2 transition-colors">
            <ChevronLeft size={14} aria-hidden="true" /> Materi Sebelumnya
          </span>
          <h4 className="text-xl uppercase text-foreground tracking-tight leading-tight">
            {prevLesson.title}
          </h4>
        </Link>
      ) : (
        /* Empty spacer for grid alignment on desktop when no previous lesson */
        <div className="hidden sm:block" />
      )}
      
      {/* Render next lesson link if available, otherwise show completion link */}
      {nextLesson ? (
        <Link
          /* Fallback to categoryId if levelCode is empty */
          href={`/courses/${levelCode || categoryId}/${nextLesson.slug}`}
          className="neo-card h-full p-8 group flex flex-col justify-center items-end text-right hover:bg-[rgb(var(--primary-rgb)/0.05)] hover:border-[rgb(var(--primary-rgb)/0.3)] transition-all duration-300"
        >
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-primary mb-3 flex items-center gap-2 transition-colors">
            Materi Selanjutnya <ChevronRight size={14} aria-hidden="true" />
          </span>
          <h4 className="text-xl uppercase text-foreground tracking-tight leading-tight">
            {nextLesson.title}
          </h4>
        </Link>
      ) : (
        <Link
          /* Link back to main course page when syllabus is completed */
          href={`/courses/${levelCode || categoryId}`}
          className="neo-card h-full p-8 flex flex-col items-center justify-center text-center group bg-[rgb(var(--primary-rgb)/0.05)] hover:bg-[rgb(var(--primary-rgb)/0.1)] border-[rgb(var(--primary-rgb)/0.2)] hover:border-primary transition-all duration-300"
        >
          <span className="text-4xl mb-3 group-hover:scale-110 transition-transform">
            🎉
          </span>
          <p className="text-xs font-black uppercase tracking-widest text-primary">
            Yeay! Materi Selesai
          </p>
        </Link>
      )}
    </nav>
  );
};