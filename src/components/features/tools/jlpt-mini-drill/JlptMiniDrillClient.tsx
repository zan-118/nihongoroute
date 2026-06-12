"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  ListChecks,
  RotateCcw,
  Shuffle,
  Sparkles,
  Trophy,
  XCircle,
} from "lucide-react";
import {
  createMiniDrill,
  DRILL_KINDS,
  DRILL_LEVELS,
  isMiniDrillAnswerCorrect,
  type DrillKind,
  type DrillLevel,
  type MiniDrillQuestion,
} from "@/lib/jlpt-mini-drill";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import NextActionPanel from "@/components/features/ecosystem/NextActionPanel";
import { useUIStore } from "@/store/useUIStore";
import { cn } from "@/lib/utils";

const LEVEL_LABELS: Record<DrillLevel | "all", string> = {
  all: "Semua",
  N5: "N5",
  N4: "N4",
  N3: "N3",
  N2: "N2",
  N1: "N1",
};

const KIND_LABELS: Record<DrillKind | "mixed", string> = {
  mixed: "Campur",
  vocab: "Vocab",
  kanji: "Kanji",
  grammar: "Grammar",
  sentence: "Kalimat",
};

const AMOUNT_OPTIONS = [5, 8, 12, 16] as const;

interface JlptMiniDrillClientProps {
  initialQuestions?: MiniDrillQuestion[];
  databaseQuestionCount?: number;
  initialLevel?: DrillLevel | "all";
  initialKind?: DrillKind | "mixed";
  contextLabel?: string;
}

