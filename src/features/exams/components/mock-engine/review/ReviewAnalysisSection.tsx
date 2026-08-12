"use client";

/**
 * @file ReviewAnalysisSection.tsx
 * @description Section "Analisis Kesalahan": deskripsi, section terlemah,
 * statistik ringkas, performa per section, dan rekomendasi latihan.
 */

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { ExamReviewAnalysis } from "@/lib/learning/exam-review-analysis";
import { ReviewWeakestSection } from "./ReviewWeakestSection";
import { ReviewStatsGrid } from "./ReviewStatsGrid";
import { ReviewSectionPerformance } from "./ReviewSectionPerformance";
import { ReviewRecommendations } from "./ReviewRecommendations";

interface ReviewAnalysisSectionProps {
  /** Complete exam review analysis. */
  analysis: ExamReviewAnalysis;
}

/**
 * Merangkai panel analisis kesalahan menjadi satu Card besar.
 */
export function ReviewAnalysisSection({ analysis }: ReviewAnalysisSectionProps) {
  return (
    <section className="mb-10">
      <Card className="p-6 md:p-8 border border-border bg-card rounded-2xl md:rounded-3xl shadow-xl">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl flex flex-col gap-3">
              <Badge className="w-fit rounded-xl px-3 py-1">
                Mistake Review
              </Badge>
              <div className="flex flex-col gap-2">
                <h3 className="text-2xl md:text-3xl uppercase leading-tight text-foreground">
                  Analisis Kesalahan
                </h3>
                <p className="text-sm font-medium leading-relaxed text-muted-foreground">
                  {analysis.mistakes.length > 0
                    ? `${analysis.mistakes.length} soal perlu ditinjau ulang dari ${analysis.totalQuestions} soal.`
                    : "Semua soal terjawab benar. Review tetap tersedia untuk penguatan materi."}
                </p>
              </div>
            </div>

            <ReviewWeakestSection analysis={analysis} />
          </div>

          <ReviewStatsGrid analysis={analysis} />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_0.9fr]">
            <ReviewSectionPerformance sections={analysis.sections} />
            <ReviewRecommendations actions={analysis.actions} />
          </div>
        </div>
      </Card>
    </section>
  );
}
