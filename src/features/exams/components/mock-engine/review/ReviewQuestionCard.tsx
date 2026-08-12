"use client";

/**
 * @file ReviewQuestionCard.tsx
 * @description Kartu review satu soal: status, teks soal, passage, media,
 * opsi jawaban, peringatan kosong, dan penjelasan + sumber.
 */

import Image from "next/image";
import Link from "next/link";
import { m } from "framer-motion";
import { Alert, Star, VolumeUp } from "@/components/ui/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { sanitizeHtml } from "@/lib/sanitize";
import type { ExamReviewQuestionInsight } from "@/lib/learning/exam-review-analysis";
import { SECTION_LABELS } from "../constants";
import { ExamQuestionText } from "../ExamQuestionText";
import { ReviewPassageBlock } from "./ReviewPassageBlock";
import { ReviewQuestionOptions } from "./ReviewQuestionOptions";
import {
  getQuestionBorderClass,
  getQuestionStatus,
  getSourceHref,
  getSrsStatusLabel,
} from "./review-utils";

interface ReviewQuestionCardProps {
  /** Insight analisis untuk satu soal. */
  insight: ExamReviewQuestionInsight;
  /** Theme aktif (untuk invert audio di mode gelap). */
  resolvedTheme?: string;
}

/**
 * Kartu review satu soal lengkap dengan penjelasan dan sumber.
 */
export function ReviewQuestionCard({ insight, resolvedTheme }: ReviewQuestionCardProps) {
  const q = insight.question;
  const status = getQuestionStatus(insight);
  const sourceHref = getSourceHref(q.sourceType, q.sourceId);
  const srsStatusLabel = getSrsStatusLabel(insight);
  const StatusIcon = status.icon;

  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.25 }}
      className="w-full"
    >
      <Card
        className={cn(
          "p-6 md:p-10 rounded-2xl md:rounded-3xl border bg-card shadow-2xl transition-colors",
          getQuestionBorderClass(insight)
        )}
      >
        <div className="mb-8 flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-start sm:justify-between">
          <Badge
            variant="outline"
            className="w-fit rounded-xl border border-border bg-[hsl(var(--muted)/0.5)] px-4 py-2 text-xs font-bold uppercase tracking-widest text-muted-foreground dark:bg-[hsl(var(--background)/0.2)]"
          >
            SOAL {insight.index + 1} - {SECTION_LABELS[q.section]}
          </Badge>
          <Badge
            className={cn(
              "w-fit rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-widest",
              status.className
            )}
          >
            <StatusIcon size={14} aria-hidden="true" className="mr-2" />
            {status.label}
          </Badge>
        </div>

        {q.questionText && (
          <ExamQuestionText
            questionText={q.questionText}
            className="mb-8 rounded-lg border border-border bg-[hsl(var(--muted)/0.3)] p-5 text-lg font-medium leading-relaxed text-foreground dark:bg-[hsl(var(--background)/0.1)] md:text-2xl font-japanese prose-custom"
          />
        )}

        <ReviewPassageBlock passage={q.passage} />

        {q.imageUrl && (
          <div className="mb-8 overflow-hidden rounded-xl border border-border bg-[hsl(var(--muted)/0.2)] p-3 dark:bg-[hsl(var(--background)/0.2)]">
            <Image
              src={q.imageUrl}
              alt="Gambar pendukung"
              width={800}
              height={400}
              sizes="(max-width: 1024px) 100vw, 800px"
              className="max-h-[400px] w-full rounded-lg object-contain opacity-90"
            />
          </div>
        )}

        {q.audioUrl && (
          <div className="mb-8 flex flex-col gap-4 rounded-lg border border-border bg-[hsl(var(--muted)/0.2)] p-5 shadow-none dark:bg-[hsl(var(--background)/0.3)]">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              <VolumeUp size={16} aria-hidden="true" className="text-primary" />
              Audio Track (Review)
            </p>
            <audio
              aria-label="Audio"
              controls
              className={cn(
                "h-12 w-full opacity-90 outline-none transition-all",
                resolvedTheme === "dark" && "invert"
              )}
              src={q.audioUrl}
            />
          </div>
        )}

        <ReviewQuestionOptions question={q} userAnswer={insight.userAnswer} />

        {!insight.isAnswered && (
          <div className="mt-6 flex items-start gap-3 rounded-lg border border-warning/20 bg-warning/10 p-4 text-warning">
            <Alert size={18} aria-hidden="true" className="mt-0.5 shrink-0" />
            <p className="text-xs font-bold leading-relaxed">
              Soal ini belum dijawab saat ujian, jadi dihitung sebagai bagian dari review kesalahan.
            </p>
          </div>
        )}

        {(q.explanationHtml || q.sourceReference || q.sourceId) && (
          <div className="mt-6 rounded-lg border border-border bg-muted/20 p-5">
            {q.explanationHtml && (
              <div
                className="prose-custom font-japanese text-sm leading-relaxed text-foreground"
                dangerouslySetInnerHTML={{
                  __html: sanitizeHtml(q.explanationHtml),
                }}
              />
            )}
            {(q.sourceReference || q.sourceId) && (
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Source: {q.sourceReference || q.sourceId}
                  {q.sourceType ? ` (${q.sourceType})` : ""}
                </p>
                <div className="flex flex-wrap gap-2">
                  {srsStatusLabel && (
                    <Badge
                      variant="outline"
                      className="rounded-xl border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-primary"
                    >
                      <Star size={12} aria-hidden="true" className="mr-1" />
                      {srsStatusLabel}
                    </Badge>
                  )}
                  {sourceHref && (
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="h-auto rounded-xl px-3 py-1 text-[10px] font-black uppercase tracking-widest"
                    >
                      <Link href={sourceHref}>Buka Materi</Link>
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </Card>
    </m.div>
  );
}