export default function JlptMiniDrillClient({
  initialQuestions = [],
  databaseQuestionCount = 0,
  initialLevel = "all",
  initialKind = "mixed",
  contextLabel,
}: JlptMiniDrillClientProps) {
  const [level, setLevel] = useState<DrillLevel | "all">(initialLevel);
  const [kind, setKind] = useState<DrillKind | "mixed">(initialKind);
  const [amount, setAmount] = useState<number>(8);
  const [seed, setSeed] = useState(1);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [isFinished, setIsFinished] = useState(false);
  const hasRecordedFinishRef = useRef(false);
  const recordLearningEvent = useUIStore((state) => state.recordLearningEvent);
  const questionBank = useMemo(
    () => (initialQuestions.length > 0 ? initialQuestions : undefined),
    [initialQuestions]
  );

  const questions = useMemo(
    () => createMiniDrill({ level, kind, amount, seed: String(seed), bank: questionBank }),
    [amount, kind, level, questionBank, seed]
  );
  const question = questions[questionIndex] ?? questions[0];
  const hasAnswered = selectedAnswer !== null;
  const isCorrect = selectedAnswer
    ? isMiniDrillAnswerCorrect(question.answer, selectedAnswer)
    : false;
  const progressPercent = Math.round((score.total / questions.length) * 100);
  const accuracy = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;

  const resetSession = (nextSeed = seed) => {
    setSeed(nextSeed);
    setQuestionIndex(0);
    setSelectedAnswer(null);
    setScore({ correct: 0, total: 0 });
    setIsFinished(false);
    hasRecordedFinishRef.current = false;
  };

  const handleSelect = (answer: string) => {
    if (hasAnswered || isFinished) return;

    const correct = isMiniDrillAnswerCorrect(question.answer, answer);
    setSelectedAnswer(answer);
    setScore((prev) => ({
      correct: prev.correct + (correct ? 1 : 0),
      total: prev.total + 1,
    }));
    recordLearningEvent({
      type: "jlpt_drill_answered",
      source: {
        type: question.kind,
        id: question.id,
        slug: question.sourceHref?.split("/").pop(),
        title: question.sourceTitle || question.prompt,
        href: question.sourceHref,
        level: question.level,
      },
      details: {
        kind: question.kind,
        prompt: question.prompt,
        answer,
        isCorrect: correct,
      },
    });
  };

  const handleNext = () => {
    if (questionIndex >= questions.length - 1) {
      setIsFinished(true);
      if (!hasRecordedFinishRef.current) {
        hasRecordedFinishRef.current = true;
        recordLearningEvent({
          type: "jlpt_drill_completed",
          source: {
            type: "tool",
            id: "jlpt-drill",
            title: "JLPT Mini Drill",
            href: "/tools/jlpt-drill",
            level: level === "all" ? undefined : level,
          },
          metrics: {
            correct: score.correct,
            total: score.total,
            accuracy: score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0,
          },
          details: {
            kind,
          },
        });
      }
      return;
    }

    setQuestionIndex((prev) => prev + 1);
    setSelectedAnswer(null);
  };

  const handleConfigChange = (callback: () => void) => {
    callback();
    resetSession(seed + 1);
  };

  return (
    <div className="min-h-screen bg-background/95 px-4 py-12 md:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="flex flex-col gap-5">
          <Button variant="outline" asChild className="w-fit rounded-xl">
            <Link href="/tools">Kembali ke Peralatan</Link>
          </Button>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
                <ListChecks size={24} aria-hidden="true" />
              </div>
              <Badge className="w-fit rounded-xl px-3 py-1">JLPT Mini Drill</Badge>
            </div>
            <h1 className="max-w-3xl text-4xl font-black uppercase tracking-tight text-foreground md:text-6xl">
              Drill Cepat JLPT
            </h1>
            <p className="max-w-2xl text-sm font-medium leading-relaxed text-muted-foreground">
              Buat sesi kecil berisi vocab, kanji, dan grammar dari N5 sampai N1 untuk pemanasan sebelum masuk library atau exam.
            </p>
            <p className="text-xs font-bold text-muted-foreground">
              {databaseQuestionCount > 0
                ? `${databaseQuestionCount} soal aktif dari database library.`
                : "Memakai bank soal lokal karena data library belum tersedia."}
            </p>
            {contextLabel ? (
              <Badge variant="outline" className="w-fit rounded-xl px-3 py-1 text-[10px]">
                {contextLabel}
              </Badge>
            ) : null}
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
          <Card className="rounded-[2rem] border border-border bg-card/45 p-5 shadow-xl">
            <div className="mb-5 flex items-center gap-2">
              <ClipboardList size={16} className="text-primary" aria-hidden="true" />
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-foreground">
                Setup Drill
              </h2>
            </div>

            <div className="flex flex-col gap-5">
              <div>
                <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Level
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {DRILL_LEVELS.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => handleConfigChange(() => setLevel(item))}
                      aria-pressed={level === item}
                      className={cn(
                        "min-h-12 rounded-xl border px-3 text-sm font-black transition-all",
                        level === item
                          ? "border-primary/40 bg-primary/10 text-primary"
                          : "border-border bg-background/35 text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {LEVEL_LABELS[item]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Tipe
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {DRILL_KINDS.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => handleConfigChange(() => setKind(item))}
                      aria-pressed={kind === item}
                      className={cn(
                        "min-h-12 rounded-xl border px-3 text-sm font-black transition-all",
                        kind === item
                          ? "border-success/40 bg-success/10 text-success"
                          : "border-border bg-background/35 text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {KIND_LABELS[item]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Jumlah Soal
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {AMOUNT_OPTIONS.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => handleConfigChange(() => setAmount(item))}
                      aria-pressed={amount === item}
                      className={cn(
                        "min-h-12 rounded-xl border font-mono text-sm font-black transition-all",
                        amount === item
                          ? "border-warning/40 bg-warning/10 text-warning"
                          : "border-border bg-background/35 text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <Button type="button" variant="outline" onClick={() => resetSession(seed + 1)} className="rounded-xl">
                <Shuffle data-icon="inline-start" />
                Generate Ulang
              </Button>
            </div>
          </Card>

          <div className="flex flex-col gap-6">
            <Card className="rounded-[2rem] border border-border bg-card/45 p-5 shadow-2xl md:p-7">
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <Badge variant="outline" className="mb-3 rounded-xl">
                    {question.level} · {KIND_LABELS[question.kind]} · Soal {Math.min(score.total + 1, questions.length)}/{questions.length}
                  </Badge>
                  <p className="font-japanese text-4xl font-black leading-relaxed text-foreground md:text-6xl">
                    {question.prompt}
                  </p>
                  {question.reading ? (
                    <p className="mt-2 font-japanese text-lg font-bold text-muted-foreground">
                      {hasAnswered ? question.reading : "••••"}
                    </p>
                  ) : null}
                </div>
                <div className="w-full rounded-2xl border border-border bg-muted/15 p-4 sm:w-44">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Akurasi
                  </p>
                  <p className="font-mono text-3xl font-black text-foreground">{accuracy}%</p>
                  <Progress value={progressPercent} className="mt-3 h-2" />
                </div>
              </div>

              {isFinished ? (
                <div className="flex flex-col gap-5">
                  <div className="rounded-2xl border border-success/25 bg-success/10 p-6">
                    <div className="flex items-center gap-2 text-success">
                      <Trophy size={20} aria-hidden="true" />
                      <p className="text-xs font-black uppercase tracking-widest">Sesi Selesai</p>
                    </div>
                    <p className="mt-3 font-mono text-4xl font-black text-foreground">
                      {score.correct}/{questions.length}
                    </p>
                    <p className="mt-2 text-sm font-medium leading-relaxed text-muted-foreground">
                      Sesi kecil sudah selesai. Generate ulang untuk set baru atau ubah level untuk pemanasan yang berbeda.
                    </p>
                  </div>
                  <NextActionPanel compact />
                </div>
              ) : (
                <>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {question.options.map((option) => {
                      const isSelected = selectedAnswer === option;
                      const isAnswer = isMiniDrillAnswerCorrect(question.answer, option);

                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => handleSelect(option)}
                          disabled={hasAnswered}
                          className={cn(
                            "min-h-20 rounded-2xl border p-4 text-left text-base font-black transition-all",
                            !hasAnswered && "border-border bg-background/45 hover:border-primary/40 hover:bg-primary/10",
                            hasAnswered && isAnswer && "border-success/35 bg-success/10 text-success",
                            hasAnswered && isSelected && !isAnswer && "border-destructive/35 bg-destructive/10 text-destructive",
                            hasAnswered && !isSelected && !isAnswer && "border-border bg-muted/10 text-muted-foreground/45"
                          )}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <Button type="button" variant="ghost" onClick={() => resetSession(seed)} className="rounded-xl">
                      <RotateCcw data-icon="inline-start" />
                      Reset
                    </Button>
                    <Button type="button" onClick={handleNext} disabled={!hasAnswered} className="rounded-xl">
                      {questionIndex >= questions.length - 1 ? "Ringkasan" : "Berikutnya"}
                      <ArrowRight data-icon="inline-end" />
                    </Button>
                  </div>
                </>
              )}
            </Card>

            <Card className="rounded-[2rem] border border-border bg-card/45 p-5 shadow-xl">
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
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-foreground">
                  Feedback
                </h2>
              </div>
              {hasAnswered ? (
                <div
                  className={cn(
                    "rounded-2xl border p-5",
                    isCorrect ? "border-success/25 bg-success/10" : "border-warning/25 bg-warning/10"
                  )}
                >
                  <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                    {isCorrect ? "Benar" : "Jawaban Target"}
                  </p>
                  <p className="mt-2 text-2xl font-black text-foreground">{question.answer}</p>
                  <p className="mt-2 text-sm font-medium leading-relaxed text-muted-foreground">
                    {question.explanation}
                  </p>
                  {question.sourceHref ? (
                    <Button asChild variant="outline" size="sm" className="mt-4 rounded-xl">
                      <Link href={question.sourceHref}>Buka di Library</Link>
                    </Button>
                  ) : null}
                </div>
              ) : (
                <p className="rounded-2xl border border-dashed border-border bg-muted/15 p-5 text-sm font-medium text-muted-foreground">
                  Pilih jawaban untuk membuka reading dan alasan singkat.
                </p>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
