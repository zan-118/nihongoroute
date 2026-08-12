"use client";

/**
 * @file ReviewWeakestSection.tsx
 * @description Panel ringkasan section terlemah dengan progress bar akurasi.
 */

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { ExamReviewAnalysis } from "@/lib/learning/exam-review-analysis";
import { SECTION_LABELS } from "../constants";
import { getAccuracyTone } from "./review-utils";

interface ReviewWeakestSectionProps {
  /** Complete exam review analysis. */
  analysis: ExamReviewAnalysis;
}

/**
 * Panel section terlemah beserta akurasi & jumlah soal yang perlu dibuka ulang.
 */
export function ReviewWeakestSection({ analysis }: ReviewWeakestSectionProps) {
  const weakestLabel = analysis.weakestSection
    ? SECTION_LABELS[analysis.weakestSection.section]
    : "Belum ada data";
  const weakestMistakes = analysis.weakestSection
    ? analysis.weakestSection.wrong + analysis.weakestSection.unanswered
    : 0;

  return (
    <div className="min-w-full rounded-lg border border-border bg-muted/20 p-5 sm:min-w-[280px] lg:min-w-[320px]">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            Section Terlemah
          </span>
          <span className="text-sm font-black text-foreground">
            {weakestLabel}
          </span>
        </div>
        <Badge
          variant="outline"
          className={cn(
            "rounded-xl px-3 py-1 font-mono",
            analysis.weakestSection
              ? getAccuracyTone(analysis.weakestSection.accuracy)
              : "text-muted-foreground"
          )}
        >
          {analysis.weakestSection
            ? `${analysis.weakestSection.accuracy}%`
            : "0%"}
        </Badge>
      </div>
      <Progress
        value={analysis.weakestSection?.accuracy ?? 0}
        className="h-3"
      />
      <p className="mt-3 text-xs font-bold text-muted-foreground">
        {analysis.weakestSection
          ? `${weakestMistakes} soal perlu dibuka ulang di section ini.`
          : "Belum ada section untuk dianalisis."}
      </p>
    </div>
  );
}
