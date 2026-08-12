"use client";

/**
 * @file ReviewQuestionOptions.tsx
 * @description Grid opsi jawaban soal dengan highlight jawaban benar & pilihan user.
 */

import { Check, X } from "@/components/ui/icons";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ExamQuestion } from "../types";
import { ReviewChoiceContent } from "./ReviewChoiceContent";

interface ReviewQuestionOptionsProps {
  /** Soal ujian. */
  question: ExamQuestion;
  /** Indeks jawaban user (opsional — kosong bila tidak dijawab). */
  userAnswer?: number;
}

/**
 * Daftar opsi jawaban: benar hijau, pilihan user yang salah merah.
 */
export function ReviewQuestionOptions({ question, userAnswer }: ReviewQuestionOptionsProps) {
  return (
    <div className="grid grid-cols-1 gap-4">
      {question.options.map((opt, optIdx) => {
        const isCorrectAnswer = optIdx === question.correctAnswer;
        const isUserSelection = optIdx === userAnswer;
        const choice = question.choices?.[optIdx];

        // Style option based on correctness and user selection.
        let optionClass =
          "border-border bg-[hsl(var(--muted)/0.5)] opacity-65 dark:bg-[hsl(var(--background)/0.1)]";
        if (isCorrectAnswer) {
          optionClass =
            "border-success/30 bg-success/10 text-foreground opacity-100 shadow-sm";
        } else if (isUserSelection) {
          optionClass =
            "border-destructive/30 bg-destructive/10 text-foreground opacity-100 shadow-sm";
        }

        return (
          <div
            key={`${opt}-${optIdx}`}
            className={cn(
              "flex items-center gap-4 rounded-lg border p-5 transition-all",
              optionClass
            )}
          >
            <Badge
              variant="outline"
              className={cn(
                "flex size-8 items-center justify-center rounded-lg border-none p-0 font-mono text-xs font-black",
                isCorrectAnswer
                  ? "bg-success text-success-foreground"
                  : isUserSelection
                  ? "bg-destructive text-destructive-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {optIdx + 1}
            </Badge>
            <ReviewChoiceContent choice={choice} text={opt} />
            {isCorrectAnswer && (
              <Check
                size={24}
                aria-hidden="true"
                className="shrink-0 text-success"
              />
            )}
            {isUserSelection && !isCorrectAnswer && (
              <X
                size={24}
                aria-hidden="true"
                className="shrink-0 text-destructive"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
