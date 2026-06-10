/**
 * @file ExamPlaying.tsx
 * @description Komponen antarmuka utama saat pengguna sedang mengerjakan simulasi ujian (Mock Exam).
 * Mengelola tampilan soal, pemutaran audio choukai, pewaktuan, navigasi soal, dan lembar jawaban konfirmasi akhir.
 */

// ======================
// IMPOR
// ======================
import { memo } from "react";
import { m, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Clock,
  ArrowRight,
  ArrowLeft,
  Volume2,
  CheckCircle,
  Loader2,
  Lock as LockIcon,
} from "lucide-react";
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
import { formatTime } from "@/lib/utils";
import { sanitizeHtml } from "@/lib/sanitize";
import { toast } from "sonner";
import { ExamQuestionText } from "./ExamQuestionText";

// ======================
// ANTARMUKA & TIPE
// ======================
interface ExamPlayingProps {
  exam: ExamData;
  activeQuestion: ExamQuestion;
  currentQuestionIndex: number;
  timeLeft: number;
  answers: Record<string, number>;
  audioStatus: Record<string, AudioState>;
  audioRef: React.MutableRefObject<HTMLAudioElement | null>;
  isTimeCritical: boolean;
  isCurrentlyListening: boolean;
  disablePreviousButton: boolean;
  handlePlayAudio: () => void;
  handleAnswer: (idx: number) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  sections: Record<string, number[]>;
  availableSections: string[];
  currentSection: string;
  goToQuestion: (idx: number) => void;
  activeSectionIndex: number;
  pendingConfirm: PendingConfirmType;
  setPendingConfirm: (v: PendingConfirmType) => void;
  confirmPendingAction: () => void;
  pendingConfirmLabel: { title: string; description: string } | null;
  isSubmitting?: boolean;
}

