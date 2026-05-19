/**
 * Normalizes quiz data from various formats (Sanity/Supabase) to a unified format.
 */
export function formatQuizzes(quizzesRaw: any[]): any[] {
  if (!quizzesRaw) return [];
  
  return quizzesRaw
    .map((quiz: any) => {
      if (!quiz) return null;
      
      // Handle format baru (Supabase): options adalah string[], correct_answer adalah index
      // Handle format lama (Sanity): options adalah { text, isCorrect }[]
      const isNewFormat = Array.isArray(quiz.options) && (quiz.options.length === 0 || typeof quiz.options[0] === "string");
      
      let options = [];
      let answer = "";

      if (isNewFormat) {
        options = quiz.options || [];
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
        const rawOptions = quiz.options || quiz.choices || [];
        options = rawOptions.map((opt: any) => (typeof opt === 'string' ? opt : (opt?.text || ""))) || [];
        const correctOption = rawOptions.find((opt: any) => opt?.isCorrect);
        answer = correctOption ? (correctOption.text || "") : (options[0] || "");
      }

      return {
        question: quiz.question || quiz.text || quiz.questionText || "",
        options: options,
        answer: answer,
        explanation: quiz.explanation || "",
      };
    })
    .filter((q: any) => q && q.question);
}

/**
 * Calculates navigation (prev/next) for a lesson within a category.
 */
export function getLessonNavigation(nav: any[], slug: string) {
  const currentIndex = nav.findIndex((l: { slug: string }) => l.slug === slug);
  const prevLesson = currentIndex > 0 ? nav[currentIndex - 1] : null;
  const nextLesson =
    currentIndex >= 0 && currentIndex < nav.length - 1
      ? nav[currentIndex + 1]
      : null;
      
  return { prevLesson, nextLesson };
}
