"use client";

import { useState, useEffect } from "react";
import { QuizProps } from "./features/exams/quiz-engine/types";
import { useQuizEngine } from "./features/exams/quiz-engine/useQuizEngine";
import { QuizFinished } from "./features/exams/quiz-engine/QuizFinished";
import { QuizPlaying } from "./features/exams/quiz-engine/QuizPlaying";

export default function QuizEngine({ questions }: QuizProps) {
  const [isClient, setIsClient] = useState(false);
  const engine = useQuizEngine(questions);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient || !questions || questions.length === 0) return null;

  if (engine.isFinished) {
    return (
      <QuizFinished
        score={engine.score}
        totalQuestions={questions.length}
        showXP={engine.showXP}
        xpGained={engine.xpGained}
        resetQuiz={engine.resetQuiz}
      />
    );
  }

  return (
    <QuizPlaying
      currentQ={questions[engine.currentIndex]}
      currentIndex={engine.currentIndex}
      totalQuestions={questions.length}
      selectedOption={engine.selectedOption}
      isAnswered={engine.isAnswered}
      handleSelect={engine.handleSelect}
    />
  );
}
