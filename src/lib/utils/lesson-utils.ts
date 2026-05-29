/**
 * @file lesson-utils.ts
 * @description Modul utilitas pembantu normalisasi data kuis pelajaran dari berbagai schema (Sanity / Supabase) ke bentuk format seragam luring-ready, serta kalkulasi navigasi urutan belajar.
 */

// ==========================================
// DEKLARASI ANTARMUKA KUIS
// ==========================================
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
 * Menormalisasi data kuis dari berbagai format (Sanity/Supabase) ke dalam satu format yang seragam.
 * 
 * @param {RawQuizItem[]} quizzesRaw - Array mentah item kuis dari CMS atau DB
 * @returns {FormattedQuizItem[]} Array terformat kuis normalisasi
 */
export function formatQuizzes(quizzesRaw: RawQuizItem[]): FormattedQuizItem[] {
  if (!quizzesRaw) return [];
  
  return quizzesRaw
    .map((quiz: RawQuizItem) => {
      if (!quiz) return null;
      
      // Tangani format baru (Supabase): options berupa string[], correct_answer berupa index
      // Tangani format lama (Sanity): options berupa { text, isCorrect }[]
      const isNewFormat = Array.isArray(quiz.options) && (quiz.options.length === 0 || typeof quiz.options[0] === "string");
      
      let options: string[] = [];
      let answer = "";

      if (isNewFormat) {
        options = (quiz.options || []) as string[];
        // Tangani correct_answer sebagai index (number) ATAU teks jawaban langsung (string)
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
        const rawOptions = (quiz.options || quiz.choices || []) as { text?: string; isCorrect?: boolean }[];
        options = rawOptions.map((opt) => (typeof opt === 'string' ? opt : (opt?.text || ""))) || [];
        const correctOption = rawOptions.find((opt) => opt?.isCorrect);
        answer = correctOption ? (correctOption.text || "") : (options[0] || "");
      }

      return {
        question: quiz.question || quiz.text || quiz.questionText || "",
        options: options,
        answer: answer,
        explanation: quiz.explanation || "",
      };
    })
    .filter((q): q is FormattedQuizItem => q !== null && Boolean(q.question));
}

/**
 * Menghitung navigasi (sebelumnya/berikutnya) untuk sebuah pelajaran di dalam kategori tertentu.
 */
export interface NavLessonItem {
  slug: string;
  title: string;
  [key: string]: unknown;
}

export function getLessonNavigation(nav: NavLessonItem[], slug: string) {
  const currentIndex = nav.findIndex((l: NavLessonItem) => l.slug === slug);
  const prevLesson = currentIndex > 0 ? nav[currentIndex - 1] : null;
  const nextLesson =
    currentIndex >= 0 && currentIndex < nav.length - 1
      ? nav[currentIndex + 1]
      : null;
      
  return { prevLesson, nextLesson };
}
