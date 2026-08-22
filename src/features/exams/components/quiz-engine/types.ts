/**
 * @file types.ts
 * @description Definisi tipe data (interfaces) untuk kuis (Quiz Engine) NihongoRoute.
 */

// ANTARMUKA / TIPE DATA

/**
 * Represents single quiz question.
 */
export interface QuizQuestion {
 /** Question text. */
 question: string;
 /** List of answer choices. */
 options: string[];
 /** Correct answer string. Must match one option. */
 answer: string;
 /** Optional explanation for correct answer. */
 explanation?: string;
}

/**
 * Props for Quiz component.
 */
export interface QuizProps {
 /** Array of quiz questions. */
 questions: QuizQuestion[];
 /** Optional ID of associated lesson. */
 lessonId?: string;
}