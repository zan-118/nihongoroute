"use client";

/**
 * @file ExamReview.tsx
 * @description Review jawaban setelah mock exam selesai, lengkap dengan ringkasan kesalahan dan rekomendasi latihan.
 */

import { useMemo, useState } from "react";
import { m } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import {
 Alert,
 ArrowLeft,
 ArrowRight,
 BookOpen,
 Brain,
 Check,
 Clipboard,
 Filter,
 Target,
 VolumeUp,
 X,
 Star,
 type IconType,
} from "@/components/ui/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
 analyzeExamReview,
 type ExamReviewAction,
 type ExamReviewQuestionInsight,
} from "@/lib/exam-review-analysis";
import { cn } from "@/lib/utils";
import { sanitizeHtml } from "@/lib/sanitize";
import { ExamChoice, ExamData, ExamPassage, GameState } from "./types";
import { SECTION_LABELS } from "./constants";
import { ExamQuestionText } from "./ExamQuestionText";

/**
 * ExamReview component props.
 */
interface ExamReviewProps {
 /** Exam data. */
 exam: ExamData;
 /** User answers. Key is question ID, value is choice index. */
 answers: Record<string, number>;
 /** Callback to update game state. */
 setGameState: (state: GameState) => void;
}

type ReviewFilter = "mistakes" | "all";

/** Map action ID to icon. */
const ACTION_ICONS: Record<ExamReviewAction["id"], IconType> = {
 "weak-points": Target,
 flashcards: Clipboard,
 listening: VolumeUp,
 reading: BookOpen,
 grammar: Brain,
 vocab: BookOpen,
};

/** Get CSS classes from accuracy score. */
function getAccuracyTone(accuracy: number) {
 if (accuracy >= 70) return "text-success border-success/25 bg-success/10";
 if (accuracy >= 45) return "text-warning border-warning/25 bg-warning/10";
 return "text-destructive border-destructive/25 bg-destructive/10";
}

/** Get border class from question correctness. */
function getQuestionBorderClass(insight: ExamReviewQuestionInsight) {
 if (insight.isCorrect) return "border-success/25";
 if (!insight.isAnswered) return "border-warning/30";
 return "border-destructive/25";
}

/** Get status metadata for question. */
function getQuestionStatus(insight: ExamReviewQuestionInsight) {
  if (insight.isCorrect) {
    return {
      label: "Benar",
      icon: Check,
      className: "bg-success/10 text-success border-success/20",
    };
  }

  if (!insight.isAnswered) {
    return {
      label: "Kosong",
      icon: Alert,
      className: "bg-warning/10 text-warning border-warning/20",
    };
  }

  return {
    label: "Salah",
    icon: X,
    className: "bg-destructive/10 text-destructive border-destructive/20",
  };
}

/** Get library URL from source type and ID. */
function getSourceHref(sourceType?: string | null, sourceId?: string | null) {
 if (!sourceType || !sourceId) return null;
 const encodedId = encodeURIComponent(sourceId);

 if (sourceType === "vocab") return `/library/vocab/${encodedId}`;
 if (sourceType === "kanji") return `/library/kanji/${encodedId}`;
 if (sourceType === "reading") return `/library/reading/${encodedId}`;
 if (sourceType === "listening") return `/library/listening/${encodedId}`;
 if (sourceType === "grammar") return `/library/grammar/${encodedId}`;

 return null;
}

/** Get SRS label for wrong answer. */
function getSrsStatusLabel(insight: ExamReviewQuestionInsight) {
 const hasSource = Boolean(insight.question.sourceType && insight.question.sourceId);
 if (insight.isCorrect || !hasSource) return null;

 return insight.question.sourceType === "vocab"
 ? "Masuk SRS otomatis"
 : "Masuk weak point";
}

