/**
 * @file trainer-utils.ts
 * @description Kumpulan fungsi utilitas generik untuk modul kuis dan trainer (penilaian, evaluasi sesi).
 */

export interface AnswerEvaluation {
  isCorrect: boolean;
  score: number;
  feedback?: string;
}

/**
 * Mengevaluasi jawaban kuis berbasis teks (mengabaikan kapitalisasi dan whitespace ekstra).
 */
export function evaluateTextAnswer(userAnswer: string, correctAnswer: string): AnswerEvaluation {
  const normalizedUser = userAnswer.trim().toLowerCase();
  const normalizedCorrect = correctAnswer.trim().toLowerCase();
  
  const isCorrect = normalizedUser === normalizedCorrect;
  return {
    isCorrect,
    score: isCorrect ? 10 : 0
  };
}

/**
 * Mengevaluasi jawaban kuis pilihan ganda.
 */
export function evaluateMultipleChoice(selectedOptionId: string, correctOptionId: string): AnswerEvaluation {
  const isCorrect = selectedOptionId === correctOptionId;
  return {
    isCorrect,
    score: isCorrect ? 10 : 0
  };
}

/**
 * Menghitung total skor dan akurasi dari daftar evaluasi.
 */
export function calculateSessionMetrics(evaluations: AnswerEvaluation[]) {
  const totalQuestions = evaluations.length;
  const correctCount = evaluations.filter(e => e.isCorrect).length;
  const totalScore = evaluations.reduce((sum, e) => sum + e.score, 0);
  const accuracy = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;

  return {
    totalQuestions,
    correctCount,
    totalScore,
    accuracy
  };
}
