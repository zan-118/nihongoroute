"use client";

/**
 * @file MockExamEngine.tsx
 * @description Komponen pembungkus utama (Controller/Orchestrator) untuk simulasi ujian (Mock Exam).
 * Mengatur alur status pengerjaan ujian dari perkenalan (Intro), pengerjaan soal (Playing), hasil analisis (Result), hingga peninjauan (Review).
 */

// ======================
// IMPOR
// ======================
import { ExamData } from "./types";
import { useMockExamEngine } from "./useMockExamEngine";
import { ExamIntro } from "./ExamIntro";
import { ExamResult } from "./ExamResult";
import { ExamReview } from "./ExamReview";
import { ExamPlaying } from "./ExamPlaying";

// ======================
// ANTARMUKA & TIPE
// ======================
interface MockExamEngineProps {
  exam: ExamData;
}

// ======================
// EKSEKUSI UTAMA
// ======================
export default function MockExamEngine({ exam }: MockExamEngineProps) {
  const engineKey = exam.sessionId || exam.templateId || exam.slug || exam.id;

  return <MockExamEngineSession key={engineKey} exam={exam} />;
}

function MockExamEngineSession({ exam }: MockExamEngineProps) {
  const engine = useMockExamEngine(exam);
  const activeExam = engine.exam;

  const backLink = activeExam.categorySlug ? `/courses/${activeExam.categorySlug}` : "/courses";

  if (engine.gameState === "intro") {
    return (
      <ExamIntro
        exam={activeExam}
        onStartExam={engine.startExam}
        isStarting={engine.isStartingSession}
        backLink={backLink}
      />
    );
  }

  if (engine.gameState === "result") {
    return (
      <ExamResult
        exam={activeExam}
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
        exam={activeExam}
        answers={engine.answers}
        setGameState={engine.setGameState}
      />
    );
  }

  return (
    <ExamPlaying
      exam={activeExam}
      activeQuestion={engine.activeQuestion}
      currentQuestionIndex={engine.currentQuestionIndex}
      timeLeft={engine.timeLeft}
      answers={engine.answers}
      audioStatus={engine.audioStatus}
      audioRef={engine.audioRef}
      isTimeCritical={engine.isTimeCritical}
      isCurrentlyListening={engine.isCurrentlyListening}
      disablePreviousButton={engine.disablePreviousButton}
      handlePlayAudio={engine.handlePlayAudio}
      handleAnswer={engine.handleAnswer}
      nextQuestion={engine.nextQuestion}
      prevQuestion={engine.prevQuestion}
      sections={engine.sections}
      availableSections={engine.availableSections}
      currentSection={engine.currentSection}
      goToQuestion={engine.goToQuestion}
      activeSectionIndex={engine.activeSectionIndex}
      pendingConfirm={engine.pendingConfirm}
      setPendingConfirm={engine.setPendingConfirm}
      confirmPendingAction={engine.confirmPendingAction}
      pendingConfirmLabel={engine.pendingConfirmLabel}
      isSubmitting={engine.isSubmittingSession}
      flaggedQuestions={engine.flaggedQuestions}
      toggleFlag={engine.toggleFlag}
    />
  );
}
