/**
 * @file useQuizEngine.ts
 * @description Hook kustom (Custom Hook) untuk mengelola logika mesin kuis (Quiz Engine).
 * Menangani indeks pertanyaan berjalan, opsi terpilih, skor, efek suara kelulusan, 
 * serta sinkronisasi penambahan XP dan status kelulusan pelajaran ke Zustand Store (`useUserStore` & `useSRSStore`).
 */

// ======================
// IMPOR
// ======================
import { useState, useCallback } from "react";
import { useUserStore } from "@/store/useUserStore";
import { useSRSStore } from "@/store/useSRSStore";
import { sounds } from "@/lib/audio";
import { QuizQuestion } from "./types";

// ======================
// HOOK UTAMA
// ======================
/**
 * Manage quiz state, scoring, and XP updates.
 * @param questions Quiz questions.
 * @param lessonId Lesson ID.
 */
export function useQuizEngine(questions: QuizQuestion[], lessonId?: string) {
  // Track current question index.
  const [currentIndex, setCurrentIndex] = useState(0);
  // Track selected answer option.
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  // Flag if current question answered.
  const [isAnswered, setIsAnswered] = useState(false);
  // Count correct answers.
  const [score, setScore] = useState(0);
  // Flag if quiz completed.
  const [isFinished, setIsFinished] = useState(false);
  // Control XP animation visibility.
  const [showXP, setShowXP] = useState(false);
  // Total XP earned in session.
  const [xpGained, setXpGained] = useState(0);

  const updateProgress = useSRSStore((state) => state.updateProgress);
  const completeLesson = useUserStore((state) => state.completeLesson);

  /**
   * Process quiz end. Calculate XP. Update user progress.
   * @param finalScore Correct answer count.
   */
  const handleFinish = useCallback((finalScore: number) => {
    setIsFinished(true);
    // 25 XP per correct answer.
    const baseXP = finalScore * 25;
    // 50 XP bonus for perfect score.
    const bonusXP = finalScore === questions.length ? 50 : 0;
    const totalXP = baseXP + bonusXP;

    if (totalXP > 0) {
      setXpGained(totalXP);
      setShowXP(true);
      // Get fresh XP from store to avoid stale state.
      const currentXp = useUserStore.getState().xp;
      updateProgress(currentXp + totalXP, {});
      
      // Mark lesson complete if score >= 70%.
      if (lessonId && finalScore / questions.length >= 0.7) {
        completeLesson(lessonId);
      }

      setTimeout(() => setShowXP(false), 2000);
    }
  }, [questions.length, updateProgress, completeLesson, lessonId]);

  /**
   * Go to next question. Finish quiz if last question.
   */
  const nextQuestion = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      handleFinish(score);
    }
  }, [currentIndex, questions.length, score, handleFinish]);

  /**
   * Process selected answer. Play sound. Update score.
   * @param option Selected answer.
   */
  const handleSelect = useCallback((option: string) => {
    // Prevent double answering or empty question errors.
    if (isAnswered || !questions || questions.length === 0) return;

    const currentQ = questions[currentIndex];
    if (!currentQ) return;

    setSelectedOption(option);
    setIsAnswered(true);

    const isCorrect = option === currentQ.answer;

    if (isCorrect) {
      sounds?.playSuccess();
      setScore((prev) => prev + 1);
    } else {
      sounds?.playError();
    }
  }, [isAnswered, currentIndex, questions]); 


  /**
   * Reset quiz state.
   */
  const resetQuiz = useCallback(() => {
    setCurrentIndex(0);
    setScore(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setIsFinished(false);
    setShowXP(false);
  }, []);

  // Get current active question.
  const currentQ = questions && questions.length > 0 ? questions[currentIndex] : null;

  return {
    currentIndex,
    currentQ,
    selectedOption,
    isAnswered,
    score,
    isFinished,
    showXP,
    xpGained,
    handleSelect,
    nextQuestion,
    resetQuiz,
  };
}