/**
 * @file MarkCompleteButton.tsx
 * @description Button component marking lesson completion, updating local user progress store, dispatching XP rewards, and navigating to the next lesson.
 * @module features/courses/lessons
 */

"use client";

// ==========================================
// Import & Dependencies
// ==========================================
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "@/components/ui/icons";
import { useUserStore } from "@/store/useUserStore";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ==========================================
// Component Props Interface
// ==========================================
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
 <div className="flex items-center justify-center gap-3 py-6 px-8 rounded-lg bg-success/10 border border-success/20 text-success transition-all duration-500 shadow-sm">
 <Check size={24} />
 <span className="font-bold tracking-widest uppercase text-sm">Materi Selesai</span>
 </div>
 );
 }

 return (
 <Button 
 onClick={handleComplete}
 className={cn(
 "w-full sm:w-auto flex items-center justify-center gap-3 py-8 px-10 rounded-lg rounded-br-none",
 "bg-primary text-primary-foreground font-black uppercase tracking-widest text-sm",
 "shadow-md",
 "hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 border-none"
 )}
 >
 <Check size={20} />
 Tandai Selesai & Lanjut
 </Button>
 );
};