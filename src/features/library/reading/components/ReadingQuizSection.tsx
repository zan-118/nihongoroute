"use client";

/**
 * @file ReadingQuizSection.tsx
 * @description Section kuis pemahaman inline untuk halaman membaca — tampil setelah artikel.
 */

import QuizEngine from "@/features/exams/components/quiz-engine/QuizEngine";
import { FormattedQuizItem } from "@/lib/utils/lesson-utils";

interface ReadingQuizSectionProps {
  /** Daftar soal kuis yang sudah diformat. */
  quizzes: FormattedQuizItem[];
  /** ID lesson untuk kuis. */
  lessonId: string;
}

/**
 * Kuis Membaca Inline — tampil setelah artikel, tanpa overlay.
 */
export function ReadingQuizSection({ quizzes, lessonId }: ReadingQuizSectionProps) {
  return (
    <div className="mt-16">
      <div className="flex items-center gap-4 mb-10">
        <div className="flex-1 h-px bg-border " />
        <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground/50 shrink-0">
          Kuis Pemahaman
        </span>
        <div className="flex-1 h-px bg-border " />
      </div>
      <div className="rounded-[2.5rem] border border-border/60 bg-card/30 p-6 shadow-2xl">
        <QuizEngine questions={quizzes} lessonId={lessonId} />
      </div>
    </div>
  );
}
