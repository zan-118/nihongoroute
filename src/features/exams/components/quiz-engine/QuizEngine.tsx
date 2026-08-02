"use client";

/**
 * @file QuizEngine.tsx
 * @description Komponen pengendali utama (Controller) untuk pengerjaan kuis interaktif (Quiz Engine).
 * Mengatur pergeseran status antara pengerjaan soal kuis (QuizPlaying) dan ringkasan skor kelulusan (QuizFinished).
 */

// ======================
// IMPOR
// ======================
import { useState, useEffect } from "react";
import { QuizProps } from "./types";
import { useQuizEngine } from "./useQuizEngine";
import { QuizFinished } from "./QuizFinished";
import { QuizPlaying } from "./QuizPlaying";

// ======================
// EKSEKUSI UTAMA
// ======================
/**
 * QuizEngine component.
 * Manage quiz state. Switch between play and finish screens.
 * 
 * @param props - Component props.
 * @param props.questions - Quiz questions list.
 * @param props.lessonId - Current lesson ID.
 */
export default function QuizEngine({ questions, lessonId }: QuizProps) {
 const [isClient, setIsClient] = useState(false);
 const engine = useQuizEngine(questions, lessonId);

 useEffect(() => {
 // Prevent hydration mismatch. Wait for client render.
 const frame = requestAnimationFrame(() => setIsClient(true));
 return () => cancelAnimationFrame(frame);
 }, []);

 // Skip render if server-side or empty questions.
 if (!isClient || !questions || questions.length === 0) return null;

 // Show summary when quiz ends.
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

 // Show active question interface.
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