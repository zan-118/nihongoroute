import { calculateJlptExamSubmission } from "./jlpt-session";
import type { SupabaseExamPackage } from "./supabase-adapter";
import type { ExamQuestion } from "@/features/exams/components/mock-engine/types";

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

export interface ExamSessionAggregateOptions {
  questions: ExamQuestion[];
  currentIndex?: number;
  answers?: Record<string, number>;
  flagged?: Record<string, boolean>;
  choukaiAudioUrl?: string;
  passingScore?: number;
}

/**
 * Aggregate root murni untuk mengelola state dan aturan bisnis sesi ujian JLPT.
 * Bebas dari efek samping React DOM/hooks.
 */
export class ExamSessionAggregate {
  private questions: ExamQuestion[];
  private currentIndex: number;
  private answers: Record<string, number>;
  private flagged: Record<string, boolean>;
  private choukaiAudioUrl?: string;
  private passingScore: number;
  private isDirtyState: boolean = false;

  constructor(options: ExamSessionAggregateOptions) {
    this.questions = options.questions;
    this.currentIndex = options.currentIndex ?? 0;
    this.answers = { ...(options.answers ?? {}) };
    this.flagged = { ...(options.flagged ?? {}) };
    this.choukaiAudioUrl = options.choukaiAudioUrl;
    this.passingScore = options.passingScore ?? 90;
  }

  public getQuestions(): ExamQuestion[] {
    return this.questions;
  }

  public getCurrentIndex(): number {
    return this.currentIndex;
  }

  public getActiveQuestion(): ExamQuestion | undefined {
    return this.questions[this.currentIndex];
  }

  public getAnswers(): Record<string, number> {
    return { ...this.answers };
  }

  public getFlagged(): Record<string, boolean> {
    return { ...this.flagged };
  }

  public isDirty(): boolean {
    return this.isDirtyState;
  }

  public clearDirtyFlag(): void {
    this.isDirtyState = false;
  }

  public setAnswer(questionKey: string, optionIndex: number): boolean {
    if (this.answers[questionKey] === optionIndex) {
      return false;
    }
    this.answers[questionKey] = optionIndex;
    this.isDirtyState = true;
    return true;
  }

  public toggleFlag(questionKey: string): boolean {
    const nextVal = !this.flagged[questionKey];
    this.flagged[questionKey] = nextVal;
    return nextVal;
  }

  public setCurrentIndex(index: number): boolean {
    if (index < 0 || index >= this.questions.length) return false;
    this.currentIndex = index;
    return true;
  }

  public getSections(): Record<string, number[]> {
    return buildQuestionSections(this.questions);
  }

  public isPreviousDisabled(): boolean {
    return shouldDisablePreviousButton(
      this.currentIndex,
      this.questions,
      Boolean(this.choukaiAudioUrl)
    );
  }

  public calculateResult() {
    return performScoreCalculation(this.questions, this.answers, this.passingScore);
  }
}

