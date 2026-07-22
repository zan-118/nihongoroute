/**
 * @file ExamPlaying.tsx
 * @description Komponen antarmuka utama saat pengguna sedang mengerjakan simulasi ujian (Mock Exam).
 * Menyediakan tata letak 2-kolom modern (CBT standard) dengan sticky sidebar untuk pemantauan status & navigasi soal.
 */

// ======================
// IMPOR
// ======================
import { memo, useMemo } from "react";
import { m, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  ArrowLeft,
  Volume2,
  CheckCircle,
  Loader2,
  Lock as LockIcon,
  Flag,
  AlertTriangle,
} from "@/components/ui/icons";
import ConfirmModal from "@/components/ui/ConfirmModal";
import {
  ExamData,
  ExamQuestion,
  AudioState,
  PendingConfirmType,
  ExamChoice,
  ExamPassage,
} from "./types";
import { SECTION_LABELS } from "./constants";
import { sanitizeHtml } from "@/lib/sanitize";
import { toast } from "sonner";
import { ExamQuestionText } from "./ExamQuestionText";
import { ExamCountdown } from "./ExamCountdown";

// ======================
// ANTARMUKA & TIPE
// ======================
/**
 * Props for ExamPlaying component.
 */
interface ExamPlayingProps {
  /** Exam data object containing questions and metadata */
  exam: ExamData;
  /** Currently active question object */
  activeQuestion: ExamQuestion;
  /** Index of active question in exam array */
  currentQuestionIndex: number;
  /** Stable timestamp (ms) when the exam ends. Does not change every second. */
  examEndAt: number;
  /** Called once when the countdown reaches zero. */
  onExpire: () => void;
  /** Map of question keys to selected choice indices */
  answers: Record<string, number>;
  /** Map of question keys or global key to audio playback states */
  audioStatus: Record<string, AudioState>;
  /** Reference to HTML audio element */
  audioRef: React.MutableRefObject<HTMLAudioElement | null>;
  /** Flag indicating current question has audio */
  isCurrentlyListening: boolean;
  /** Flag to disable previous navigation button */
  disablePreviousButton: boolean;
  /** Trigger audio playback */
  handlePlayAudio: () => void;
  /** Save selected answer index for active question */
  handleAnswer: (idx: number) => void;
  /** Navigate to next question */
  nextQuestion: () => void;
  /** Navigate to previous question */
  prevQuestion: () => void;
  /** Map of section keys to question index arrays */
  sections: Record<string, number[]>;
  /** List of available section keys */
  availableSections: string[];
  /** Current active section key */
  currentSection: string;
  /** Navigate directly to specific question index */
  goToQuestion: (idx: number) => void;
  /** Index of active section in available sections */
  activeSectionIndex: number;
  /** Current pending confirmation modal state */
  pendingConfirm: PendingConfirmType;
  /** Set pending confirmation modal state */
  setPendingConfirm: (v: PendingConfirmType) => void;
  /** Execute action after confirmation */
  confirmPendingAction: () => void;
  /** Label data for pending confirmation modal */
  pendingConfirmLabel: { title: string; description: string } | null;
  /** Flag indicating submission request in progress */
  isSubmitting?: boolean;
  /** Map of question keys to flagged status */
  flaggedQuestions: Record<string, boolean>;
  /** Toggle flagged status for question key */
  toggleFlag: (key: string) => void;
}

// ======================
// FUNGSI PEMBANTU
// ======================
/**
 * Get standard Japanese exam instruction for specific mondai.
 * @param section Exam section key.
 * @param mondaiNumber Mondai number.
 * @returns Instruction text or null.
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

// ======================
// KOMPONEN PEMBANTU
// ======================
/**
 * Memoized option button component. Render choice text or image.
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
          ? "bg-destructive/10 border-destructive text-destructive shadow-[0_0_12px_rgba(var(--destructive-rgb),0.1)]"
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
      {/* Choice is image. Render Next.js Image component. */}
      {choice?.type === "image" ? (
        <span className="flex min-w-0 flex-1 flex-col gap-3">
          <span className="relative block aspect-[16/9] w-full overflow-hidden rounded-xl border border-border bg-muted/40">
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
        /* Render HTML content safely. Furigana support. */
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
 * Render reading passage text or image.
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
    </div>
  );
}

// ======================
// EKSEKUSI UTAMA
// ======================
/**
 * Main exam interface component. Handle layout, timer, navigation, and submission.
 */
