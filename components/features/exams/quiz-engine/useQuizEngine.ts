import { useState, useCallback } from "react";
import { useUserStore } from "@/store/useUserStore";
import { useSRSStore } from "@/store/useSRSStore";
import { sounds } from "@/lib/audio";
import { QuizQuestion } from "./types";

export function useQuizEngine(questions: QuizQuestion[]) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [showXP, setShowXP] = useState(false);
  const [xpGained, setXpGained] = useState(0);

  const { updateProgress, srs } = useSRSStore();
  const { xp } = useUserStore();

  const handleFinish = useCallback((finalScore: number) => {
    setIsFinished(true);
    const baseXP = finalScore * 25;
    const bonusXP = finalScore === questions.length ? 50 : 0;
    const totalXP = baseXP + bonusXP;

    if (totalXP > 0) {
      setXpGained(totalXP);
      setShowXP(true);
      updateProgress(xp + totalXP, srs);
      setTimeout(() => setShowXP(false), 2000);
    }
  }, [questions.length, xp, srs, updateProgress]);

  const nextQuestion = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
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
