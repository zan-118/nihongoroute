import { calculateJlptExamSubmission } from "./jlpt-session";
import type { SupabaseExamPackage } from "./supabase-adapter";
import type { ExamQuestion } from "@/components/features/exams/mock-engine/types";

/**
 * @file mock-exam-engine.ts
 * @description Modul domain murni untuk logika bisnis Simulasi Ujian JLPT.
 * Bebas dari ketergantungan React DOM/hooks sehingga 100% teruji via Vitest.
 */

/**
 * Groups exam questions by section name (e.g. vocabulary, grammar, reading, listening).
 * 
 * @param questions - Array of exam questions.
 * @returns Map of section name to question index arrays.
 */
export function buildQuestionSections(questions: ExamQuestion[]): Record<string, number[]> {
  const groups: Record<string, number[]> = {};
  questions.forEach((q, idx) => {
    const section = q.section || "vocabulary";
    if (!groups[section]) groups[section] = [];
    groups[section].push(idx);
  });
  return groups;
}

/**
 * Determines whether the "Previous" navigation button should be disabled.
 * Enforces real JLPT listening constraints (no backtracking allowed in Choukai section).
 * 
 * @param currentIndex - Currently active question index.
 * @param questions - List of all questions in the exam.
 * @param hasGlobalChoukai - Whether global Choukai audio is used.
 * @returns True if previous button must be disabled.
 */
export function shouldDisablePreviousButton(
  currentIndex: number,
  questions: ExamQuestion[],
  hasGlobalChoukai: boolean
): boolean {
  if (currentIndex <= 0) return true;
  if (hasGlobalChoukai) return false;

  const currentQ = questions[currentIndex];
  const isCurrentlyListening = currentQ?.section === "listening" || !!currentQ?.audioUrl;
  if (isCurrentlyListening) return true;

  const prevQ = questions[currentIndex - 1];
  return prevQ?.section === "listening" || !!prevQ?.audioUrl;
}

/**
 * Calculates exam score, section breakdown, and passing status using Maiten 32% rule.
 * 
 * @param questions - List of exam questions.
 * @param answers - User answer map.
 * @param passingScore - Minimum passing score threshold.
 * @returns Calculated score and section breakdown.
 */
export function performScoreCalculation(
  questions: ExamQuestion[],
  answers: Record<string, number>,
  passingScore: number
) {
  const mockPackage: SupabaseExamPackage = {
    id: "session-pkg",
    title: "Exam Session",
    timeLimitMinutes: 0,
    passingScore,
    questions: questions.map((q) => ({
      id: q._key,
      sessionType: q.section,
      choices: (q.choices || q.options.map((val) => ({ type: "text", value: val }))),
      correctChoiceIndex: q.correctAnswer,
      sourceType: q.sourceType,
      sourceId: q.sourceId,
      sourceReference: q.sourceReference,
    })),
  };

  const result = calculateJlptExamSubmission(mockPackage, answers);
  return {
    correctCount: result.correctCount,
    finalScore: result.totalScore,
    sectionBreakdown: result.sectionBreakdown,
    failedSection: result.failedSection,
    isPassed: result.isPassed,
  };
}

/**
 * Safely extracts error message from unknown error catch block.
 * 
 * @param error - Caught error object.
 * @param fallback - Fallback string if error is not Error instance.
 * @returns Formatted error string.
 */
export function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}
