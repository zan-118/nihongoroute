/**
 * @file types.ts
 * @description Definisi tipe data (interfaces) untuk kuis (Quiz Engine) NihongoRoute.
 */

// ======================
// ANTARMUKA / TIPE DATA
// ======================
export interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
  explanation?: string;
}

export interface QuizProps {
  questions: QuizQuestion[];
  lessonId?: string;
}
