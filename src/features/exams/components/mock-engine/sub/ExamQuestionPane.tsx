"use client";

import React, { memo } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
 Volume2,
 CheckCircle,
 Flag,
 ArrowLeft,
 ArrowRight,
} from "@/components/ui/icons";
import { ExamChoice, ExamPassage } from "../types";
import { sanitizeHtml } from "@/lib/sanitize";
import { ExamQuestionText } from "../ExamQuestionText";
import { useExamSession } from "../ExamSessionContext";
import { ExamMobileNavigator } from "./ExamSidebar";

/**
 * Get standard Japanese exam instruction for specific mondai.
 */
const getMondaiInstruction = (section: string, mondaiNumber: number | null | undefined): string | null => {
 if (!mondaiNumber) return null;
 if (section === "vocabulary") {
 switch (mondaiNumber) {
 case 1: return "［　］の言葉 diucapkan dengan cara apa? Pilih 1, 2, 3, atau 4.";
 case 2: return "［　］kata ditulis dengan kanji apa? Pilih 1, 2, 3, atau 4.";
 case 3: return "Pilih kata paling cocok untuk mengisi (　) dari 1, 2, 3, atau 4.";
 case 4: return "Pilih kata dengan arti paling dekat dengan ［　］ dari 1, 2, 3, atau 4.";
 case 5: return "Pilih penggunaan kata paling tepat dari 1, 2, 3, atau 4.";
 default: return "Pilih jawaban paling tepat dari 1, 2, 3, atau 4.";
 }
 }
 if (section === "grammar") {
 switch (mondaiNumber) {
 case 1: return "Pilih kata paling cocok untuk mengisi (　) dari 1, 2, 3, atau 4.";
 case 2: return "Pilih kata paling cocok untuk mengisi ★ dari 1, 2, 3, atau 4.";
 case 3: return "Pilih kata paling cocok untuk mengisi bagian kosong dari 1, 2, 3, atau 4.";
 default: return "Pilih jawaban paling tepat dari 1, 2, 3, atau 4.";
 }
 }
 if (section === "reading") {
 switch (mondaiNumber) {
 case 1:
 case 2:
 case 3:
 case 4:
 case 5:
 case 6:
 return "Pilih jawaban paling tepat untuk pertanyaan bacaan dari 1, 2, 3, atau 4.";
 default: return "Pilih jawaban paling tepat untuk pertanyaan dari 1, 2, 3, atau 4.";
 }
 }
 if (section === "listening") {
 switch (mondaiNumber) {
 case 1: return "Dengarkan pertanyaan, pilih jawaban paling tepat dari 1, 2, 3, atau 4.";
 case 2: return "Dengarkan pertanyaan dahulu. Lalu dengarkan cerita, pilih jawaban paling tepat.";
 case 3: return "Lihat gambar sambil mendengarkan pertanyaan. Apa yang dikatakan orang bertanda panah? Pilih jawaban paling tepat.";
 case 4: return "Dengarkan kalimat, pilih respon paling tepat dari 1, 2, atau 3.";
 default: return "Dengarkan pertanyaan, pilih jawaban paling tepat.";
 }
 }
 return null;
};

/**
 * Option button component.
 */
