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

/**
 * Props for MockExamEngine component.
 */
interface MockExamEngineProps {
  /** Exam data payload containing questions and metadata. */
  exam: ExamData;
}

// ======================
// EKSEKUSI UTAMA
// ======================

/**
 * Main entry point for mock exam.
 * Uses unique key to force re-mount when exam session changes.
 */
export default function MockExamEngine({ exam }: MockExamEngineProps) {
  // Generate unique key to reset state on exam switch.
  const engineKey = exam.sessionId || exam.templateId || exam.slug || exam.id;

  return <MockExamEngineSession key={engineKey} exam={exam} />;
}

/**
 * Handles exam state machine.
 * Renders intro, result, review, or playing screen based on engine state.
 */
function MockExamEngineSession({ exam }: MockExamEngineProps) {
  const engine = useMockExamEngine(exam);
  const activeExam = engine.exam;

  // Fallback path if category slug missing.
  const backLink = activeExam.categorySlug ? `/courses/${activeExam.categorySlug}` : "/courses";

  // Show intro screen before start.
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

  // Show score summary and analysis.
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

  // Show user answers review.
  if (engine.gameState === "review") {
    return (
      <ExamReview
        exam={activeExam}
        answers={engine.answers}
        setGameState={engine.setGameState}
      />
    );
  }

  // Default state. Render active exam interface.
  return (
    <ExamPlaying
      exam={activeExam}
      activeQuestion={engine.activeQuestion}
      currentQuestionIndex={engine.currentQuestionIndex}
      examEndAt={engine.examEndAt}
      onExpire={engine.finishExam}
      answers={engine.answers}
      audioStatus={engine.audioStatus}
      audioRef={engine.audioRef}
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