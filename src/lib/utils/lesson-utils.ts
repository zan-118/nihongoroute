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

/**
 * Normalizes quiz data from various formats (Sanity/Supabase) to a unified format.
 */
export function formatQuizzes(quizzesRaw: RawQuizItem[]): FormattedQuizItem[] {
  if (!quizzesRaw) return [];
  
  return quizzesRaw
    .map((quiz: RawQuizItem) => {
      if (!quiz) return null;
      
      // Handle format baru (Supabase): options adalah string[], correct_answer adalah index
      // Handle format lama (Sanity): options adalah { text, isCorrect }[]
      const isNewFormat = Array.isArray(quiz.options) && (quiz.options.length === 0 || typeof quiz.options[0] === "string");
      
      let options: string[] = [];
      let answer = "";

      if (isNewFormat) {
        options = (quiz.options || []) as string[];
        // Handle correct_answer sebagai index (number) ATAU teks jawaban langsung (string)
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
 * Calculates navigation (prev/next) for a lesson within a category.
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
