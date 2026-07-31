/**
 * @file CourseCategoryView.tsx
 * @description Antarmuka Daftar Materi untuk level spesifik.
 * Menampilkan pilihan latihan (flashcard, kanji, survival), simulasi ujian, dan daftar pelajaran.
 * @module CourseCategoryView
 */

"use client";

// ======================
// IMPOR
// ======================
import { m, Variants } from "framer-motion";
import { useUserStore } from "@/store/useUserStore";
import { useCallback, useMemo, useState } from "react";

// Feature Components
import { CategoryHero } from "@/features/courses/components/CategoryHero";
import { TrainingGround } from "@/features/courses/components/TrainingGround";

import { LessonGrid } from "@/features/courses/components/LessonGrid";

// ======================
// KONSTANTA ANIMASI
// ======================
/**
 * Animation variants for container element.
 */
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

/**
 * Animation variants for child elements.
 */
const itemVariants: Variants = {
  hidden: { y: 16, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 120, damping: 20 } },
};

/**
 * Number of lessons displayed per page.
 */
const ITEMS_PER_PAGE = 12;

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
 * Mock exam data structure.
 */
interface MockExam {
  id: string;
  title: string;
  timeLimit: number;
  passingScore: number;
}

/**
 * CourseCategoryView component.
 * Renders category details, progress, training options, and paginated lessons.
 */
export default function CourseCategoryView({
  data,
  categoryId,
}: {
  data: {
    category: {
      title: string;
      description?: string;
      type: string;
      slug: string;
    };
    lessons: Lesson[];
    mockExams?: MockExam[];
  };
  categoryId: string;
}) {
  // Check if category is side quest (general/article)
  const isSideQuest = data.category.type === "general" || data.category.type === "article";
  
  // Set theme color based on category type
  const themeColor = isSideQuest ? "text-warning" : "text-primary";
  const themeRgb = isSideQuest ? "var(--warning-rgb)" : "var(--primary-rgb)";
  
  // Get completed lessons from global store
  const completedLessons = useUserStore((s) => s.completedLessons);
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate lesson progress and pagination data
  const { lessonsDone, progressPercent, totalLessons, totalPages, paginatedLessons } = useMemo(() => {
    const lessons = data.lessons || [];
    const lessonsTotal = lessons.length;
    let doneCount = 0;

    // Count completed lessons that are not deleted
    for (const lesson of lessons) {
      if (completedLessons[lesson._id] && !completedLessons[lesson._id].isDeleted) {
        doneCount += 1;
      }
    }

    return {
      lessonsDone: doneCount,
      paginatedLessons: lessons.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
      ),
      progressPercent:
        lessonsTotal > 0 ? Math.round((doneCount / lessonsTotal) * 100) : 0,
      totalLessons: lessonsTotal,
      totalPages: Math.ceil(lessonsTotal / ITEMS_PER_PAGE),
    };
  }, [completedLessons, currentPage, data.lessons]);

  // Handle page change and scroll to top
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="w-full relative overflow-hidden bg-transparent text-foreground transition-colors duration-300 min-h-screen pb-24 md:pb-32">
      {/* 1. DEKORASI LATAR BELAKANG — Subtle Only */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top gradient accent */}
        <div
          className="absolute top-0 left-0 w-full h-62.5 md:h-87.5"
          style={{
            background: isSideQuest
              ? 'linear-gradient(180deg, rgb(var(--warning-rgb)/0.04) 0%, transparent 100%)'
              : 'linear-gradient(180deg, rgb(var(--primary-rgb)/0.04) 0%, transparent 100%)'
          }}
        />
        {/* Corner accent blob — small */}
        <div
          className="absolute bottom-0 right-0 w-45 md:w-65 h-45 md:h-65 rounded-full blur-[45px] md:blur-[55px]"
          style={{ backgroundColor: 'rgb(var(--secondary-rgb)/0.05)' }}
        />
      </div>

      <m.div
        className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 relative z-10 pt-4 md:pt-8"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <CategoryHero
          title={data.category.title}
          description={data.category.description}
          isSideQuest={isSideQuest}
          progressPercent={progressPercent}
          lessonsDone={lessonsDone}
          totalLessons={totalLessons}
          themeColor={themeColor}
          themeRgb={themeRgb}
          itemVariants={itemVariants}
        />

        {!isSideQuest && (
          <TrainingGround
            categoryId={categoryId}
            themeColor={themeColor}
            itemVariants={itemVariants}
          />
        )}


        <LessonGrid
          lessons={paginatedLessons}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          categoryId={categoryId}
          isSideQuest={isSideQuest}
          completedLessons={completedLessons as unknown as Record<string, { isDeleted?: boolean; [key: string]: unknown }>}
          itemVariants={itemVariants}
        />
      </m.div>
    </div>
  );
}