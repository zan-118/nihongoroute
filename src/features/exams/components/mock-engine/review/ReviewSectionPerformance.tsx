"use client";

/**
 * @file ReviewSectionPerformance.tsx
 * @description Daftar performa per section ujian dengan progress bar akurasi.
 */

import { Brain } from "@/components/ui/icons";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { ExamReviewSectionInsight } from "@/lib/learning/exam-review-analysis";
import { SECTION_LABELS } from "../constants";

interface ReviewSectionPerformanceProps {
  /** Performance metrics grouped by exam section. */
  sections: ExamReviewSectionInsight[];
}

/**
 * Panel performa per section: akurasi, benar/salah/kosong, dan progress bar.
 */
export function ReviewSectionPerformance({ sections }: ReviewSectionPerformanceProps) {
  return (
    <div className="rounded-lg border border-border bg-muted/20 p-5">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Brain size={18} aria-hidden="true" className="text-primary" />
          <span className="text-xs font-black uppercase tracking-widest text-foreground">
            Performa Section
          </span>
        </div>
        <Badge variant="outline" className="rounded-xl px-3 py-1">
          {sections.length} section
        </Badge>
      </div>

      <div className="flex flex-col gap-5">
        {sections.map((section) => (
          <div key={section.section} className="flex flex-col gap-2">
            <div className="flex items-end justify-between gap-4">
              <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                {SECTION_LABELS[section.section]}
              </span>
              <span className="font-mono text-xs font-black text-foreground">
                {section.correct}/{section.total} ({section.accuracy}%)
              </span>
            </div>
            <Progress value={section.accuracy} className="h-2.5" />
            <p className="text-[11px] font-bold text-muted-foreground">
              Salah {section.wrong} - kosong {section.unanswered}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