export function ExamPlaying({
  exam,
  activeQuestion,
  currentQuestionIndex,
  examEndAt,
  onExpire,
  answers,
  audioStatus,
  audioRef,
  isCurrentlyListening,
  disablePreviousButton,
  handlePlayAudio,
  handleAnswer,
  nextQuestion,
  prevQuestion,
  sections,
  availableSections,
  currentSection,
  goToQuestion,
  activeSectionIndex,
  pendingConfirm,
  setPendingConfirm,
  confirmPendingAction,
  pendingConfirmLabel,
  isSubmitting = false,
  flaggedQuestions,
  toggleFlag,
}: ExamPlayingProps) {
  if (!activeQuestion) return null;

  const isCurrentFlagged = flaggedQuestions[activeQuestion._key] || false;

  return (
    <div className="fixed inset-0 z-[100] bg-background text-foreground overflow-y-auto pb-32 font-sans selection:bg-destructive/30">
      <audio aria-label="Audio" ref={audioRef} className="hidden" />
      
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Sticky Header Navigasi Seksi */}
        <header className="sticky top-0 z-50 pt-6 pb-4 bg-background/80 ">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar flex-1">
                {availableSections.map((section, idx) => {
                  /* Lock previous sections. Prevent user return. */
                  const isLocked = idx < activeSectionIndex;
                  const isActive = currentSection === section;
                  return (
                    <button
                      type="button"
                      key={section}
                      disabled={isLocked}
                      onClick={() => !isLocked && goToQuestion(sections[section][0])}
                      className={`whitespace-nowrap px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border ${
                        isActive
                          ? "bg-destructive text-destructive-foreground border-transparent shadow-sm"
                          : isLocked
                            ? "bg-transparent text-muted-foreground/30 border-border/50 cursor-not-allowed"
                            : "bg-background border-border hover:border-destructive/30"
                      }`}
                    >
                      {isLocked && <LockIcon size={10} className="inline mr-1" />}
                      {SECTION_LABELS[section].split(" ")[0]}
                    </button>
                  );
                })}
              </div>

              {/* Timer Mobile */}
              <ExamCountdown
                endAt={examEndAt}
                timeLimitSeconds={exam.timeLimit * 60}
                onExpire={onExpire}
                variant="compact"
              />
            </div>
          </div>
        </header>

        {/* Tata Letak Utama Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8 items-start my-6">
          
          {/* Kolom Soal (Kiri) */}
          <main className="lg:col-span-3 space-y-6">
            <AnimatePresence mode="wait">
              <m.div
                key={activeQuestion._key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="space-y-6">
                  {/* Mondai Instruction Header Banner */}
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
                        /* Check global or per-question audio state. Disable button if played. */
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

                  {/* Kartu Soal */}
                  <div className="bg-card border border-border rounded-xl p-6 md:p-8 shadow-sm glass">
                    <div className="flex items-start justify-between gap-4 mb-6">
                      <div className="px-3 py-1 bg-muted dark:bg-[rgb(var(--background-rgb)/0.1)] rounded-lg text-[10px] font-mono font-bold text-muted-foreground">
                        SOAL {currentQuestionIndex + 1}
                      </div>
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

                  {/* Navigator untuk Mobile */}
                  <div className="bg-card border border-border rounded-lg p-4 lg:hidden glass">
                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4">
                      NAVIGASI {SECTION_LABELS[currentSection].split(" ")[0]}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {sections[currentSection]?.map((qIdx) => {
                        const q = exam.questions[qIdx];
                        const isAnswered = answers[q._key] !== undefined;
                        const isFlagged = flaggedQuestions[q._key];
                        const isActive = qIdx === currentQuestionIndex;
                        const isLocked = currentSection === "listening" && !exam.choukaiAudioUrl && qIdx !== currentQuestionIndex;

                        /* Determine button style based on state (active, locked, flagged, answered). */
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
                </div>
              </m.div>
            </AnimatePresence>
          </main>

          {/* Sidebar CBT untuk Desktop (Kanan) */}
          <aside className="hidden lg:block lg:col-span-1 lg:sticky lg:top-24 space-y-6">
            
            {/* Timer Card */}
            <ExamCountdown
              endAt={examEndAt}
              timeLimitSeconds={exam.timeLimit * 60}
              onExpire={onExpire}
              variant="card"
            />

            {/* Statistik Jawaban */}
            <div className="bg-card border border-border rounded-lg p-5 shadow-sm glass">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Dijawab</p>
                  <p className="text-xl font-black font-mono text-foreground mt-2">
                    {Object.keys(answers).length} <span className="text-xs text-muted-foreground/50">/ {exam.questions.length}</span>
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Ragu-ragu</p>
                  <p className="text-xl font-black font-mono text-warning mt-2">
                    {Object.keys(flaggedQuestions).filter((k) => flaggedQuestions[k]).length}
                  </p>
                </div>
              </div>
            </div>

            {/* Tombol Ragu-ragu */}
            <Button
              type="button"
              onClick={() => toggleFlag(activeQuestion._key)}
              variant="outline"
              className={`w-full py-5 rounded-xl border flex items-center justify-center gap-2 font-bold uppercase tracking-wider text-[10px] transition-all ${
                isCurrentFlagged
                  ? "bg-warning/10 border-warning text-warning shadow-[0_0_12px_rgba(var(--warning-rgb),0.15)]"
                  : "border-border hover:border-warning/30 hover:bg-warning/5 text-muted-foreground"
              }`}
            >
              <Flag size={14} className={isCurrentFlagged ? "fill-warning" : ""} />
              {isCurrentFlagged ? "Ragu-ragu (Tersimpan)" : "Tandai Ragu-ragu"}
            </Button>

            {/* Grid Navigasi CBT Persisten (Seluruh Seksi) */}
            <div className="bg-card border border-border rounded-lg p-5 shadow-sm space-y-6 glass">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">
                Lembar Navigasi Soal
              </p>
              
              <div className="space-y-4 max-h-[35vh] overflow-y-auto pr-1 no-scrollbar">
                {availableSections.map((secKey) => (
                  <div key={secKey} className="space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      <span>{SECTION_LABELS[secKey].split(" ")[0]}</span>
                      <span className="font-mono text-xs font-semibold">
                        {sections[secKey].filter((qIdx) => answers[exam.questions[qIdx]._key] !== undefined).length} / {sections[secKey].length}
                      </span>
                    </div>

                    <div className="grid grid-cols-5 gap-1.5">
                      {sections[secKey].map((qIdx) => {
                        const q = exam.questions[qIdx];
                        const isAnswered = answers[q._key] !== undefined;
                        const isFlagged = flaggedQuestions[q._key];
                        const isActive = qIdx === currentQuestionIndex;
                        const isSectionLocked = availableSections.indexOf(secKey) < activeSectionIndex;
                        const isListeningLocked = secKey === "listening" && !exam.choukaiAudioUrl && qIdx !== currentQuestionIndex;
                        const isLocked = isSectionLocked || isListeningLocked;

                        /* Determine button style based on state (active, locked, flagged, answered). */
                        let btnClass = "bg-muted/10 border-border text-muted-foreground hover:border-destructive/30";
                        if (isActive) {
                          btnClass = "bg-destructive/10 text-destructive border-destructive shadow-[0_0_8px_rgba(var(--destructive-rgb),0.35)] scale-105 ring-2 ring-destructive/20";
                        } else if (isLocked) {
                          btnClass = "bg-muted/20 text-muted-foreground/30 border-border/50 cursor-not-allowed opacity-55";
                        } else if (isFlagged) {
                          btnClass = "bg-warning/10 text-warning border-warning hover:bg-warning/20 shadow-[0_0_8px_rgba(var(--warning-rgb),0.2)]";
                        } else if (isAnswered) {
                          btnClass = "bg-success/10 text-success border-success hover:bg-success/20 shadow-[0_0_8px_rgba(var(--success-rgb),0.2)]";
                        }

                        return (
                          <button
                            type="button"
                            key={q._key}
                            disabled={isLocked}
                            onClick={() => goToQuestion(qIdx)}
                            className={`h-8 rounded-lg flex items-center justify-center text-[10px] font-mono font-bold transition-all border ${btnClass}`}
                            aria-label={`Pindah ke Soal Nomor ${qIdx + 1}`}
                          >
                            {isLocked ? <LockIcon size={10} /> : qIdx + 1}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tombol Kirim Instan */}
            <Button
              onClick={() => setPendingConfirm("finish")}
              disabled={isSubmitting}
              className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground py-6 rounded-xl font-bold uppercase tracking-wider text-[10px] transition-all shadow-md"
            >
              <CheckCircle size={14} aria-hidden="true" className="mr-2" /> Kumpulkan Ujian
            </Button>
          </aside>
        </div>
      </div>

      {/* Footer Navigasi Mobile */}
      <footer className="fixed bottom-0 left-0 right-0 z-[110] bg-background/80  border-t border-border p-4 pb-safe">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 px-4 md:px-6">
          <Button
            onClick={prevQuestion}
            variant="ghost"
            disabled={disablePreviousButton || isSubmitting}
            className="flex-1 sm:flex-none py-6 rounded-xl border border-border hover:bg-muted font-bold uppercase tracking-wider text-[10px] transition-all"
          >
            <ArrowLeft size={16} aria-hidden="true" className="mr-2" /> Sebelumnya
          </Button>

          {/* Tombol Ragu-ragu Mobile */}
          <Button
            onClick={() => toggleFlag(activeQuestion._key)}
            variant="outline"
            className={`px-4 py-6 rounded-xl border transition-all ${
              isCurrentFlagged
                ? "bg-warning/10 border-warning text-warning"
                : "border-border text-muted-foreground"
            }`}
            aria-label="Tandai Ragu-ragu"
          >
            <Flag size={16} aria-hidden="true" className={isCurrentFlagged ? "fill-warning" : ""} />
          </Button>

          {currentQuestionIndex === exam.questions.length - 1 ? (
            <Button
              onClick={() => setPendingConfirm("finish")}
              disabled={isSubmitting}
              className="flex-1 sm:flex-none bg-warning hover:bg-warning/90 text-warning-foreground px-8 py-6 rounded-xl font-bold uppercase tracking-wider text-[10px] transition-all shadow-md"
            >
              <CheckCircle size={16} aria-hidden="true" className="mr-2" /> Selesai
            </Button>
          ) : (
            <Button
              onClick={nextQuestion}
              disabled={isSubmitting}
              className="flex-1 sm:flex-none bg-destructive hover:bg-destructive/90 text-destructive-foreground px-8 py-6 rounded-xl font-bold uppercase tracking-wider text-[10px] transition-all shadow-md"
            >
              {sections[currentSection][sections[currentSection].length - 1] === currentQuestionIndex ? (
                <>{/* Show next section label if current section is completed. */ }Lanjut: {SECTION_LABELS[availableSections[availableSections.indexOf(currentSection) + 1]]?.split(" ")[0] || "Next"} <ArrowRight aria-hidden="true" size={16} className="ml-2" /></>
              ) : (
                <>Lanjut <ArrowRight aria-hidden="true" size={16} className="ml-2" /></>
              )}
            </Button>
          )}
        </div>
      </footer>

      {/* ======================
      {/* DIALOG & OVERLAY KONFIRMASI */}
      {/* ====================== */}

      {/* Modal Konfirmasi Bagian Ujian */}
      <ConfirmModal
        isOpen={pendingConfirm === "section"}
        onClose={() => setPendingConfirm(null)}
        onConfirm={confirmPendingAction}
        title={pendingConfirmLabel?.title || ""}
        description={pendingConfirmLabel?.description || ""}
        confirmText="Ya, Lanjutkan"
        cancelText="Batal"
        isDestructive={false}
      />

      {/* Lembar Jawaban & Konfirmasi Selesai Ujian (Answer Sheet Grid Overlay) */}
      <AnimatePresence>
        {pendingConfirm === "finish" && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-background/80  flex items-center justify-center p-4"
          >
            <m.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-2xl bg-card border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] neo-card glass"
            >
              {/* Kepala Lembar Jawaban */}
              <div className="p-6 border-b border-border flex items-center justify-between">
                <div>
                  <h2 className="text-xl uppercase tracking-tight text-foreground">
                    Tinjau Lembar Jawaban
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    Silakan periksa jawaban Anda sebelum menyelesaikan ujian.
                  </p>
                </div>
                <div className="px-3 py-1.5 rounded-full bg-destructive/10 border border-destructive/20 text-destructive text-[10px] font-bold uppercase tracking-wider">
                  Konfirmasi Akhir
                </div>
              </div>

              {/* Ringkasan Statistik Jawaban */}
              <div className="px-6 py-4 bg-muted/30 border-b border-border flex flex-wrap gap-4 items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-3 rounded-full bg-success shadow-[0_0_8px_rgb(var(--success-rgb)/0.5)]" />
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Dijawab</p>
                    <p className="text-lg font-black font-mono text-foreground mt-1">
                      {Object.keys(answers).length} <span className="text-xs text-muted-foreground/50">/ {exam.questions.length}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="size-3 rounded-full bg-warning shadow-[0_0_8px_rgb(var(--warning-rgb)/0.5)]" />
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Ragu-ragu</p>
                    <p className="text-lg font-black font-mono text-foreground mt-1">
                      {Object.keys(flaggedQuestions).filter((k) => flaggedQuestions[k]).length}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="size-3 rounded-full bg-muted shadow-[0_0_8px_rgba(var(--foreground-rgb),0.1)]" />
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none font-sans">Belum Dijawab</p>
                    <p className="text-lg font-black font-mono text-foreground mt-1">
                      {exam.questions.length - Object.keys(answers).length} <span className="text-xs text-muted-foreground/50">/ {exam.questions.length}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Kisi Soal yang Dapat Digulir */}
              <div className="p-6 overflow-y-auto flex-1 space-y-6">
                <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
                  {exam.questions.map((q, idx) => {
                    const isAnswered = answers[q._key] !== undefined;
                    const isFlagged = flaggedQuestions[q._key];
                    const isCurrentSection = q.section === currentSection;
                    const isLocked = !isCurrentSection && availableSections.indexOf(q.section) < activeSectionIndex;

                    let cellClass = "";
                    let onClickHandler = () => { };

                    /* Handle navigation from answer sheet. Block locked questions. */
                    if (isLocked) {
                      cellClass = "bg-muted/40 text-muted-foreground/30 border-border/50 cursor-not-allowed";
                      onClickHandler = () => {
                        toast.error(`Pertanyaan ${idx + 1} berada di bagian ${SECTION_LABELS[q.section]} yang sudah terkunci.`);
                      };
                    } else if (q.section === "listening" && !exam.choukaiAudioUrl && idx !== currentQuestionIndex) {
                      cellClass = "bg-muted/40 text-muted-foreground/30 border-border/50 cursor-not-allowed";
                      onClickHandler = () => {
                        toast.error("Bagian Choukai (Mendengar) harus dikerjakan secara berurutan.");
                      };
                    } else {
                      onClickHandler = () => {
                        goToQuestion(idx);
                        setPendingConfirm(null);
                      };
                      if (isFlagged) {
                        cellClass = "bg-warning/10 text-warning border-warning/20 hover:bg-warning/20 hover:scale-105 active:scale-95 cursor-pointer shadow-[0_0_10px_rgb(var(--warning-rgb)/0.05)]";
                      } else if (isAnswered) {
                        cellClass = "bg-success/10 text-success border-success/20 hover:bg-success/20 hover:scale-105 active:scale-95 cursor-pointer shadow-[0_0_10px_rgb(var(--success-rgb)/0.05)]";
                      } else {
                        cellClass = "bg-muted/10 text-muted-foreground border-border hover:bg-muted/20 hover:scale-105 active:scale-95 cursor-pointer";
                      }
                    }

                    return (
                      <button
                        type="button"
                        key={q._key}
                        onClick={onClickHandler}
                        className={`aspect-square rounded-xl border flex flex-col items-center justify-center text-xs font-bold font-mono transition-all relative ${cellClass}`}
                        aria-label={`Lihat Soal Nomor ${idx + 1}`}
                      >
                        <span>{idx + 1}</span>
                        {isLocked && (
                          <LockIcon size={8} className="absolute bottom-1 right-1 text-muted-foreground/30" />
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3">
                  <AlertTriangle size={16} className="text-destructive shrink-0 mt-0.5" />
                  <p className="text-[11px] text-destructive font-medium leading-relaxed">
                    Setelah mengumpulkan lembar jawaban ini, waktu akan dihentikan dan ujian Anda akan segera dihitung secara permanen. Anda tidak dapat kembali mengubah jawaban Anda.
                  </p>
                </div>
              </div>

              {/* Tombol Aksi */}
              <div className="p-6 border-t border-border bg-muted/10 flex items-center justify-end gap-3">
                <Button
                  onClick={() => setPendingConfirm(null)}
                  variant="ghost"
                  disabled={isSubmitting}
                  className="rounded-xl border border-border hover:bg-muted text-xs font-bold uppercase tracking-wider py-5"
                >
                  Kembali
                </Button>
                <Button
                  onClick={confirmPendingAction}
                  disabled={isSubmitting}
                  className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-black uppercase tracking-widest text-xs px-6 py-5 rounded-xl transition-all shadow-lg hover:shadow-destructive/20"
                >
                  {isSubmitting && (
                    <Loader2 size={16} aria-hidden="true" className="mr-2 animate-spin" />
                  )}
                  {isSubmitting ? "Mengirim Jawaban" : "Kumpulkan Ujian"}
                </Button>
              </div>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}