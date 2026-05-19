/**
 * @file CourseCategoryClient.tsx
 * @description Antarmuka Daftar Materi untuk level spesifik. 
 * Menampilkan pilihan latihan (flashcard, kanji, survival), simulasi ujian, dan daftar pelajaran.
 * @module CourseCategoryClient
 */

"use client";

import { motion, Variants } from "framer-motion";
import { useUserStore } from "@/store/useUserStore";
import { useState } from "react";

// Feature Components
import { CategoryHero } from "@/components/features/course/CategoryHero";
import { TrainingGround } from "@/components/features/course/TrainingGround";
import { MockExams } from "@/components/features/course/MockExams";
import { LessonGrid } from "@/components/features/course/LessonGrid";

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

const ITEMS_PER_PAGE = 12;

interface Lesson {
  _id: string;
  title: string;
  slug: string;
  summary?: string;
}

interface MockExam {
  id: string;
  title: string;
  timeLimit: number;
  passingScore: number;
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
      slug: string;
    };
    lessons: Lesson[];
    mockExams?: MockExam[];
  };
  categoryId: string;
}) {
  const isSideQuest = data.category.type === "general";
  const themeColor = isSideQuest ? "text-warning" : "text-primary";
  const themeRgb = isSideQuest ? "var(--warning-rgb)" : "var(--primary-rgb)";
  const completedLessons = useUserStore((s) => s.completedLessons);
  const [currentPage, setCurrentPage] = useState(1);

  const totalLessons = data.lessons?.length || 0;
  const lessonsDone = data.lessons?.filter(l => completedLessons[l._id] && !completedLessons[l._id].isDeleted).length || 0;
  const progressPercent = totalLessons > 0 ? Math.round((lessonsDone / totalLessons) * 100) : 0;

  const totalPages = Math.ceil(totalLessons / ITEMS_PER_PAGE);
  const paginatedLessons = (data.lessons || []).slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="w-full relative overflow-hidden bg-background text-foreground transition-colors duration-500 min-h-screen pb-32">
      {/* 1. PREMIUM BACKGROUND DECOR */}
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" 
          style={{ 
            backgroundImage: `linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)`,
            backgroundSize: '80px 80px'
          }}
        />
        
        {/* Ambient Glow Blobs using premium custom HSL / RGB values */}
        <div 
          className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full blur-[160px] animate-pulse" 
          style={{
            backgroundColor: isSideQuest ? "rgba(var(--warning-rgb), 0.08)" : "rgba(var(--primary-rgb), 0.08)"
          }}
        />
        <div 
          className="absolute bottom-[-5%] right-[-5%] w-[500px] h-[500px] rounded-full blur-[140px] animate-pulse" 
          style={{ 
            backgroundColor: "rgba(var(--secondary-rgb), 0.08)",
            animationDelay: '2s' 
          }} 
        />
        
        <div className="absolute top-40 left-0 w-full flex justify-center select-none overflow-hidden h-[500px]">
          <span className="text-[25vw] font-black uppercase tracking-[-0.05em] text-foreground/[0.02] dark:text-foreground/[0.03] leading-none whitespace-nowrap italic font-japanese">
            {data.category.title.split(' ')[0]}
          </span>
        </div>
      </div>

      <motion.div
        className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 pt-24 md:pt-32"
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

        <MockExams 
          exams={data.mockExams || []}
          itemVariants={itemVariants}
        />

        <LessonGrid 
          lessons={paginatedLessons}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          categoryId={categoryId}
          isSideQuest={isSideQuest}
          completedLessons={completedLessons}
          itemVariants={itemVariants}
        />
      </motion.div>
    </div>
  );
}
