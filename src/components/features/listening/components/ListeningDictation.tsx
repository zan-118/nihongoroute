"use client";

/**
 * @file ListeningDictation.tsx
 * @description Mode latihan dictation untuk mengetik ulang baris transcript listening.
 */

import { useMemo, useState } from "react";
import { AnimatePresence, m } from "framer-motion";
import {
  CheckCircle2,
  ClipboardPenLine,
  Eye,
  EyeOff,
  RotateCcw,
  Sparkles,
  Target,
  Volume2,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { evaluateDictation, extractDictationText, type DictationEvaluation } from "@/lib/dictation";
import { cn } from "@/lib/utils";
import { TranscriptLine } from "../types";

interface ListeningDictationProps {
  transcript: TranscriptLine[];
  seekToLine: (startTime: number) => void;
}

interface DictationAttempt {
  lineKey: string;
  evaluation: DictationEvaluation;
}

export default function ListeningDictation({ transcript, seekToLine }: ListeningDictationProps) {
  const dictationLines = useMemo(
    () =>
      transcript
        .map((line, index) => ({
          ...line,
          index,
          cleanText: extractDictationText(line.text).trim(),
        }))
        .filter((line) => line.cleanText.length > 0),
    [transcript]
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [attempts, setAttempts] = useState<Record<string, DictationAttempt>>({});
  const [showAnswer, setShowAnswer] = useState(false);

  const activeLine = dictationLines[activeIndex];
  const activeAttempt = activeLine ? attempts[activeLine._key] : undefined;
  const completedCount = Object.keys(attempts).length;
  const passedCount = Object.values(attempts).filter((item) => item.evaluation.isPassed).length;
  const score = completedCount > 0 ? Math.round((passedCount / completedCount) * 100) : 0;
  const resultSummary = useMemo(() => {
    const attemptList = Object.values(attempts);
    const averageAccuracy =
      attemptList.length > 0
        ? Math.round(
            attemptList.reduce((total, item) => total + item.evaluation.accuracy, 0) /
              attemptList.length
          )
        : 0;
    const weakAttempts = attemptList
      .filter((item) => !item.evaluation.isPassed)
      .sort((left, right) => left.evaluation.accuracy - right.evaluation.accuracy)
      .slice(0, 3)
      .map((item) => {
        const lineIndex = dictationLines.findIndex((line) => line._key === item.lineKey);
        return {
          ...item,
          line: lineIndex >= 0 ? dictationLines[lineIndex] : undefined,
          lineIndex,
        };
      })
      .filter((item) => item.line);

    return {
      averageAccuracy,
      attemptedCount: attemptList.length,
      passRate: attemptList.length > 0 ? Math.round((passedCount / attemptList.length) * 100) : 0,
      weakAttempts,
    };
  }, [attempts, dictationLines, passedCount]);

  if (dictationLines.length === 0) return null;

  const handleSelectLine = (index: number) => {
    setActiveIndex(index);
    setAnswer("");
    setShowAnswer(false);
    seekToLine(dictationLines[index].startTime);
  };

  const handleCheck = () => {
    if (!activeLine || !answer.trim()) return;
    const evaluation = evaluateDictation(activeLine.cleanText, answer);
    setAttempts((prev) => ({
      ...prev,
      [activeLine._key]: {
        lineKey: activeLine._key,
        evaluation,
      },
    }));
  };

  const handleReset = () => {
    setAnswer("");
    setShowAnswer(false);
    if (activeLine) {
      setAttempts((prev) => {
        const next = { ...prev };
        delete next[activeLine._key];
        return next;
      });
    }
  };

  return (
    <Card className="mx-auto w-full max-w-4xl rounded-[2rem] border border-border bg-card/45 p-5 shadow-2xl md:p-8">
      <div className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
            <ClipboardPenLine size={22} aria-hidden="true" />
          </div>
          <div className="flex flex-col gap-2">
            <Badge className="w-fit rounded-xl px-3 py-1">
              Dictation Mode
            </Badge>
            <div className="flex flex-col gap-1">
              <h2 className="text-xl font-black uppercase tracking-tight text-foreground">
                Ketik Yang Kamu Dengar
              </h2>
              <p className="text-sm font-medium leading-relaxed text-muted-foreground">
                Pilih baris, putar audionya, lalu tulis ulang kalimat Jepang tanpa melihat jawaban.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-muted/20 p-4">
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            Progress
          </span>
          <p className="mt-1 font-mono text-2xl font-black text-foreground">
            {passedCount}/{dictationLines.length}
            <span className="ml-2 text-sm text-muted-foreground">({score}%)</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
        <div className="max-h-[360px] overflow-y-auto rounded-2xl border border-border bg-muted/15 p-3 custom-scrollbar">
          <div className="flex flex-col gap-2">
            {dictationLines.map((line, index) => {
              const attempt = attempts[line._key];
              const isActive = index === activeIndex;

              return (
                <button
                  key={line._key}
                  type="button"
                  onClick={() => handleSelectLine(index)}
                  className={cn(
                    "flex items-center justify-between gap-3 rounded-xl border p-3 text-left transition-all",
                    isActive
                      ? "border-primary/35 bg-primary/10 text-primary"
                      : "border-border bg-background/35 text-muted-foreground hover:bg-muted/30 hover:text-foreground"
                  )}
                >
                  <span className="text-xs font-black uppercase tracking-widest">
                    Baris {index + 1}
                  </span>
                  {attempt ? (
                    attempt.evaluation.isPassed ? (
                      <CheckCircle2 size={16} aria-hidden="true" className="text-success" />
                    ) : (
                      <XCircle size={16} aria-hidden="true" className="text-destructive" />
                    )
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div className="rounded-2xl border border-border bg-background/45 p-5">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Baris {activeIndex + 1}
                </p>
                {activeLine.speaker ? (
                  <p className="text-sm font-bold text-primary">
                    {activeLine.speaker}
                  </p>
                ) : null}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => seekToLine(activeLine.startTime)}
                className="rounded-xl"
              >
                <Volume2 data-icon="inline-start" />
                Putar Baris
              </Button>
            </div>

            <textarea
              aria-label="Jawaban dictation"
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              placeholder="Tulis kalimat Jepang yang kamu dengar..."
              className="min-h-32 w-full resize-y rounded-2xl border border-border bg-muted/20 p-4 text-lg font-medium leading-relaxed text-foreground outline-none transition-all placeholder:text-muted-foreground/55 focus:border-primary/40 focus:ring-2 focus:ring-primary/20 font-japanese"
            />

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button
                type="button"
                onClick={handleCheck}
                disabled={!answer.trim()}
                className="rounded-xl"
              >
                Periksa Jawaban
              </Button>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAnswer((prev) => !prev)}
                  className="rounded-xl"
                >
                  {showAnswer ? (
                    <EyeOff data-icon="inline-start" />
                  ) : (
                    <Eye data-icon="inline-start" />
                  )}
                  {showAnswer ? "Sembunyikan" : "Lihat Jawaban"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleReset}
                  className="rounded-xl"
                >
                  <RotateCcw data-icon="inline-start" />
                  Reset
                </Button>
              </div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {activeAttempt && (
              <m.div
                key={`${activeLine._key}-${activeAttempt.evaluation.attempt}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className={cn(
                  "rounded-2xl border p-5",
                  activeAttempt.evaluation.isPassed
                    ? "border-success/25 bg-success/10 text-success"
                    : "border-warning/25 bg-warning/10 text-warning"
                )}
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs font-black uppercase tracking-widest">
                    Akurasi
                  </span>
                  <span className="font-mono text-2xl font-black">
                    {activeAttempt.evaluation.accuracy}%
                  </span>
                </div>
                <p className="mt-2 text-sm font-bold text-foreground">
                  {activeAttempt.evaluation.isPassed
                    ? "Bagus. Jawabanmu sudah cukup akurat."
                    : "Masih ada bagian yang meleset. Putar ulang baris ini dan coba lagi."}
                </p>
              </m.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showAnswer && (
              <m.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="rounded-2xl border border-border bg-muted/20 p-5">
                  <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Jawaban
                  </p>
                  <p className="text-xl font-bold leading-relaxed text-foreground font-japanese">
                    {activeLine.cleanText}
                  </p>
                  {activeLine.translation ? (
                    <p className="mt-3 border-t border-border pt-3 text-sm font-medium italic text-muted-foreground">
                      {activeLine.translation}
                    </p>
                  ) : null}
                </div>
              </m.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {resultSummary.attemptedCount > 0 && (
              <m.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="rounded-2xl border border-border bg-muted/15 p-5"
              >
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-primary" aria-hidden="true" />
                    <span className="text-xs font-black uppercase tracking-widest text-foreground">
                      Ringkasan Hasil
                    </span>
                  </div>
                  <Badge variant={score >= 80 ? "default" : "outline"} className="w-fit">
                    {resultSummary.attemptedCount}/{dictationLines.length} dicoba
                  </Badge>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-border bg-background/40 p-3">
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                      Rata-rata
                    </p>
                    <p className="font-mono text-2xl font-black text-foreground">
                      {resultSummary.averageAccuracy}%
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-background/40 p-3">
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                      Lulus
                    </p>
                    <p className="font-mono text-2xl font-black text-success">
                      {passedCount}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-background/40 p-3">
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                      Pass Rate
                    </p>
                    <p className="font-mono text-2xl font-black text-foreground">
                      {resultSummary.passRate}%
                    </p>
                  </div>
                </div>

                {resultSummary.weakAttempts.length > 0 ? (
                  <div className="mt-4 flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-warning">
                      <Target size={14} aria-hidden="true" />
                      <span className="text-[10px] font-black uppercase tracking-widest">
                        Baris Prioritas
                      </span>
                    </div>
                    {resultSummary.weakAttempts.map((item) => {
                      const line = item.line;
                      if (!line) return null;

                      return (
                        <button
                          key={item.lineKey}
                          type="button"
                          onClick={() => handleSelectLine(item.lineIndex)}
                          className="rounded-xl border border-warning/25 bg-warning/10 p-3 text-left transition-all hover:border-warning/45 hover:bg-warning/15"
                        >
                          <div className="mb-2 flex items-center justify-between gap-3">
                            <span className="text-[10px] font-black uppercase tracking-widest text-warning">
                              Baris {item.lineIndex + 1}
                            </span>
                            <span className="font-mono text-sm font-black text-warning">
                              {item.evaluation.accuracy}%
                            </span>
                          </div>
                          <p className="line-clamp-1 text-sm font-bold text-foreground font-japanese">
                            {item.evaluation.expected}
                          </p>
                          <p className="mt-1 line-clamp-1 text-xs font-medium text-muted-foreground font-japanese">
                            Kamu: {item.evaluation.attempt}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="mt-4 rounded-xl border border-success/20 bg-success/10 p-3 text-sm font-bold text-success">
                    Semua baris yang dicoba sudah lolos.
                  </p>
                )}
              </m.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Card>
  );
}