// ======================
// KOMPONEN PEMBANTU
// ======================
/**
 * Komponen Opsi Jawaban yang di-memoize untuk menghindari re-render yang tidak perlu.
 * Tanpa memoize, tombol ini akan re-render setiap detik saat timer `timeLeft` diperbarui.
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
    <button type="button"
      onClick={() => onSelect(idx)}
      className={`p-4 rounded-xl text-left transition-all font-medium flex items-center gap-4 border ${isSelected
        ? "bg-destructive/10 border-destructive/30 text-destructive"
        : "bg-background border-border text-muted-foreground hover:border-destructive/30"
        }`}
    >
      <div
        className={`font-mono text-xs font-bold h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? "bg-destructive text-destructive-foreground" : "bg-muted text-muted-foreground"
          }`}
      >
        {idx + 1}
      </div>
      {choice?.type === "image" ? (
        <span className="flex min-w-0 flex-1 flex-col gap-3">
          <span className="relative block aspect-[16/9] w-full overflow-hidden rounded-xl border border-border bg-muted/40">
            <Image
              src={choice.value}
              alt={choice.alt || text}
              fill
              sizes="(max-width: 768px) 70vw, 520px"
              unoptimized
              className="object-contain"
            />
          </span>
          <span className="leading-tight font-japanese text-sm md:text-base">
            {choice.alt || text}
          </span>
        </span>
      ) : (
        <span className="leading-tight font-japanese text-base md:text-lg flex-1">
          {choice?.type === "text" ? choice.value : text}
        </span>
      )}
      {isSelected && (
        <CheckCircle size={16} aria-hidden="true" className="text-destructive text-destructive" />
      )}
    </button>
  );
});

OptionButton.displayName = "OptionButton";

function ExamPassageBlock({ passage }: { passage?: ExamPassage | null }) {
  if (!passage) return null;

  const hasContent = Boolean(
    passage.contentHtml ||
      passage.visualUrl
  );

  if (!hasContent) return null;

  return (
    <div className="mb-8 rounded-2xl border border-border bg-muted/20 p-4 md:p-5">
      {passage.visualUrl && (
        <div className="mb-5 overflow-hidden rounded-xl border border-border bg-background/60">
          <Image
            src={passage.visualUrl}
            alt="Passage visual"
            width={900}
            height={500}
            unoptimized
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
export function ExamPlaying({
  exam,
  activeQuestion,
  currentQuestionIndex,
  timeLeft,
  answers,
  audioStatus,
  audioRef,
  isTimeCritical,
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
}: ExamPlayingProps) {
  if (!activeQuestion) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-background text-foreground overflow-y-auto pb-32 font-sans selection:bg-destructive/30">
      <audio aria-label="Audio" ref={audioRef} className="hidden" />
      <div className="max-w-4xl mx-auto px-4 md:px-6">
        <header className="sticky top-0 z-50 pt-6 pb-4 bg-background/80 bg-card/80 backdrop-blur-md">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar flex-1">
                {availableSections.map((section, idx) => {
                  const isLocked = idx < activeSectionIndex;
                  const isActive = currentSection === section;
                  return (
                    <button type="button"
                      key={section}
                      disabled={isLocked}
                      onClick={() => !isLocked && goToQuestion(sections[section][0])}
                      className={`whitespace-nowrap px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border ${isActive
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

              <div className="flex items-center gap-3 shrink-0">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-colors ${isTimeCritical
                  ? "bg-destructive/10 border-destructive/30 text-destructive animate-pulse"
                  : "bg-background border-border text-muted-foreground"
                  }`}>
                  <Clock size={14} aria-hidden="true" />
                  <span className="font-mono font-bold text-xs">{formatTime(timeLeft)}</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="mt-4">
          <AnimatePresence mode="wait">
            <m.div
              key={activeQuestion._key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="space-y-6">
                {isCurrentlyListening && (
                  <div className="bg-background dark:bg-[rgb(var(--background-rgb)/0.05)] border border-border rounded-2xl p-4 flex items-center gap-4 shadow-sm">
                    <Button
                      onClick={handlePlayAudio}
                      disabled={
                        exam.choukaiAudioUrl
                          ? (audioStatus.global === "playing" || audioStatus.global === "played")
                          : (audioStatus[activeQuestion._key] === "playing" || audioStatus[activeQuestion._key] === "played")
                      }
                      size="sm"
                      className={`w-10 h-10 rounded-full shrink-0 ${(!exam.choukaiAudioUrl && (!audioStatus[activeQuestion._key] || audioStatus[activeQuestion._key] === "idle")) ||
                        (exam.choukaiAudioUrl && (!audioStatus.global || audioStatus.global === "idle"))
                        ? "bg-destructive text-destructive-foreground shadow-md hover:shadow-destructive/20 hover:scale-105 transition-all"
                        : "bg-muted text-muted-foreground cursor-not-allowed"
                        }`}
                    >
                      <Volume2 size={18} aria-hidden="true" className={(exam.choukaiAudioUrl ? audioStatus.global === "playing" : audioStatus[activeQuestion._key] === "playing") ? "animate-pulse" : ""} />
                    </Button>
                    <div className="flex-1">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">
                        {exam.choukaiAudioUrl ? "Audio Sesi (Global)" : "Audio Per Soal"}
                      </p>
                      <p className="text-[10px] text-muted-foreground italic leading-tight">
                        {exam.choukaiAudioUrl ? "Audio sesi global hanya dapat diputar SATU kali secara penuh." : "Audio soal ini hanya dapat diputar SATU kali."}
                      </p>
                    </div>
                  </div>
                )}

                <div className="bg-background dark:bg-[rgb(var(--background-rgb)/0.05)] border border-border rounded-3xl p-6 md:p-8 shadow-sm">
                  <div className="flex items-start justify-between gap-4 mb-6">
                    <div className="px-3 py-1 bg-muted dark:bg-[rgb(var(--background-rgb)/0.1)] rounded-lg text-[10px] font-mono font-bold text-muted-foreground">
                      PERTANYAAN {currentQuestionIndex + 1}
                    </div>
                  </div>

                  <ExamPassageBlock passage={activeQuestion.passage} />

                  {activeQuestion.imageUrl && (
                    <div className="mb-8 rounded-2xl overflow-hidden border border-border bg-muted/30">
                      <Image
                        src={activeQuestion.imageUrl}
                        alt="Question Image"
                        width={800}
                        height={400}
                        className="w-full h-auto object-contain"
                      />
                    </div>
                  )}

                  <ExamQuestionText
                    questionText={activeQuestion.questionText}
                    className="text-lg md:text-xl font-medium leading-relaxed mb-8 text-foreground"
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

                <div className="bg-background/50 dark:bg-[rgb(var(--background-rgb)/0.05)] border border-border rounded-2xl p-4">
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4 flex items-center gap-2">
                    NAVIGASI {SECTION_LABELS[currentSection].split(" ")[0]}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {sections[currentSection]?.map((qIdx) => {
                      const isAnswered = answers[exam.questions[qIdx]._key] !== undefined;
                      const isActive = qIdx === currentQuestionIndex;
                      const isLocked = currentSection === "listening" && !exam.choukaiAudioUrl && qIdx !== currentQuestionIndex;

                      return (
                        <button type="button"
                          key={qIdx}
                          disabled={isLocked}
                          onClick={() => !isLocked && goToQuestion(qIdx)}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-mono font-bold transition-all border ${isActive
                            ? "bg-destructive text-destructive-foreground border-transparent shadow-md scale-105"
                            : isAnswered
                              ? "bg-success/10 text-success border-success/20"
                              : isLocked
                                ? "bg-transparent text-muted-foreground/30 border-border/50 cursor-not-allowed"
                                : "bg-background text-muted-foreground border-border"
                            }`}
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
      </div>

      <footer className="fixed bottom-0 left-0 right-0 z-[110] bg-background/80 bg-card/80 backdrop-blur-md border-t border-border p-4 pb-safe">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <Button
            onClick={prevQuestion}
            variant="ghost"
            disabled={disablePreviousButton || isSubmitting}
            className="flex-1 sm:flex-none py-6 rounded-xl border border-border hover:bg-muted font-bold uppercase tracking-wider text-[10px] transition-all"
          >
            <ArrowLeft size={16} aria-hidden="true" className="mr-2" /> Sebelumnya
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
                <>Lanjut: {SECTION_LABELS[availableSections[availableSections.indexOf(currentSection) + 1]]?.split(" ")[0] || "Next"} <ArrowRight aria-hidden="true" size={16} className="ml-2" /></>
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
            className="fixed inset-0 z-[200] bg-background/80 backdrop-blur-xl flex items-center justify-center p-4"
          >
            <m.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-2xl bg-card border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] neo-card"
            >
              {/* Kepala Lembar Jawaban */}
              <div className="p-6 border-b border-border flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black uppercase tracking-tight text-foreground">
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
              <div className="px-6 py-4 bg-muted/30 border-b border-border grid grid-cols-2 gap-4">
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
                  <div className="size-3 rounded-full bg-warning animate-pulse shadow-[0_0_8px_rgb(var(--warning-rgb)/0.5)]" />
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Belum Dijawab</p>
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
                    const isCurrentSection = q.section === currentSection;
                    const isLocked = !isCurrentSection && availableSections.indexOf(q.section) < activeSectionIndex;

                    let cellClass = "";
                    let onClickHandler = () => { };

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
                      if (isAnswered) {
                        cellClass = "bg-success/10 text-success border-success/20 hover:bg-success/20 hover:scale-105 active:scale-95 cursor-pointer shadow-[0_0_10px_rgb(var(--success-rgb)/0.05)]";
                      } else {
                        cellClass = "bg-warning/10 text-warning border-warning/20 hover:bg-warning/20 hover:scale-105 active:scale-95 cursor-pointer animate-pulse";
                      }
                    }

                    return (
                      <button type="button"
                        key={q._key}
                        onClick={onClickHandler}
                        className={`aspect-square rounded-xl border flex flex-col items-center justify-center text-xs font-bold font-mono transition-all relative ${cellClass}`}
                      >
                        <span>{idx + 1}</span>
                        {isLocked && (
                          <LockIcon size={8} className="absolute bottom-1 right-1 text-muted-foreground/30" />
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-2xl flex items-start gap-3">
                  <span className="text-sm">⚠️</span>
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