const OptionButton = memo(({
 idx,
 text,
 choice,
 isSelected,
 onSelect
}: {
 idx: number;
 text: string;
 choice?: ExamChoice;
 isSelected: boolean;
 onSelect: (idx: number) => void;
}) => {
 return (
 <button
 type="button"
 onClick={() => onSelect(idx)}
 className={`p-4 rounded-xl text-left transition-all font-medium flex items-center gap-4 border [&_rt]:text-[0.55em] [&_rt]:leading-none ${
 isSelected
 ? "bg-destructive/10 border-destructive text-destructive shadow-[0_0_12px_hsl(var(--destructive)/0.1)]"
 : "bg-card border-border text-muted-foreground hover:border-destructive/30"
 }`}
 >
 <div
 className={`font-mono text-xs font-bold h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
 isSelected ? "bg-destructive text-destructive-foreground" : "bg-muted text-muted-foreground"
 }`}
 >
 {idx + 1}
 </div>
 {choice?.type === "image" ? (
 <span className="flex min-w-0 flex-1 flex-col gap-3">
 <span className="relative block aspect-video w-full overflow-hidden rounded-xl border border-border bg-muted/40">
 <Image
 src={choice.value}
 alt={choice.alt || text}
 fill
 sizes="(max-width: 768px) 70vw, 520px"
 className="object-contain"
 />
 </span>
 <span className="leading-tight font-japanese text-sm md:text-base">
 {choice.alt || text}
 </span>
 </span>
 ) : (
 <span 
 className="leading-tight font-japanese text-base md:text-lg flex-1 [&_rt]:text-[0.55em] [&_rt]:leading-none"
 dangerouslySetInnerHTML={{ __html: sanitizeHtml(choice?.type === "text" ? choice.value : text) }}
 />
 )}
 {isSelected && (
 <CheckCircle size={16} aria-hidden="true" className="text-destructive shrink-0" />
 )}
 </button>
 );
});

OptionButton.displayName = "OptionButton";

/**
 * Reading passage block component.
 */
function ExamPassageBlock({ passage }: { passage?: ExamPassage | null }) {
 if (!passage) return null;
 const hasContent = Boolean(passage.contentHtml || passage.visualUrl);
 if (!hasContent) return null;

 return (
 <div className="mb-8 rounded-lg border border-border bg-muted/20 p-4 md:p-5 [&_rt]:text-[0.55em] [&_rt]:leading-none">
 {passage.visualUrl && (
 <div className="mb-5 overflow-hidden rounded-xl border border-border bg-background/60">
 <Image
 src={passage.visualUrl}
 alt="Passage visual"
 width={900}
 height={500}
 sizes="(max-width: 1024px) 100vw, 900px"
 className="max-h-105 w-full object-contain"
 />
 </div>
 )}

 {passage.contentHtml && (
 <div
 className="prose-custom font-japanese text-base leading-relaxed text-foreground md:text-lg"
 dangerouslySetInnerHTML={{ __html: sanitizeHtml(passage.contentHtml) }}
 />
 )}
 </div>
 );
}

/**
 * Main Question Pane layout component.
 */
