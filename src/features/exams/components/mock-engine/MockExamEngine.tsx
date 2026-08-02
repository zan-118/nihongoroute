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
import { ExamSessionProvider } from "./ExamSessionContext";
import { ExamIntro } from "./ExamIntro";
import { ExamResult } from "./ExamResult";
import { ExamReview } from "./ExamReview";
import { ExamPlaying } from "./ExamPlaying";

// ======================
// ANTARMUKA & TIPE
// ======================
interface MockExamEngineProps {
 /** Exam data payload containing questions and metadata. */
 exam: ExamData;
}

// ======================
// EKSEKUSI UTAMA
// ======================
export default function MockExamEngine({ exam }: MockExamEngineProps) {
 // Generate unique key to reset state on exam switch.
 const engineKey = exam.sessionId || exam.templateId || exam.slug || exam.id;

 return (
 <ExamSessionProvider key={engineKey} exam={exam}>
 <MockExamEngineSession />
 </ExamSessionProvider>
 );
}

/**
 * Handles exam state machine within ExamSessionProvider.
 */
function MockExamEngineSession() {
 const engine = useMockExamEngineContext();
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

 return <ExamPlaying />;
}

import { useExamSession as useMockExamEngineContext } from "./ExamSessionContext";