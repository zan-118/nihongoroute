"use client";

/**
 * @file ReviewRecommendations.tsx
 * @description Daftar rekomendasi latihan berdasarkan analisis hasil ujian.
 */

import Link from "next/link";
import { ArrowRight, Target } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import type { ExamReviewAction } from "@/lib/learning/exam-review-analysis";
import { ACTION_ICONS } from "./review-utils";

interface ReviewRecommendationsProps {
  /** Recommended remediation actions. */
  actions: ExamReviewAction[];
}

/**
 * Panel rekomendasi latihan (maksimal 3 aksi).
 */
export function ReviewRecommendations({ actions }: ReviewRecommendationsProps) {
  return (
    <div className="rounded-lg border border-border bg-muted/20 p-5">
      <div className="mb-5 flex items-center gap-2">
        <Target size={18} aria-hidden="true" className="text-primary" />
        <span className="text-xs font-black uppercase tracking-widest text-foreground">
          Rekomendasi Latihan
        </span>
      </div>

      <div className="flex flex-col gap-4">
        {actions.map((action) => {
          const ActionIcon = ACTION_ICONS[action.id];

          return (
            <div
              key={action.id}
              className="rounded-lg border border-border bg-background/55 p-4 flex flex-col gap-4"
            >
              <div className="flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                  <ActionIcon size={18} aria-hidden="true" />
                </div>
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="text-sm font-black text-foreground">
                    {action.label}
                  </span>
                  <span className="text-xs font-medium leading-relaxed text-muted-foreground">
                    {action.reason}
                  </span>
                </div>
              </div>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="w-full justify-between rounded-xl"
              >
                <Link href={action.href}>
                  Buka Latihan
                  <ArrowRight data-icon="inline-end" />
                </Link>
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
