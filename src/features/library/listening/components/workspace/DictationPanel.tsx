"use client";

/**
 * @file DictationPanel.tsx
 * @description Panel latihan dikte: daftar baris, input jawaban, evaluasi akurasi, dan progres.
 */

import { useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import { Check, X, VolumeUp, ChevronRight } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { evaluateDictation } from "@/lib/learning/dictation";
import { TranscriptLine } from "../../types";

/** Baris transkrip yang dipersiapkan untuk latihan dikte. */
export interface DictationLine extends TranscriptLine {
  index: number;
  cleanText: string;
}

/** Props untuk DictationPanel. */
interface DictationPanelProps {
  dictationLines: DictationLine[];
  audioUrl?: string;
  seekToLine: (startTime: number) => void;
  speakLine: (line: TranscriptLine, index: number) => void;
}

/**
 * Panel latihan dikte.
 */
export function DictationPanel({ dictationLines, audioUrl, seekToLine, speakLine }: DictationPanelProps) {
  const [dictationIndex, setDictationIndex] = useState(0);
  const [dictationAnswer, setDictationAnswer] = useState("");
  const [dictationAttempts, setDictationAttempts] = useState<Record<string, { isPassed: boolean; accuracy: number }>>({});
  const [showDictationAnswer, setShowDictationAnswer] = useState(false);

  const dictationActiveLine = dictationLines[dictationIndex];
  const dictationAttempt = dictationActiveLine ? dictationAttempts[dictationActiveLine._key] : undefined;
  const dictationPassedCount = Object.values(dictationAttempts).filter((a) => a.isPassed).length;
  const dictationScore = dictationLines.length > 0 ? Math.round((dictationPassedCount / dictationLines.length) * 100) : 0;

  const handleCheckDictation = () => {
    if (!dictationActiveLine) return;
    const evaluation = evaluateDictation(dictationActiveLine.cleanText, dictationAnswer);
    setDictationAttempts((prev) => ({
      ...prev,
      [dictationActiveLine._key]: { isPassed: evaluation.isPassed, accuracy: evaluation.accuracy },
    }));
  };

  const handleNextDictation = () => {
    if (dictationIndex < dictationLines.length - 1) {
      const nextLine = dictationLines[dictationIndex + 1];
      setDictationIndex(dictationIndex + 1);
      setDictationAnswer("");
      setShowDictationAnswer(false);
      if (audioUrl) {
        seekToLine(nextLine.startTime);
      } else {
        speakLine(nextLine, nextLine.index);
      }
    }
  };

  // Panel selalu ter-mount (parent menyembunyikannya via CSS);
  // render kosong jika belum ada baris dikte agar aman.
  if (!dictationActiveLine) {
    return null;
  }

  return (
    <div className="w-full grid grid-cols-1 gap-6 md:grid-cols-[220px_1fr]">
{/* Left Side: Line list */}
 <div className="max-h-20 md:max-h-87.5 overflow-x-auto md:overflow-y-auto rounded-lg border border-border/80 bg-muted/5 p-2 custom-scrollbar flex flex-row md:flex-col gap-1.5 w-full">
 <div className="flex flex-row md:flex-col gap-1.5 w-full shrink-0">
 {dictationLines.map((line, index) => {
 const attempt = dictationAttempts[line._key];
 const isActive = index === dictationIndex;

 return (
 <button
 key={line._key}
 onClick={() => {
 setDictationIndex(index);
 setDictationAnswer("");
 setShowDictationAnswer(false);
 if (audioUrl) {
 seekToLine(line.startTime);
 } else {
 speakLine(line, line.index);
 }
 }}
 className={cn(
 "flex items-center justify-between gap-2 rounded-xl border p-2.5 text-left transition-all text-xs font-black uppercase tracking-wider",
 isActive
 ? "border-primary/40 bg-primary/10 text-primary"
 : "border-border/60 bg-background/40 text-muted-foreground hover:bg-muted/10 hover:text-foreground"
 )}
 >
 <span>Baris {index + 1}</span>
 {attempt ? (
 attempt.isPassed ? (
 <Check size={13} className="text-success" />
 ) : (
 <X size={13} className="text-destructive" />
 )
 ) : null}
 </button>
 );
 })}
 </div>
 </div>

 {/* Right Side: Dictation input workspace */}
 <div className="flex flex-col gap-4">
 <div className="rounded-lg border border-border/80 bg-card/35 p-5 glass relative overflow-hidden">
 <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/40">
 <div>
 <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
 Baris {dictationIndex + 1}
 </span>
 {dictationActiveLine.speaker && (
 <p className="text-xs font-bold text-primary">{dictationActiveLine.speaker}</p>
 )}
 </div>

 <Button
 variant="outline"
 size="sm"
 onClick={() => {
 if (audioUrl) {
 seekToLine(dictationActiveLine.startTime);
 } else {
 speakLine(dictationActiveLine, dictationActiveLine.index);
 }
 }}
 className="rounded-xl h-8 text-[10px] font-bold"
 >
 <VolumeUp size={12} className="mr-1" /> Putar Audio
 </Button>
 </div>

 <textarea
 value={dictationAnswer}
 onChange={(e) => setDictationAnswer(e.target.value)}
 placeholder="Ketik kalimat bahasa Jepang yang kamu dengar..."
 className="min-h-25 w-full rounded-xl border border-border/80 bg-muted/10 p-3 text-base font-japanese outline-none placeholder:text-muted-foreground/60 focus:border-primary/40 focus:ring-2 focus:ring-primary/10 resize-none"
 />

 <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
 <div className="flex items-center gap-2">
 <Button
 onClick={handleCheckDictation}
 disabled={!dictationAnswer.trim()}
 className="rounded-xl text-[10px] font-bold h-9"
 >
 Periksa Jawaban
 </Button>
 <Button
 variant="outline"
 onClick={() => setShowDictationAnswer(!showDictationAnswer)}
 className="rounded-xl text-[10px] font-bold h-9"
 >
 {showDictationAnswer ? "Sembunyikan" : "Lihat Kunci"}
 </Button>
 </div>

 {dictationIndex < dictationLines.length - 1 && (
 <Button
 variant="ghost"
 onClick={handleNextDictation}
 className="rounded-xl text-[10px] font-bold h-9 gap-1"
 >
 <span>Lanjut</span> <ChevronRight size={12} />
 </Button>
 )}
 </div>

 {/* Score & evaluation details */}
 <AnimatePresence>
 {dictationAttempt && (
 <m.div
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0 }}
 className="mt-4 p-3 rounded-xl border border-border/80 bg-muted/5 flex items-center justify-between gap-3"
 >
 <div className="flex items-center gap-2">
 {dictationAttempt.isPassed ? (
 <Check size={16} className="text-success" />
 ) : (
 <X size={16} className="text-destructive" />
 )}
 <span className="text-xs font-bold">
 {dictationAttempt.isPassed ? "Sangat Akurat!" : "Butuh Koreksi"}
 </span>
 </div>
 <span className="text-xs font-mono font-bold text-muted-foreground">
 Akurasi: {dictationAttempt.accuracy}%
 </span>
 </m.div>
 )}
 </AnimatePresence>

 {showDictationAnswer && (
 <m.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 className="mt-4 p-3 rounded-xl bg-primary/5 border border-primary/20 text-xs font-japanese font-medium text-primary leading-relaxed"
 >
 Kunci: {dictationActiveLine.cleanText}
 </m.div>
 )}
 </div>

 {/* Dictation Analytics */}
 <div className="rounded-lg border border-border/80 bg-muted/5 p-4 flex justify-between items-center">
 <div>
 <span className="text-[8px] font-black uppercase tracking-wider text-muted-foreground">Progres Dikte</span>
 <p className="text-base font-black">{dictationPassedCount} / {dictationLines.length} Selesai</p>
 </div>
 <div className="text-right">
 <span className="text-[8px] font-black uppercase tracking-wider text-muted-foreground">Nilai Akurasi</span>
 <p className="text-base font-black text-primary">{dictationScore}%</p>
 </div>
 </div>
 </div>
    </div>
  );
}
