import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Clock,
  ArrowRight,
  ArrowLeft,
  Volume2,
  CheckCircle,
  Lock as LockIcon,
} from "lucide-react";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { ExamData, ExamQuestion, AudioState, PendingConfirmType } from "./types";
import { SECTION_LABELS } from "./constants";
import { formatTime } from "@/lib/utils";

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
}

/**
 * Komponen Opsi Jawaban yang di-memoize untuk menghindari re-render yang tidak perlu.
 * Tanpa memoize, tombol ini akan re-render setiap detik saat timer `timeLeft` diperbarui.
 */
const OptionButton = memo(({ 
  idx, 
  text, 
  isSelected, 
  onSelect 
}: { 
  idx: number; 
  text: string; 
  isSelected: boolean; 
  onSelect: (idx: number) => void;
}) => {
  return (
    <button
      onClick={() => onSelect(idx)}
      className={`p-4 rounded-xl text-left transition-all font-medium flex items-center gap-4 border ${
        isSelected
          ? "bg-destructive/10 border-destructive/30 text-destructive"
          : "bg-background border-border text-muted-foreground hover:border-destructive/30"
      }`}
    >
      <div 
        className={`font-mono text-xs font-bold h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
          isSelected ? "bg-destructive text-destructive-foreground" : "bg-muted text-muted-foreground"
        }`}
      >
        {idx + 1}
      </div>
      <span className="leading-tight font-japanese text-base md:text-lg flex-1">{text}</span>
      {isSelected && (
        <CheckCircle size={16} aria-hidden="true" className="text-destructive text-destructive" />
      )}
    </button>
  );
});

OptionButton.displayName = "OptionButton";

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
}: ExamPlayingProps) {
  if (!activeQuestion) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-background text-foreground overflow-y-auto pb-32 font-sans selection:bg-destructive/30">
      <audio ref={audioRef} className="hidden" />
      <div className="max-w-4xl mx-auto px-4 md:px-6">
        <header className="sticky top-0 z-50 pt-6 pb-4 bg-background/80 bg-card/80 backdrop-blur-md">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar flex-1">
                {availableSections.map((section, idx) => {
                  const isLocked = idx < activeSectionIndex;
                  const isActive = currentSection === section;
                  return (
                    <button
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
              
              <div className="flex items-center gap-3 shrink-0">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-colors ${
                  isTimeCritical 
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
            <motion.div
              key={activeQuestion._key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="space-y-6">
                {isCurrentlyListening && (
                  <div className="bg-background dark:bg-[rgba(var(--background-rgb),0.05)] border border-border rounded-2xl p-4 flex items-center gap-4 shadow-sm">
                    <Button
                      onClick={handlePlayAudio}
                      disabled={
                        exam.choukaiAudioUrl 
                          ? (audioStatus.global === "playing")
                          : (audioStatus[activeQuestion._key] !== "idle" && audioStatus[activeQuestion._key] !== undefined)
                      }
                      size="sm"
                      className={`w-10 h-10 rounded-full shrink-0 ${
                        (!exam.choukaiAudioUrl && (!audioStatus[activeQuestion._key] || audioStatus[activeQuestion._key] === "idle")) ||
                        (exam.choukaiAudioUrl && (!audioStatus.global || audioStatus.global === "idle"))
                          ? "bg-destructive text-destructive-foreground"
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
                        {exam.choukaiAudioUrl ? "Audio diputar terus menerus selama sesi berlangsung." : "Audio soal ini hanya dapat diputar SATU kali."}
                      </p>
                    </div>
                  </div>
                )}

                <div className="bg-background dark:bg-[rgba(var(--background-rgb),0.05)] border border-border rounded-3xl p-6 md:p-8 shadow-sm">
                  <div className="flex items-start justify-between gap-4 mb-6">
                    <div className="px-3 py-1 bg-muted dark:bg-[rgba(var(--background-rgb),0.1)] rounded-lg text-[10px] font-mono font-bold text-muted-foreground">
                      PERTANYAAN {currentQuestionIndex + 1}
                    </div>
                  </div>

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

                    <div 
                      className="text-lg md:text-xl font-medium leading-relaxed mb-8 text-foreground"
                      dangerouslySetInnerHTML={{ __html: activeQuestion.questionText || "" }}
                    />

                  <div className="grid grid-cols-1 gap-3">
                    {activeQuestion.options.map((opt, idx) => (
                      <OptionButton
                        key={idx}
                        idx={idx}
                        text={opt}
                        isSelected={answers[activeQuestion._key] === idx}
                        onSelect={handleAnswer}
                      />
                    ))}
                  </div>
                </div>

                <div className="bg-background/50 dark:bg-[rgba(var(--background-rgb),0.05)] border border-border rounded-2xl p-4">
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4 flex items-center gap-2">
                    NAVIGASI {SECTION_LABELS[currentSection].split(" ")[0]}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {sections[currentSection]?.map((qIdx) => {
                      const isAnswered = answers[exam.questions[qIdx]._key] !== undefined;
                      const isActive = qIdx === currentQuestionIndex;
                      const isLocked = currentSection === "listening" && !exam.choukaiAudioUrl && qIdx !== currentQuestionIndex;

                      return (
                        <button
                          key={qIdx}
                          disabled={isLocked}
                          onClick={() => !isLocked && goToQuestion(qIdx)}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-mono font-bold transition-all border ${
                            isActive
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
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <footer className="fixed bottom-0 left-0 right-0 z-[110] bg-background/80 bg-card/80 backdrop-blur-md border-t border-border p-4 pb-safe">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <Button
            onClick={prevQuestion}
            variant="ghost"
            disabled={disablePreviousButton}
            className="flex-1 sm:flex-none py-6 rounded-xl border border-border hover:bg-muted font-bold uppercase tracking-wider text-[10px] transition-all"
          >
            <ArrowLeft size={16} aria-hidden="true" className="mr-2" /> Sebelumnya
          </Button>

          {currentQuestionIndex === exam.questions.length - 1 ? (
            <Button
              onClick={() => setPendingConfirm("finish")}
              className="flex-1 sm:flex-none bg-warning hover:bg-warning/90 text-warning-foreground px-8 py-6 rounded-xl font-bold uppercase tracking-wider text-[10px] transition-all shadow-md"
            >
              <CheckCircle size={16} aria-hidden="true" className="mr-2" /> Selesai
            </Button>
          ) : (
            <Button
              onClick={nextQuestion}
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

      {/* Modal Konfirmasi — menggunakan ConfirmModal custom yang sudah ada */}
      <ConfirmModal
        isOpen={!!pendingConfirm}
        onClose={() => setPendingConfirm(null)}
        onConfirm={confirmPendingAction}
        title={pendingConfirmLabel?.title || ""}
        description={pendingConfirmLabel?.description || ""}
        confirmText="Ya, Lanjutkan"
        cancelText="Batal"
        isDestructive={pendingConfirm === "finish"}
      />
    </div>
  );
}
