"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, HelpCircle, RefreshCcw, Sparkles, Target, X } from "@/components/ui/icons";
import {
 getParticleQuestion,
 isParticleAnswerCorrect,
 PARTICLE_OPTIONS,
 PARTICLE_QUESTIONS,
 type ParticleOption,
} from "@/lib/particle-trainer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn, shuffleArray } from "@/lib/utils";

import { ROUTES } from "@/lib/core/routes";
/**
 * Interactive Japanese particle training interface.
 * Handles quiz state, scoring, progress tracking, and feedback.
 */
export default function ParticleTrainerClient() {
 const [questionIndex, setQuestionIndex] = useState(0);
 const [selectedParticle, setSelectedParticle] = useState<ParticleOption | null>(null);
 const [showHint, setShowHint] = useState(false);
 const [score, setScore] = useState({ correct: 0, total: 0 });
 const [answeredIds, setAnsweredIds] = useState<Set<string>>(() => new Set());

 // Get current question data
 const question = getParticleQuestion(questionIndex);
 const isAnswered = selectedParticle !== null;
 const isCorrect = selectedParticle
 ? isParticleAnswerCorrect(question.answer, selectedParticle)
 : false;
 const progressPercent = Math.round((answeredIds.size / PARTICLE_QUESTIONS.length) * 100);

 const optionList = useMemo(() => {
 const extras = PARTICLE_OPTIONS.filter((item) => !question.options.includes(item)).slice(0, 2);
 const combined = Array.from(new Set([...question.options, ...extras])).slice(0, 6);
 return shuffleArray(combined);
 }, [question]);

 /**
 * Handle user answer selection.
 * Updates score and progress.
 * 
 * @param particle - Selected particle option
 */
 const handleSelect = (particle: ParticleOption) => {
 if (isAnswered) return;
 const correct = isParticleAnswerCorrect(question.answer, particle);
 setSelectedParticle(particle);
 setScore((prev) => ({
 correct: prev.correct + (correct ? 1 : 0),
 total: prev.total + 1,
 }));
 setAnsweredIds((prev) => new Set(prev).add(question.id));
 };

 /**
 * Advance to next question.
 * Reset answer state.
 */
 const handleNext = () => {
 setQuestionIndex((prev) => (prev + 1) % PARTICLE_QUESTIONS.length);
 setSelectedParticle(null);
 setShowHint(false);
 };

 /**
 * Reset all progress and score.
 */
 const handleReset = () => {
 setQuestionIndex(0);
 setSelectedParticle(null);
 setShowHint(false);
 setScore({ correct: 0, total: 0 });
 setAnsweredIds(new Set());
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
 <div className="flex size-12 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
 <Target size={24} aria-hidden="true" />
 </div>
 <Badge className="w-fit rounded-xl px-3 py-1">Particle Trainer</Badge>
 </div>
 <h1 className="max-w-3xl text-4xl uppercase tracking-tight text-foreground md:text-6xl">
 Latihan Partikel
 </h1>
 <p className="max-w-2xl text-sm font-medium leading-relaxed text-muted-foreground">
 Pilih partikel yang tepat untuk kalimat rumpang dan lihat alasan singkatnya setelah menjawab.
 </p>
 </div>
 </header>

 <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
 <Card className="rounded-2xl md:rounded-3xl border border-border bg-card/45 p-5 shadow-2xl md:p-8">
 <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
 <div>
 <Badge variant="outline" className="mb-3 rounded-xl">
 {question.level} · Soal {questionIndex + 1}/{PARTICLE_QUESTIONS.length}
 </Badge>
 <p className="font-japanese text-3xl font-black leading-relaxed text-foreground md:text-5xl">
 {/* Split sentence by placeholder to insert selected particle or question mark */}
 {question.sentence.split("___").map((part, index) => (
 <span key={`${question.id}-${index}`}>
 {part}
 {index === 0 ? (
 <span className="mx-2 inline-flex min-w-16 items-center justify-center rounded-lg border border-dashed border-primary/40 bg-primary/10 px-4 py-1 text-primary">
 {selectedParticle || "?"}
 </span>
 ) : null}
 </span>
 ))}
 </p>
 </div>
 <div className="rounded-lg border border-border bg-muted/15 p-4">
 <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
 Akurasi
 </p>
 <p className="font-mono text-2xl font-black text-foreground">
 {score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0}%
 </p>
 </div>
 </div>

 <div className="flex flex-wrap items-center justify-center gap-3">
 {optionList.map((particle) => {
 const isSelected = selectedParticle === particle;
 const isAnswer = question.answer === particle;
 return (
 <button
 key={particle}
 type="button"
 onClick={() => handleSelect(particle)}
 disabled={isAnswered}
 className={cn(
 "rounded-lg border p-5 font-japanese text-3xl font-black transition-all",
 !isAnswered && "border-border bg-background/45 hover:border-primary/40 hover:bg-primary/10",
 isAnswered && isAnswer && "border-success/35 bg-success/10 text-success",
 isAnswered && isSelected && !isAnswer && "border-destructive/35 bg-destructive/10 text-destructive",
 isAnswered && !isSelected && !isAnswer && "border-border bg-muted/10 text-muted-foreground/45"
 )}
 >
 {particle}
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
 <RefreshCcw data-icon="inline-start" />
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
 <h2 className="text-xs uppercase tracking-[0.2em] text-foreground">
 Feedback
 </h2>
 </div>
 {isAnswered ? (
 <div
 className={cn(
 "rounded-lg border p-5",
 isCorrect
 ? "border-success/25 bg-success/10 text-success"
 : "border-warning/25 bg-warning/10 text-warning"
 )}
 >
 <div className="flex items-center gap-2">
 {isCorrect ? <Check size={18} /> : <X size={18} />}
 <span className="text-xs font-black uppercase tracking-widest">
 {isCorrect ? "Benar" : "Coba ingat lagi"}
 </span>
 </div>
 <p className="mt-3 font-japanese text-2xl font-black text-foreground">
 Jawaban: {question.answer}
 </p>
 <p className="mt-2 text-sm font-medium leading-relaxed text-muted-foreground">
 {question.explanation}
 </p>
 </div>
 ) : (
 <p className="rounded-lg border border-dashed border-border bg-muted/15 p-5 text-sm font-medium text-muted-foreground">
 Jawab dulu untuk melihat penjelasan.
 </p>
 )}
 {(showHint || isAnswered) && (
 <p className="mt-4 rounded-lg border border-primary/20 bg-primary/10 p-4 text-sm font-bold text-primary">
 {question.hint}
 </p>
 )}
 <p className="mt-4 text-sm font-medium italic leading-relaxed text-muted-foreground">
 {question.translation}
 </p>
 </Card>

 <Card className="rounded-2xl md:rounded-3xl border border-border bg-muted/15 p-5">
 <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
 Progress Set
 </p>
 <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
 <div
 className="h-full rounded-full bg-primary transition-all"
 style={{ width: `${progressPercent}%` }}
 />
 </div>
 <p className="mt-3 font-mono text-2xl font-black text-foreground">
 {answeredIds.size}/{PARTICLE_QUESTIONS.length}
 </p>
 </Card>
 </div>
 </div>
 </div>
 </div>
 );
}