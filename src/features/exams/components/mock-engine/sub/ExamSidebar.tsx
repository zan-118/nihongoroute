"use client";

import React from "react";
import { Lock as LockIcon, AlertTriangle } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { SECTION_LABELS } from "../constants";
import { ExamCountdown } from "../ExamCountdown";
import { useExamSession } from "../ExamSessionContext";

/**
 * Sidebar Navigasi Soal CBT (Desktop & Mobile Navigator).
 */
export function ExamSidebar() {
 const {
 exam,
 examEndAt,
 finishExam,
 activeSectionIndex,
 availableSections,
 setPendingConfirm,
 currentSection,
 sections,
 currentQuestionIndex,
 answers,
 flaggedQuestions,
 goToQuestion,
 isSubmittingSession,
 } = useExamSession();

 const isLastSection = activeSectionIndex === availableSections.length - 1;

 return (
 <aside className="hidden lg:block lg:col-span-1 lg:sticky lg:top-24 space-y-6">
 {/* Timer Card */}
 <ExamCountdown
 endAt={examEndAt}
 timeLimitSeconds={exam.timeLimit * 60}
 onExpire={finishExam}
 variant="card"
 />

 {/* Grid Navigasi Nomor Soal */}
 <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4 glass">
 <div className="flex items-center justify-between">
 <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
 Navigasi Soal
 </span>
 <span className="text-[10px] font-mono font-bold text-destructive">
 {Object.keys(answers).length} / {exam.questions.length} Dijawab
 </span>
 </div>

 <div className="grid grid-cols-5 gap-2 max-h-80 overflow-y-auto p-1 custom-scrollbar">
 {exam.questions.map((q, idx) => {
 const isAnswered = answers[q._key] !== undefined;
 const isFlagged = flaggedQuestions[q._key];
 const isActive = idx === currentQuestionIndex;
 const qSection = q.section || "vocabulary";

 // Kunci jika soal berasal dari bagian sebelumnya atau menyimak non-global
 const qSecIdx = availableSections.indexOf(qSection);
 const isLocked =
 qSecIdx < activeSectionIndex ||
 (currentSection === "listening" && !exam.choukaiAudioUrl && idx !== currentQuestionIndex);

 let btnClass = "bg-background text-muted-foreground border-border hover:border-destructive/30";
 if (isActive) {
 btnClass = "bg-destructive text-destructive-foreground border-transparent shadow-md scale-105";
 } else if (isLocked) {
 btnClass = "bg-transparent text-muted-foreground/30 border-border/50 cursor-not-allowed";
 } else if (isFlagged) {
 btnClass = "bg-warning/20 text-warning border-warning/30 font-bold";
 } else if (isAnswered) {
 btnClass = "bg-success/10 text-success border-success/20 font-bold";
 }

 return (
 <button
 type="button"
 key={q._key}
 disabled={isLocked}
 onClick={() => !isLocked && goToQuestion(idx)}
 className={`h-9 rounded-lg flex items-center justify-center text-xs font-mono font-bold transition-all border ${btnClass}`}
 aria-label={`Ke Soal Nomor ${idx + 1}`}
 >
 {isLocked ? <LockIcon size={12} aria-hidden="true" /> : idx + 1}
 </button>
 );
 })}
 </div>

 {/* Tombol Pindah Seksi / Selesaikan Ujian */}
 <div className="pt-2">
 {!isLastSection ? (
 <Button
 onClick={() => setPendingConfirm("section")}
 className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90 text-xs font-bold py-2.5 rounded-lg shadow-sm transition-all"
 >
 Lanjut ke Seksi Berikutnya
 </Button>
 ) : (
 <Button
 onClick={() => setPendingConfirm("finish")}
 disabled={isSubmittingSession}
 className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 rounded-lg shadow-sm transition-all"
 >
 {isSubmittingSession ? "Mengirim Jawaban..." : "Selesaikan & Kumpulkan Ujian"}
 </Button>
 )}
 </div>
 </div>
 </aside>
 );
}

/**
 * Navigator Kompak untuk Tampilan Seluler (Mobile).
 */
export function ExamMobileNavigator() {
 const {
 exam,
 currentSection,
 sections,
 currentQuestionIndex,
 answers,
 flaggedQuestions,
 goToQuestion,
 } = useExamSession();

 return (
 <div className="bg-card border border-border rounded-lg p-4 lg:hidden glass">
 <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4">
 NAVIGASI {SECTION_LABELS[currentSection]?.split(" ")[0] || currentSection}
 </p>
 <div className="flex flex-wrap gap-2">
 {sections[currentSection]?.map((qIdx) => {
 const q = exam.questions[qIdx];
 const isAnswered = answers[q._key] !== undefined;
 const isFlagged = flaggedQuestions[q._key];
 const isActive = qIdx === currentQuestionIndex;
 const isLocked =
 currentSection === "listening" && !exam.choukaiAudioUrl && qIdx !== currentQuestionIndex;

 let btnClass = "bg-background text-muted-foreground border-border";
 if (isActive) {
 btnClass = "bg-destructive text-destructive-foreground border-transparent shadow-md scale-105";
 } else if (isLocked) {
 btnClass = "bg-transparent text-muted-foreground/30 border-border/50 cursor-not-allowed";
 } else if (isFlagged) {
 btnClass = "bg-warning/20 text-warning border-warning/30";
 } else if (isAnswered) {
 btnClass = "bg-success/10 text-success border-success/20";
 }

 return (
 <button
 type="button"
 key={qIdx}
 disabled={isLocked}
 onClick={() => !isLocked && goToQuestion(qIdx)}
 className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-mono font-bold transition-all border ${btnClass}`}
 aria-label={`Pindah ke Soal Nomor ${qIdx + 1}`}
 >
 {isLocked ? <LockIcon size={10} aria-hidden="true" /> : qIdx + 1}
 </button>
 );
 })}
 </div>
 </div>
 );
}
