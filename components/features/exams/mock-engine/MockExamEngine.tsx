"use client";

import { ExamData } from "./types";
import { useMockExamEngine } from "./useMockExamEngine";
import { ExamIntro } from "./ExamIntro";
import { ExamResult } from "./ExamResult";
import { ExamReview } from "./ExamReview";
import { ExamPlaying } from "./ExamPlaying";

interface MockExamEngineProps {
  exam: ExamData;
}

export default function MockExamEngine({ exam }: MockExamEngineProps) {
  const engine = useMockExamEngine(exam);

  const backLink = exam.categorySlug ? `/courses/${exam.categorySlug}` : "/courses";

  if (engine.gameState === "intro") {
    return (
      <ExamIntro
        exam={exam}
        setGameState={engine.setGameState}
        backLink={backLink}
      />
    );
  }

  if (engine.gameState === "result") {
    return (
      <ExamResult
        exam={exam}
        setGameState={engine.setGameState}
        backLink={backLink}
        calculateScore={engine.calculateScore}
        handleShareResult={engine.handleShareResult}
      />
    );
  }

  if (engine.gameState === "review") {
    return (
      <ExamReview
        exam={exam}
        answers={engine.answers}
        setGameState={engine.setGameState}
      />
    );
  }

  return (
    <ExamPlaying
      exam={exam}
      activeQuestion={engine.activeQuestion}
      currentQuestionIndex={engine.currentQuestionIndex}
      timeLeft={engine.timeLeft}
      answers={engine.answers}
      audioStatus={engine.audioStatus}
      cheatWarnings={engine.cheatWarnings}
      audioRef={engine.audioRef}
      isTimeCritical={engine.isTimeCritical}
      isCurrentlyListening={engine.isCurrentlyListening}
      disablePreviousButton={engine.disablePreviousButton}
      handlePlayAudio={engine.handlePlayAudio}
      finishExam={engine.finishExam}
      handleAnswer={engine.handleAnswer}
      nextQuestion={engine.nextQuestion}
      prevQuestion={engine.prevQuestion}
    />
  );
}