/** Render passage content, image, or transcript. */
function ReviewPassageBlock({ passage }: { passage?: ExamPassage | null }) {
 if (!passage) return null;

 const hasContent = Boolean(
 passage.contentHtml ||
 passage.visualUrl ||
 passage.transcriptHtml
 );

 if (!hasContent) return null;

 return (
 <div className="mb-8 rounded-lg border border-border bg-[hsl(var(--muted)/0.25)] p-5 dark:bg-[hsl(var(--background)/0.12)]">
 {passage.visualUrl && (
 <div className="mb-5 overflow-hidden rounded-lg border border-border bg-background/60">
 <Image
 src={passage.visualUrl}
 alt="Visual bacaan"
 width={900}
 height={500}
 sizes="(max-width: 1024px) 100vw, 900px"
 className="max-h-[420px] w-full object-contain"
 />
 </div>
 )}

 {passage.contentHtml && (
 <div
 className="prose-custom font-japanese text-base leading-relaxed text-foreground md:text-lg"
 dangerouslySetInnerHTML={{ __html: sanitizeHtml(passage.contentHtml) }}
 />
 )}

 {passage.transcriptHtml && (
 <details className="mt-5 rounded-xl border border-border bg-background/60 p-4">
 <summary className="cursor-pointer text-[10px] font-black uppercase tracking-widest text-muted-foreground">
 Transkrip Listening
 </summary>
 <div
 className="prose-custom mt-4 font-japanese text-sm leading-relaxed text-foreground"
 dangerouslySetInnerHTML={{
 __html: sanitizeHtml(passage.transcriptHtml),
 }}
 />
 </details>
 )}
 </div>
 );
}

/** Render choice text or image. */
function ReviewChoiceContent({
 choice,
 text,
}: {
 choice?: ExamChoice;
 text: string;
}) {
 if (choice?.type !== "image") {
 return (
 <span 
 className="min-w-0 flex-1 text-base font-medium leading-tight md:text-xl font-japanese [&_rt]:text-[0.55em] [&_rt]:leading-none"
 dangerouslySetInnerHTML={{ __html: sanitizeHtml(choice?.type === "text" ? choice.value : text) }}
 />
 );
 }

 return (
 <span className="flex min-w-0 flex-1 flex-col gap-3">
 <span className="relative block aspect-[16/9] w-full overflow-hidden rounded-xl border border-border bg-muted/30">
 <Image
 src={choice.value}
 alt={choice.alt || text}
 fill
 sizes="(max-width: 768px) 72vw, 560px"
 className="object-contain"
 />
 </span>
 <span className="text-sm font-medium leading-tight text-muted-foreground md:text-base font-japanese">
 {choice.alt || text}
 </span>
 </span>
 );
}

/**
 * Exam review screen. Show stats, recommendations, and question list.
 */
