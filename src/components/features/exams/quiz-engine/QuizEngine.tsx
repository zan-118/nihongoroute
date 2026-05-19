"use client";

import { useState, useEffect } from "react";
import { QuizProps } from "./types";
import { useQuizEngine } from "./useQuizEngine";
import { QuizFinished } from "./QuizFinished";
import { QuizPlaying } from "./QuizPlaying";

export default function QuizEngine({ questions, lessonId }: QuizProps) {
  const [isClient, setIsClient] = useState(false);
  const engine = useQuizEngine(questions, lessonId);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsClient(true));
    return () => cancelAnimationFrame(frame);
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
      nextQuestion={engine.nextQuestion}
    />
  );
}
