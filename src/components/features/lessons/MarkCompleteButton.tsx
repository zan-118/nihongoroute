/**
 * @file MarkCompleteButton.tsx
 * @description Komponen tombol "Tandai Selesai" (MarkCompleteButton) untuk menyimpan progres belajar, menambah XP pengguna, dan berpindah ke materi selanjutnya.
 */

"use client";

// ======================
// IMPOR
// ======================
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "@/components/ui/icons";
import { useUserStore } from "@/store/useUserStore";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ======================
// ANTARMUKA / TIPE DATA
// ======================
/**
 * Props for MarkCompleteButton component.
 */
interface MarkCompleteButtonProps {
  /** ID of current lesson. */
  lessonId: string;
  /** Slug of next lesson for navigation. */
  nextLessonSlug?: string;
  /** ID of category for navigation fallback. */
  categoryId?: string;
}

// ======================
// EKSEKUSI UTAMA
// ======================
/**
 * Button component to mark lesson complete, award XP, and navigate.
 */
export const MarkCompleteButton: React.FC<MarkCompleteButtonProps> = ({ lessonId, nextLessonSlug, categoryId }) => {
  const router = useRouter();
  const [marked, setMarked] = useState(false);
  const completeLesson = useUserStore((s) => s.completeLesson);
  const completedLessons = useUserStore((s) => s.completedLessons);
  const addXP = useUserStore((s) => s.addXP);

  // Check if lesson already completed and not deleted.
  const isCompleted = completedLessons[lessonId] && !completedLessons[lessonId].isDeleted;

  /**
   * Handle completion logic, XP award, and navigation.
   */
  const handleComplete = () => {
    // Prevent double submission.
    if (isCompleted || marked) return;
    
    // Memberikan sedikit XP untuk menyelesaikan materi bacaan
    addXP(10);
    completeLesson(lessonId);
    setMarked(true);

    // Delay navigation to show success state.
    setTimeout(() => {
      if (nextLessonSlug && categoryId) {
        router.push(`/courses/${categoryId}/${nextLessonSlug}`);
      } else if (categoryId) {
        router.push(`/courses/${categoryId}`);
      }
    }, 800);
  };

  if (isCompleted || marked) {
    return (
      <div className="flex items-center justify-center gap-3 py-6 px-8 rounded-lg bg-success/10 border border-success/30 text-success glass transition-all duration-500">
        <CheckCircle2 size={24} />
        <span className="font-bold tracking-widest uppercase text-sm">Materi Selesai</span>
      </div>
    );
  }

  return (
    <Button 
      onClick={handleComplete}
      className={cn(
        "w-full sm:w-auto flex items-center justify-center gap-3 py-8 px-10 rounded-lg",
        "bg-primary text-primary-foreground font-black uppercase tracking-widest text-sm",
        "shadow-[0_0_20px_rgb(var(--primary-rgb)/0.3)] hover:shadow-[0_0_30px_rgb(var(--primary-rgb)/0.5)]",
        "hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 border-none"
      )}
    >
      <CheckCircle2 size={20} />
      Tandai Selesai & Lanjut
    </Button>
  );
};