export function ExamReview({ exam, answers, setGameState }: ExamReviewProps) {
 const { resolvedTheme } = useTheme();
 
 // Analyze exam results. Cache for performance.
 const analysis = useMemo(() => analyzeExamReview(exam, answers), [exam, answers]);
 const [filter, setFilter] = useState<ReviewFilter>("mistakes");

 // Fallback to all if no mistakes exist.
 const effectiveFilter = analysis.mistakes.length === 0 ? "all" : filter;
 const visibleInsights =
 effectiveFilter === "mistakes" ? analysis.mistakes : analysis.insights;
 const weakestLabel = analysis.weakestSection
 ? SECTION_LABELS[analysis.weakestSection.section]
 : "Belum ada data";
 const weakestMistakes = analysis.weakestSection
 ? analysis.weakestSection.wrong + analysis.weakestSection.unanswered
 : 0;

 // Stats cards configuration.
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
 <div className="w-full max-w-5xl mx-auto pb-20 transition-colors duration-300">
 <header className="relative z-20 mb-8">
 <Card className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between p-5 sm:p-8 mt-6 md:mt-10 border border-border bg-card rounded-xl shadow-lg">
 <div className="flex flex-col gap-2">
 <Badge variant="outline" className="w-fit rounded-xl px-3 py-1">
 Mock Exam Review
 </Badge>
 <h2 className="text-xl sm:text-2xl text-foreground uppercase leading-none">
 Tinjau <span className="text-warning">Jawaban</span>
 </h2>
 <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">
 Fokus ke kesalahan, section lemah, dan langkah latihan berikutnya.
 </p>
 </div>
 <Button
 variant="ghost"
 onClick={() => {
 setGameState("result");
 window.scrollTo({ top: 0, behavior: "smooth" });
 }}
 className="w-full sm:w-auto text-xs neo-inset hover:bg-background text-muted-foreground hover:text-foreground px-5 py-3 h-auto font-black uppercase tracking-widest border border-border bg-[hsl(var(--muted)/0.5)] dark:bg-[hsl(var(--background)/0.2)] shadow-none rounded-xl"
 >
 <ArrowLeft data-icon="inline-start" />
 Kembali
 </Button>
 </Card>
 </header>

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
 </div>

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

 <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_0.9fr]">
 <div className="rounded-lg border border-border bg-muted/20 p-5">
 <div className="mb-5 flex items-center justify-between gap-4">
 <div className="flex items-center gap-2">
 <Brain size={18} aria-hidden="true" className="text-primary" />
 <span className="text-xs font-black uppercase tracking-widest text-foreground">
 Performa Section
 </span>
 </div>
 <Badge variant="outline" className="rounded-xl px-3 py-1">
 {analysis.sections.length} section
 </Badge>
 </div>

 <div className="flex flex-col gap-5">
 {analysis.sections.map((section) => (
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

 <div className="rounded-lg border border-border bg-muted/20 p-5">
 <div className="mb-5 flex items-center gap-2">
 <Target size={18} aria-hidden="true" className="text-primary" />
 <span className="text-xs font-black uppercase tracking-widest text-foreground">
 Rekomendasi Latihan
 </span>
 </div>

 <div className="flex flex-col gap-4">
 {analysis.actions.map((action) => {
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
 </div>
 </div>
 </Card>
 </section>

 <section className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
 <div className="flex items-center gap-2">
 <Filter size={18} aria-hidden="true" className="text-primary" />
 <span className="text-xs font-black uppercase tracking-widest text-foreground">
 Daftar Review
 </span>
 </div>

 <div className="flex rounded-lg border border-border bg-muted/40 p-1.5">
 <Button
 type="button"
 variant={effectiveFilter === "mistakes" ? "default" : "ghost"}
 size="sm"
 disabled={analysis.mistakes.length === 0}
 aria-pressed={effectiveFilter === "mistakes"}
 onClick={() => setFilter("mistakes")}
 className="rounded-xl px-4"
 >
 Soal Salah ({analysis.mistakes.length})
 </Button>
 <Button
 type="button"
 variant={effectiveFilter === "all" ? "default" : "ghost"}
 size="sm"
 aria-pressed={effectiveFilter === "all"}
 onClick={() => setFilter("all")}
 className="rounded-xl px-4"
 >
 Semua Soal ({analysis.totalQuestions})
 </Button>
 </div>
 </section>

 <div className="flex flex-col gap-10 md:gap-16">
 {visibleInsights.length === 0 ? (
 <Card className="p-8 text-center rounded-2xl md:rounded-3xl border border-border bg-card">
      <Check
        size={44}
        aria-hidden="true"
        className="mx-auto mb-4 text-success"
      />
 <p className="text-sm font-black uppercase tracking-widest text-foreground">
 Tidak ada soal untuk filter ini.
 </p>
 </Card>
 ) : (
 // Render each question review card.
 visibleInsights.map((insight) => {
 const q = insight.question;
 const userAnswer = insight.userAnswer;
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
 key={q._key}
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

 <div className="grid grid-cols-1 gap-4">
 {q.options.map((opt, optIdx) => {
 const isCorrectAnswer = optIdx === q.correctAnswer;
 const isUserSelection = optIdx === userAnswer;
 const choice = q.choices?.[optIdx];

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
 })
 )}
 </div>
 </div>
 );
}