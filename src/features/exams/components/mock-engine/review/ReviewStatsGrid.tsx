"use client";

/**
 * @file ReviewStatsGrid.tsx
 * @description Grid kartu statistik hasil ujian: akurasi, benar, salah, kosong.
 */

import { Alert, Check, Target, X } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import type { ExamReviewAnalysis } from "@/lib/learning/exam-review-analysis";
import { getAccuracyTone } from "./review-utils";

interface ReviewStatsGridProps {
  /** Complete exam review analysis. */
  analysis: ExamReviewAnalysis;
}

/**
 * Grid empat kartu statistik ringkas hasil ujian.
 */
export function ReviewStatsGrid({ analysis }: ReviewStatsGridProps) {
  const stats = [
    {
      label: "Akurasi",
      value: `${analysis.accuracy}%`,
      detail: `${analysis.correctCount}/${analysis.totalQuestions} benar`,
      icon: Target,
      className: getAccuracyTone(analysis.accuracy),
    },
    {
      label: "Benar",
      value: analysis.correctCount,
      detail: "jawaban tepat",
      icon: Check,
      className: "text-success border-success/25 bg-success/10",
    },
    {
      label: "Salah",
      value: analysis.wrongCount,
      detail: "perlu ditinjau",
      icon: X,
      className: "text-destructive border-destructive/25 bg-destructive/10",
    },
    {
      label: "Kosong",
      value: analysis.unansweredCount,
      detail: "belum dijawab",
      icon: Alert,
      className: "text-warning border-warning/25 bg-warning/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {stats.map((stat) => {
        const StatIcon = stat.icon;

        return (
          <div
            key={stat.label}
            className={cn(
              "rounded-lg border p-4 flex flex-col gap-3 bg-muted/20",
              stat.className
            )}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                {stat.label}
              </span>
              <StatIcon size={18} aria-hidden="true" />
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-mono text-3xl font-black leading-none">
                {stat.value}
              </span>
              <span className="text-[11px] font-bold text-muted-foreground">
                {stat.detail}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
