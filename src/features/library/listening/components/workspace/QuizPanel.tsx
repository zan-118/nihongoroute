"use client";

/**
 * @file QuizPanel.tsx
 * @description Panel kuis pemahaman: pilihan ganda, evaluasi jawaban, penjelasan, dan hasil akhir.
 */

import { useState } from "react";
import { m } from "framer-motion";
import { Check, X } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { QuizItem } from "../../types";

/** Props untuk QuizPanel. */
interface QuizPanelProps {
  quiz: QuizItem[];
  /** Callback ketika kuis diselesaikan, mengembalikan skor akhir. */
  onQuizComplete: (score: number) => void;
}

/**
 * Panel kuis pemahaman.
 */
export function QuizPanel({ quiz, onQuizComplete }: QuizPanelProps) {
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  const handleSubmitQuiz = () => {
    if (quizSubmitted) return;
    let correct = 0;
    quiz.forEach((q) => {
      const selected = quizAnswers[q._id];
      const option = q.options.find((o) => o.text === selected);
      if (option?.isCorrect) correct++;
    });
    setQuizScore(correct);
    setQuizSubmitted(true);
    onQuizComplete(correct);
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-6">
{quiz.map((item, index) => {
 const selected = quizAnswers[item._id];

 return (
 <Card key={item._id} className="p-6 border border-border bg-card/30 glass relative overflow-hidden">
 <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em] mb-2 block">
 Pertanyaan {index + 1}
 </span>
 <p className="text-base font-bold text-foreground mb-4 leading-relaxed">{item.question}</p>

 <div className="flex flex-col gap-2">
 {item.options.map((opt) => {
 const isSelected = selected === opt.text;
 const isCorrectOpt = opt.isCorrect;

 let optStyle = "border-border bg-background/50 text-foreground hover:bg-muted/10";
 if (isSelected) {
 optStyle = "border-primary bg-primary/10 text-primary font-bold";
 }
 if (quizSubmitted) {
 if (isCorrectOpt) {
 optStyle = "border-success bg-success/15 text-success font-bold";
 } else if (isSelected) {
 optStyle = "border-destructive bg-destructive/15 text-destructive font-bold";
 }
 }

 return (
 <button
 key={opt.text}
 disabled={quizSubmitted}
 onClick={() => setQuizAnswers((prev) => ({ ...prev, [item._id]: opt.text }))}
 className={cn("w-full border p-3 rounded-xl text-left text-sm transition-all flex justify-between items-center", optStyle)}
 >
 <span>{opt.text}</span>
 {quizSubmitted && isCorrectOpt && <Check size={14} className="text-success shrink-0" />}
 {quizSubmitted && isSelected && !isCorrectOpt && <X size={14} className="text-destructive shrink-0" />}
 </button>
 );
 })}
 </div>

 {quizSubmitted && item.explanation && (
 <m.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 className="mt-4 p-3 rounded-xl bg-muted/10 text-xs text-muted-foreground leading-relaxed border border-border/60"
 >
 <strong>Penjelasan:</strong> {item.explanation}
 </m.div>
 )}
 </Card>
 );
 })}

 {!quizSubmitted ? (
 <Button onClick={handleSubmitQuiz} className="rounded-xl w-full py-4 font-black tracking-wider text-xs uppercase shadow-md shadow-primary/20">
 Kirim Jawaban Kuis
 </Button>
 ) : (
 <div className="p-5 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-between">
 <div>
 <span className="text-[9px] font-black uppercase text-primary tracking-widest block">Evaluasi Ujian</span>
 <p className="text-base font-black text-foreground">Hasil kuis: {quizScore} / {quiz.length} Benar</p>
 </div>
 <Button variant="outline" size="sm" onClick={() => { setQuizAnswers({}); setQuizSubmitted(false); }} className="rounded-xl text-[10px] font-black uppercase">
 Ulangi Kuis
 </Button>
 </div>
 )}
    </div>
  );
}
