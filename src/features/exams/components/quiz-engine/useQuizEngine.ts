/**
 * @file useQuizEngine.ts
 * @description Hook kustom (Custom Hook) untuk mengelola logika mesin kuis (Quiz Engine).
 * Menangani indeks pertanyaan berjalan, opsi terpilih, skor, efek suara kelulusan, 
 * serta sinkronisasi penambahan XP dan status kelulusan pelajaran ke Zustand Store (`useUserStore` & `useSRSStore`).
 */

// ======================
// IMPOR
// ======================
import { useState, useCallback, useMemo } from "react";
import { useUserStore } from "@/store/useUserStore";
import { useSRSStore } from "@/store/useSRSStore";
import { sounds } from "@/lib/audio";
import { QuizQuestion } from "./types";
import { ConsolidatedExamSessionEngine } from "@/lib/exams/exam-session-engine";
import type { ExamQuestion } from "@/features/exams/components/mock-engine/types";

// ======================
// HOOK UTAMA
// ======================
/**
 * Manage quiz state, scoring, and XP updates via ConsolidatedExamSessionEngine seam.
 * @param questions Quiz questions.
 * @param lessonId Lesson ID.
 */
export function useQuizEngine(questions: QuizQuestion[], lessonId?: string) {
  // Map QuizQuestion list to ExamQuestion domain format for the engine seam
  const examQuestions = useMemo<ExamQuestion[]>(() => {
    return (questions || []).map((q, idx) => ({
      _key: `quiz-q-${idx}`,
      title: q.question,
      options: q.options,
      correctAnswer: Math.max(0, q.options.indexOf(q.answer)),
      section: "vocabulary",
      explanation: q.explanation,
    }));
  }, [questions]);

  // Instantiate the deep engine seam
  const engine = useMemo(
    () => new ConsolidatedExamSessionEngine({ questions: examQuestions }),
    [examQuestions]
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [showXP, setShowXP] = useState(false);
  const [xpGained, setXpGained] = useState(0);

  const updateProgress = useSRSStore((state) => state.updateProgress);
  const completeLesson = useUserStore((state) => state.completeLesson);

  const handleFinish = useCallback((finalScore: number) => {
    setIsFinished(true);
    const { totalXP } = engine.calculateQuizXP(finalScore, questions.length);

    if (totalXP > 0) {
      setXpGained(totalXP);
      setShowXP(true);
      const currentXp = useUserStore.getState().xp;
      updateProgress(currentXp + totalXP, {});
      
      if (lessonId && questions.length > 0 && finalScore / questions.length >= 0.7) {
        completeLesson(lessonId);
      }

      setTimeout(() => setShowXP(false), 2000);
    }
  }, [engine, questions.length, updateProgress, completeLesson, lessonId]);

  const nextQuestion = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      handleFinish(score);
    }
  }, [currentIndex, questions.length, score, handleFinish]);

  const handleSelect = useCallback((option: string) => {
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

  const resetQuiz = useCallback(() => {
    setCurrentIndex(0);
    setScore(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setIsFinished(false);
    setShowXP(false);
  }, []);

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