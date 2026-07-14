/**
 * @file lesson-utils.ts
 * @description Modul utilitas pembantu normalisasi data kuis pelajaran dari berbagai schema (Sanity / Supabase) ke bentuk format seragam luring-ready, serta kalkulasi navigasi urutan belajar.
 */

/**
 * Raw quiz item structure from Sanity or Supabase.
 */
export interface RawQuizItem {
  options?: unknown[] | { text?: string; isCorrect?: boolean }[];
  choices?: { text?: string; isCorrect?: boolean }[];
  correct_answer?: number | string;
  correctAnswer?: number | string;
  question?: string;
  text?: string;
  questionText?: string;
  explanation?: string;
  [key: string]: unknown;
}

/**
 * Normalized quiz item structure for client consumption.
 */
export interface FormattedQuizItem {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

// ==========================================
// FUNGSI LOGIKA NORMALISASI KUIS
// ==========================================
/**
 * Normalizes raw quiz data from multiple schemas into a unified format.
 * 
 * @param quizzesRaw - Array of raw quiz items.
 * @returns Array of normalized quiz items.
 */
export function formatQuizzes(quizzesRaw: RawQuizItem[]): FormattedQuizItem[] {
  // Return empty array if input is null or undefined
  if (!quizzesRaw) return [];
  
  return quizzesRaw
    .map((quiz: RawQuizItem) => {
      if (!quiz) return null;
      
      // Check if options are simple strings (Supabase format)
      const isNewFormat = Array.isArray(quiz.options) && (quiz.options.length === 0 || typeof quiz.options[0] === "string");
      
      let options: string[] = [];
      let answer = "";

      if (isNewFormat) {
        // Handle Supabase format with string array options
        options = (quiz.options || []) as string[];
        // Resolve correct answer index or string value
        if (typeof quiz.correct_answer === 'number') {
          answer = options[quiz.correct_answer] || "";
        } else if (typeof quiz.correctAnswer === 'number') {
          answer = options[quiz.correctAnswer] || "";
        } else if (typeof quiz.correct_answer === 'string') {
          answer = quiz.correct_answer;
        } else if (typeof quiz.correctAnswer === 'string') {
          answer = quiz.correctAnswer;
        } else {
          answer = options[0] || "";
        }
      } else {
        // Handle Sanity format with object array options
        const rawOptions = (quiz.options || quiz.choices || []) as { text?: string; isCorrect?: boolean }[];
        options = rawOptions.map((opt) => (typeof opt === 'string' ? opt : (opt?.text || ""))) || [];
        const correctOption = rawOptions.find((opt) => opt?.isCorrect);
        answer = correctOption ? (correctOption.text || "") : (options[0] || "");
      }

      // Map to unified structure
      return {
        question: quiz.question || quiz.text || quiz.questionText || "",
        options: options,
        answer: answer,
        explanation: quiz.explanation || "",
      };
    })
    // Filter out invalid or empty questions
    .filter((q): q is FormattedQuizItem => q !== null && Boolean(q.question));
}

/**
 * Lesson item representation for navigation calculations.
 */
export interface NavLessonItem {
  slug: string;
  title: string;
  [key: string]: unknown;
}

/**
 * Calculates previous and next lesson navigation links based on current slug.
 * 
 * @param nav - Array of lesson items.
 * @param slug - Current lesson slug.
 * @returns Object containing previous and next lesson items.
 */
export function getLessonNavigation(nav: NavLessonItem[], slug: string) {
  // Find index of current lesson
  const currentIndex = nav.findIndex((l: NavLessonItem) => l.slug === slug);
  // Get previous lesson if not first
  const prevLesson = currentIndex > 0 ? nav[currentIndex - 1] : null;
  // Get next lesson if not last
  const nextLesson =
    currentIndex >= 0 && currentIndex < nav.length - 1
      ? nav[currentIndex + 1]
      : null;
      
  return { prevLesson, nextLesson };
}