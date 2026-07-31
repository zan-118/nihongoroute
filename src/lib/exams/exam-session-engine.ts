import { ExamSessionAggregate } from "./mock-exam-engine";
import type { ExamQuestion } from "@/features/exams/components/mock-engine/types";

/**
 * @file exam-session-engine.ts
 * @description Consolidated Exam Session Seam yang menyatukan state machine,
 * perhitungan skor, dan penanganan navigasi untuk Quiz maupun JLPT Mock Exam.
 */

export interface QuizQuestionItem {
  id: string;
  question: string;
  options: string[];
  answer: string;
  explanation?: string;
}

export interface ExamSessionConfig {
  questions: ExamQuestion[];
  initialAnswers?: Record<string, number>;
  initialIndex?: number;
  timeLimitMinutes?: number;
  choukaiAudioUrl?: string;
  passingScore?: number;
}

export class ConsolidatedExamSessionEngine {
  private aggregate: ExamSessionAggregate;
  private isCompletedState: boolean = false;

  constructor(config: ExamSessionConfig) {
    this.aggregate = new ExamSessionAggregate({
      questions: config.questions,
      currentIndex: config.initialIndex ?? 0,
      answers: config.initialAnswers ?? {},
      choukaiAudioUrl: config.choukaiAudioUrl,
      passingScore: config.passingScore ?? 90,
    });
  }

  public getAggregate(): ExamSessionAggregate {
    return this.aggregate;
  }

  public getCurrentQuestion(): ExamQuestion | undefined {
    return this.aggregate.getActiveQuestion();
  }

  public getCurrentIndex(): number {
    return this.aggregate.getCurrentIndex();
  }

  public getTotalQuestions(): number {
    return this.aggregate.getQuestions().length;
  }

  public selectAnswer(optionIndex: number): boolean {
    const activeQ = this.aggregate.getActiveQuestion();
    if (!activeQ) return false;
    const key = activeQ._key;
    return this.aggregate.setAnswer(key, optionIndex);
  }

  public isAnsweredCurrent(): boolean {
    const activeQ = this.aggregate.getActiveQuestion();
    if (!activeQ) return false;
    const answers = this.aggregate.getAnswers();
    return answers[activeQ._key] !== undefined;
  }

  public getSelectedOptionCurrent(): number | undefined {
    const activeQ = this.aggregate.getActiveQuestion();
    if (!activeQ) return undefined;
    return this.aggregate.getAnswers()[activeQ._key];
  }

  public next(): boolean {
    const nextIdx = this.aggregate.getCurrentIndex() + 1;
    if (nextIdx < this.getTotalQuestions()) {
      return this.aggregate.setCurrentIndex(nextIdx);
    }
    this.isCompletedState = true;
    return false;
  }

  public previous(): boolean {
    if (this.aggregate.isPreviousDisabled()) return false;
    const prevIdx = this.aggregate.getCurrentIndex() - 1;
    return this.aggregate.setCurrentIndex(prevIdx);
  }

  public isCompleted(): boolean {
    return this.isCompletedState;
  }

  public calculateScore() {
    return this.aggregate.calculateResult();
  }

  public calculateQuizXP(score: number, totalQuestions: number): { baseXP: number; bonusXP: number; totalXP: number } {
    const baseXP = score * 25;
    const bonusXP = score === totalQuestions && totalQuestions > 0 ? 50 : 0;
    return { baseXP, bonusXP, totalXP: baseXP + bonusXP };
  }
}