export function ExamQuestionPane() {
 const {
 exam,
 activeQuestion,
 currentQuestionIndex,
 currentSection,
 isCurrentlyListening,
 audioStatus,
 handlePlayAudio,
 answers,
 handleAnswer,
 disablePreviousButton,
 prevQuestion,
 nextQuestion,
 flaggedQuestions,
 toggleFlag,
 } = useExamSession();

 if (!activeQuestion) return null;

 const isCurrentFlagged = flaggedQuestions[activeQuestion._key] || false;

 return (
 <main className="lg:col-span-3 space-y-6">
 <div className="space-y-6">
 {/* Mondai Instruction Banner */}
 {activeQuestion.mondaiNumber && (
 <div className="bg-muted/30 border border-border rounded-lg p-4 flex items-start gap-3 glass">
 <div className="bg-destructive/10 text-destructive font-black text-[10px] px-2.5 py-1 rounded-lg uppercase tracking-wider shrink-0">
 問題 {activeQuestion.mondaiNumber}
 </div>
 <div className="text-xs font-semibold text-foreground/80 leading-normal font-japanese">
 {getMondaiInstruction(currentSection, activeQuestion.mondaiNumber)}
 </div>
 </div>
 )}

 {/* Audio Player Soal */}
 {isCurrentlyListening && (
 <div className="bg-card border border-border rounded-lg p-4 flex items-center gap-4 shadow-sm glass">
 <Button
 onClick={handlePlayAudio}
 disabled={
 exam.choukaiAudioUrl
 ? (audioStatus.global === "playing" || audioStatus.global === "played")
 : (audioStatus[activeQuestion._key] === "playing" || audioStatus[activeQuestion._key] === "played")
 }
 size="sm"
 className={`w-10 h-10 rounded-full shrink-0 ${
 (!exam.choukaiAudioUrl && (!audioStatus[activeQuestion._key] || audioStatus[activeQuestion._key] === "idle")) ||
 (exam.choukaiAudioUrl && (!audioStatus.global || audioStatus.global === "idle"))
 ? "bg-destructive text-destructive-foreground shadow-md hover:shadow-destructive/20 hover:scale-105 transition-all"
 : "bg-muted text-muted-foreground cursor-not-allowed"
 }`}
 aria-label="Putar Audio Choukai"
 >
 <Volume2
 size={18}
 aria-hidden="true"
 className={
 (exam.choukaiAudioUrl ? audioStatus.global === "playing" : audioStatus[activeQuestion._key] === "playing")
 ? "animate-pulse"
 : ""
 }
 />
 </Button>
 <div className="flex-1">
 <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">
 {exam.choukaiAudioUrl ? "Audio Sesi (Global)" : "Audio Per Soal"}
 </p>
 <p className="text-[10px] text-muted-foreground italic leading-tight">
 {exam.choukaiAudioUrl
 ? "Audio sesi global hanya dapat diputar SATU kali secara penuh."
 : "Audio soal ini hanya dapat diputar SATU kali."}
 </p>
 </div>
 </div>
 )}

 {/* Kartu Utama Soal */}
 <div className="bg-card border border-border rounded-xl p-6 md:p-8 shadow-sm glass">
 <div className="flex items-start justify-between gap-4 mb-6">
 <div className="px-3 py-1 bg-muted dark:bg-[hsl(var(--background)/0.1)] rounded-lg text-[10px] font-mono font-bold text-muted-foreground">
 SOAL {currentQuestionIndex + 1}
 </div>

 <Button
 type="button"
 variant="ghost"
 size="sm"
 onClick={() => toggleFlag(activeQuestion._key)}
 className={`text-xs gap-1.5 rounded-lg border transition-all ${
 isCurrentFlagged
 ? "bg-warning/10 text-warning border-warning/30 hover:bg-warning/20"
 : "text-muted-foreground border-border hover:bg-muted"
 }`}
 >
 <Flag size={14} className={isCurrentFlagged ? "fill-warning" : ""} />
 {isCurrentFlagged ? "Tersimpan Ragu" : "Tandai Ragu"}
 </Button>
 </div>

 <ExamPassageBlock passage={activeQuestion.passage} />

 {activeQuestion.imageUrl && (
 <div className="mb-8 rounded-lg overflow-hidden border border-border bg-muted/30">
 <Image
 src={activeQuestion.imageUrl}
 alt="Question Visual"
 width={800}
 height={400}
 className="w-full h-auto object-contain"
 />
 </div>
 )}

 <ExamQuestionText
 questionText={activeQuestion.questionText}
 className="text-lg md:text-xl font-medium leading-relaxed mb-8 text-foreground font-japanese [&_rt]:text-[0.55em] [&_rt]:leading-none"
 />

 <div className="grid grid-cols-1 gap-3">
 {activeQuestion.options.map((opt, idx) => (
 <OptionButton
 key={`${opt}-${idx}`}
 idx={idx}
 text={opt}
 choice={activeQuestion.choices?.[idx]}
 isSelected={answers[activeQuestion._key] === idx}
 onSelect={handleAnswer}
 />
 ))}
 </div>
 </div>

 {/* Tombol Navigasi Bawah (Sebelumnya / Selanjutnya) */}
 <div className="flex items-center justify-between gap-4 pt-2">
 <Button
 onClick={prevQuestion}
 disabled={disablePreviousButton || currentQuestionIndex === 0}
 variant="outline"
 className="gap-2 text-xs font-bold py-2.5 rounded-xl border-border hover:bg-muted"
 >
 <ArrowLeft size={16} /> Soal Sebelumnya
 </Button>

 <Button
 onClick={nextQuestion}
 disabled={currentQuestionIndex === exam.questions.length - 1}
 className="gap-2 text-xs font-bold py-2.5 rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm"
 >
 Soal Selanjutnya <ArrowRight size={16} />
 </Button>
 </div>

 {/* Mobile Navigator */}
 <ExamMobileNavigator />
 </div>
 </main>
 );
}
