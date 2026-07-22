"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Hash,
  HelpCircle,
  RotateCcw,
  Sparkles,
  XCircle,
} from "@/components/ui/icons";
import {
  COUNTER_OPTIONS,
  COUNTER_QUESTIONS,
  formatCounterPrompt,
  getCounterQuestion,
  isCounterAnswerCorrect,
  type CounterQuestion,
  type CounterWord,
} from "@/lib/counter-trainer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import NextActionPanel from "@/components/features/ecosystem/NextActionPanel";
import { useUIStore } from "@/store/useUIStore";
import { cn } from "@/lib/utils";

import { ROUTES } from "@/lib/core/routes";
/**
 * Props for CounterTrainerClient.
 */
interface CounterTrainerClientProps {
  /** Questions loaded from database or local fallback. */
  initialQuestions?: CounterQuestion[];
  /** Total questions available in database. */
  databaseQuestionCount?: number;
  /** Label showing source context. */
  contextLabel?: string;
}

/**
 * Interactive trainer for Japanese counters.
 */
export default function CounterTrainerClient({
  initialQuestions = [],
  databaseQuestionCount = 0,
  contextLabel,
}: CounterTrainerClientProps) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedCounter, setSelectedCounter] = useState<CounterWord | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [answeredIds, setAnsweredIds] = useState<Set<string>>(() => new Set());
  const completedBankRef = useRef(false);
  const recordLearningEvent = useUIStore((state) => state.recordLearningEvent);
  
  // Use database questions if available, else fallback to local questions
  const questionBank = initialQuestions.length > 0 ? initialQuestions : COUNTER_QUESTIONS;

  const question = getCounterQuestion(questionIndex, questionBank);
  const hasAnswered = selectedCounter !== null;
  const isCorrect = selectedCounter
    ? isCounterAnswerCorrect(question.answer, selectedCounter)
    : false;
  const progressPercent = Math.round((answeredIds.size / questionBank.length) * 100);
  const accuracy = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;

  /**
   * Handle counter selection.
   * Logs events and updates score.
   */
  const handleSelect = (counter: CounterWord) => {
    // Block input if answered
    if (hasAnswered) return;

    const correct = isCounterAnswerCorrect(question.answer, counter);
    setSelectedCounter(counter);
    setScore((prev) => ({
      correct: prev.correct + (correct ? 1 : 0),
      total: prev.total + 1,
    }));
    setAnsweredIds((prev) => {
      const next = new Set(prev).add(question.id);
      // Log completion event when all questions answered
      if (next.size >= questionBank.length && !completedBankRef.current) {
        completedBankRef.current = true;
        recordLearningEvent({
          type: "counter_completed",
          source: {
            type: "tool",
            id: "counter-trainer",
            title: "Counter Trainer",
            href:ROUTES.TOOLS.COUNTER_TRAINER,
            level: question.level,
          },
          metrics: {
            correct: score.correct + (correct ? 1 : 0),
            total: score.total + 1,
            accuracy: Math.round(((score.correct + (correct ? 1 : 0)) / (score.total + 1)) * 100),
          },
          details: {
            kind: "counter",
          },
        });
      }
      return next;
    });
    // Log answer event
    recordLearningEvent({
      type: "counter_answered",
      source: {
        type: question.sourceHref ? "vocab" : "tool",
        id: question.id,
        slug: question.sourceHref?.split("/").pop(),
        title: question.sourceTitle || question.noun,
        href: question.sourceHref,
        level: question.level,
      },
      details: {
        kind: "counter",
        prompt: question.noun,
        answer: counter,
        isCorrect: correct,
      },
    });
  };

  /**
   * Cycle to next question.
   */
  const handleNext = () => {
    setQuestionIndex((prev) => (prev + 1) % questionBank.length);
    setSelectedCounter(null);
    setShowHint(false);
  };

  /**
   * Reset trainer state.
   */
  const handleReset = () => {
    setQuestionIndex(0);
    setSelectedCounter(null);
    setShowHint(false);
    setScore({ correct: 0, total: 0 });
    setAnsweredIds(new Set());
    completedBankRef.current = false;
  };

  return (
    <div className="min-h-screen bg-background/95 px-4 py-12 md:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="flex flex-col gap-5">
          <Button variant="outline" asChild className="w-fit rounded-xl">
            <Link href={ROUTES.TOOLS.ROOT}>Kembali ke Peralatan</Link>
          </Button>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-lg border border-warning/20 bg-warning/10 text-warning">
                <Hash size={24} aria-hidden="true" />
              </div>
              <Badge className="w-fit rounded-xl px-3 py-1">Counter Trainer</Badge>
            </div>
            <h1 className="max-w-3xl text-4xl uppercase tracking-tight text-foreground md:text-6xl">
              Latihan Counter
            </h1>
            <p className="max-w-2xl text-sm font-medium leading-relaxed text-muted-foreground">
              Pilih kata bantu bilangan yang tepat untuk orang, benda panjang, lembaran, hewan kecil, minuman, umur, dan lantai.
            </p>
            <p className="text-xs font-bold text-muted-foreground">
              {databaseQuestionCount > 0
                ? `${databaseQuestionCount} soal aktif dari kosakata database.`
                : "Memakai bank soal lokal karena data vocab belum cocok untuk counter."}
            </p>
            {contextLabel ? (
              <Badge variant="outline" className="w-fit rounded-xl px-3 py-1 text-[10px]">
                {contextLabel}
              </Badge>
            ) : null}
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <Card className="rounded-2xl md:rounded-3xl border border-border bg-card/45 p-5 shadow-2xl md:p-8">
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <Badge variant="outline" className="mb-3 rounded-xl">
                  {question.level} · {question.category} · Soal {questionIndex + 1}/{questionBank.length}
                </Badge>
                <p className="font-japanese text-4xl font-black leading-relaxed text-foreground md:text-6xl">
                  {formatCounterPrompt(question)}
                </p>
                <p className="mt-2 text-sm font-bold text-muted-foreground">
                  {question.translation}
                </p>
              </div>
              <div className="w-full rounded-lg border border-border bg-muted/15 p-4 sm:w-44">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Akurasi
                </p>
                <p className="font-mono text-3xl font-black text-foreground">{accuracy}%</p>
                <Progress value={progressPercent} className="mt-3 h-2" />
              </div>
            </div>

            {/* Render counter options */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              {COUNTER_OPTIONS.map((counter) => {
                const isSelected = selectedCounter === counter;
                const isAnswer = isCounterAnswerCorrect(question.answer, counter);

                return (
                  <button
                    key={counter}
                    type="button"
                    onClick={() => handleSelect(counter)}
                    disabled={hasAnswered}
                    className={cn(
                      "flex aspect-square min-h-20 items-center justify-center rounded-lg border font-japanese text-4xl font-black transition-all",
                      !hasAnswered && "border-border bg-background/45 hover:border-warning/40 hover:bg-warning/10",
                      hasAnswered && isAnswer && "border-success/35 bg-success/10 text-success",
                      hasAnswered && isSelected && !isAnswer && "border-destructive/35 bg-destructive/10 text-destructive",
                      hasAnswered && !isSelected && !isAnswer && "border-border bg-muted/10 text-muted-foreground/45"
                    )}
                  >
                    {counter}
                  </button>
                );
              })}
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowHint((prev) => !prev)}
                className="rounded-xl"
              >
                <HelpCircle data-icon="inline-start" />
                Hint
              </Button>
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="ghost" onClick={handleReset} className="rounded-xl">
                  <RotateCcw data-icon="inline-start" />
                  Reset
                </Button>
                <Button type="button" onClick={handleNext} className="rounded-xl">
                  Berikutnya
                  <ArrowRight data-icon="inline-end" />
                </Button>
              </div>
            </div>
          </Card>

          <div className="flex flex-col gap-6">
            <Card className="rounded-2xl md:rounded-3xl border border-border bg-card/45 p-5 shadow-xl">
              <div className="mb-4 flex items-center gap-2">
                {hasAnswered ? (
                  isCorrect ? (
                    <CheckCircle2 size={16} className="text-success" aria-hidden="true" />
                  ) : (
                    <XCircle size={16} className="text-warning" aria-hidden="true" />
                  )
                ) : (
                  <Sparkles size={16} className="text-primary" aria-hidden="true" />
                )}
                <h2 className="text-xs uppercase tracking-[0.2em] text-foreground">
                  Feedback
                </h2>
              </div>

              {hasAnswered ? (
                <div
                  className={cn(
                    "rounded-lg border p-5",
                    isCorrect ? "border-success/25 bg-success/10" : "border-warning/25 bg-warning/10"
                  )}
                >
                  <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                    {isCorrect ? "Benar" : "Counter Target"}
                  </p>
                  <p className="mt-2 font-japanese text-3xl font-black text-foreground">
                    {question.phrase}
                  </p>
                  <p className="mt-1 font-japanese text-sm font-bold text-muted-foreground">
                    {question.reading}
                  </p>
                  <p className="mt-3 text-sm font-medium leading-relaxed text-muted-foreground">
                    {question.explanation}
                  </p>
                  {question.sourceHref ? (
                    <Button asChild variant="outline" size="sm" className="mt-4 rounded-xl">
                      <Link href={question.sourceHref}>Buka Vocab</Link>
                    </Button>
                  ) : null}
                </div>
              ) : (
                <p className="rounded-lg border border-dashed border-border bg-muted/15 p-5 text-sm font-medium text-muted-foreground">
                  Jawab dulu untuk melihat frasa lengkap dan bacaan.
                </p>
              )}

              {(showHint || hasAnswered) && (
                <p className="mt-4 rounded-lg border border-warning/20 bg-warning/10 p-4 text-sm font-bold text-warning">
                  {question.hint}
                </p>
              )}
            </Card>

            <Card className="rounded-2xl md:rounded-3xl border border-border bg-muted/15 p-5">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Bank Counter
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                {COUNTER_OPTIONS.map((counter) => (
                  <div
                    key={counter}
                    className={cn(
                      "rounded-xl border p-3 text-center font-japanese text-2xl font-black",
                      counter === question.answer
                        ? "border-warning/35 bg-warning/10 text-warning"
                        : "border-border bg-background/35 text-muted-foreground"
                    )}
                  >
                    {counter}
                  </div>
                ))}
              </div>
              <p className="mt-4 font-mono text-2xl font-black text-foreground">
                {answeredIds.size}/{questionBank.length}
              </p>
            </Card>

            <NextActionPanel compact />
          </div>
        </div>
      </div>
    </div>
  );
}