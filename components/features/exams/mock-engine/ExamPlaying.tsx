import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Clock,
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  Volume2,
  CheckCircle,
} from "lucide-react";
import { ExamData, ExamQuestion, AudioState } from "./types";
import { SECTION_LABELS } from "./constants";
import { formatTime } from "@/lib/helpers";

interface ExamPlayingProps {
  exam: ExamData;
  activeQuestion: ExamQuestion;
  currentQuestionIndex: number;
  timeLeft: number;
  answers: Record<string, number>;
  audioStatus: Record<string, AudioState>;
  cheatWarnings: number;
  audioRef: React.MutableRefObject<HTMLAudioElement | null>;
  isTimeCritical: boolean;
  isCurrentlyListening: boolean;
  disablePreviousButton: boolean;
  handlePlayAudio: () => void;
  finishExam: () => void;
  handleAnswer: (idx: number) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
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
    <Button
      variant="ghost"
      onClick={() => onSelect(idx)}
      className={`p-8 md:p-10 rounded-3xl text-left transition-all font-medium h-auto group flex items-center gap-6 border neo-card shadow-none ${
        isSelected
          ? "bg-red-600/10 dark:bg-red-500/10 border-red-500/50 text-foreground dark:text-white neo-inset shadow-none"
          : "bg-muted/50 dark:bg-black/20 border-border dark:border-white/5 text-muted-foreground hover:border-primary/30 hover:bg-muted dark:hover:bg-white/5"
      }`}
    >
      <Badge 
        variant="outline" 
        className={`font-mono text-sm font-black transition-colors h-10 w-10 rounded-xl flex items-center justify-center border-none ${
          isSelected ? "bg-red-600 dark:bg-red-500 text-white dark:text-black" : "bg-muted dark:bg-white/5 text-muted-foreground group-hover:text-foreground"
        }`}
      >
        {idx + 1}
      </Badge>
      <span className="leading-tight font-japanese text-lg md:text-2xl flex-1">{text}</span>
      {isSelected && (
        <div className="w-3 h-3 rounded-full bg-red-600 dark:bg-red-500 shadow-sm animate-pulse" />
      )}
    </Button>
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
  cheatWarnings,
  audioRef,
  isTimeCritical,
  isCurrentlyListening,
  disablePreviousButton,
  handlePlayAudio,
  finishExam,
  handleAnswer,
  nextQuestion,
  prevQuestion,
}: ExamPlayingProps) {
  if (!activeQuestion) return null;

  return (
    <div className="w-full flex flex-col max-w-5xl mx-auto transition-colors duration-300">
      <audio ref={audioRef} className="hidden" />

      <header className="relative z-20 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <Card className="w-full flex flex-col md:flex-row justify-between items-start md:items-center p-6 mt-2 md:mt-8 border border-border dark:border-white/5 bg-card dark:bg-slate-900 rounded-3xl neo-card shadow-lg">
          <div className="flex flex-col gap-4 w-full md:w-auto">
            <div className="flex items-center gap-3 flex-wrap">
              <Badge
                variant="outline"
                className="neo-inset px-5 py-2.5 text-muted-foreground dark:text-slate-300 font-mono text-xs md:text-xs font-black bg-muted dark:bg-black/40 border border-border dark:border-white/10 h-auto"
              >
                {currentQuestionIndex + 1} <span className="mx-1 opacity-30">/</span> {exam.questions.length}
              </Badge>
              <Badge
                variant="outline"
                className="neo-inset px-5 py-2.5 text-red-600 dark:text-red-400 font-bold uppercase tracking-widest text-xs sm:text-xs bg-red-500/10 border border-red-500/30 h-auto"
              >
                {SECTION_LABELS[activeQuestion.section]}
              </Badge>
            </div>
            {cheatWarnings > 0 && (
              <Badge variant="ghost" className="text-xs text-amber-600 dark:text-amber-500 font-bold uppercase tracking-widest animate-pulse flex items-center gap-2 p-0 h-auto">
                <ShieldAlert size={14} /> PERINGATAN: {cheatWarnings}x
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-6">
            <div
              className={`flex items-center gap-4 font-mono text-3xl md:text-5xl font-black px-8 py-3 neo-inset transition-all duration-500 rounded-2xl bg-muted dark:bg-black/40 border border-border dark:border-white/5 ${isTimeCritical ? "text-red-600 dark:text-red-500 !border-red-500/50 animate-pulse shadow-inner" : "text-foreground"}`}
            >
              <Clock
                size={24}
                className={isTimeCritical ? "text-red-600 dark:text-red-500" : "text-muted-foreground"}
              />{" "}
              {formatTime(timeLeft)}
            </div>
            <Button
              variant="ghost"
              onClick={() => {
                if (confirm("Beneran mau selesai sekarang? Tenang, jawaban yang sudah kamu isi bakal tetap dihitung kok."))
                  finishExam();
              }}
              className="text-xs neo-card border border-border dark:border-white/5 bg-muted/50 dark:bg-black/20 text-muted-foreground hover:bg-destructive hover:text-white font-black uppercase tracking-widest h-auto px-6 py-4 rounded-xl shadow-none transition-all"
            >
              Akhiri
            </Button>
          </div>
        </Card>
      </header>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="w-full mb-10"
        >
          <Card className="p-8 sm:p-12 md:p-16 flex flex-col neo-card rounded-[3.5rem] border border-border dark:border-white/5 bg-card dark:bg-slate-900 shadow-2xl min-h-[500px]">
            {isCurrentlyListening && (
              <Card className="mb-10 p-6 neo-inset border border-red-500/30 flex flex-col sm:flex-row items-center gap-6 shadow-none bg-red-500/5 rounded-3xl">
                <Button
                  onClick={handlePlayAudio}
                  disabled={
                    audioStatus[activeQuestion._key] !== "idle" &&
                    audioStatus[activeQuestion._key] !== undefined
                  }
                  className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shrink-0 border-none ${
                    !audioStatus[activeQuestion._key] || audioStatus[activeQuestion._key] === "idle"
                      ? "bg-red-600 dark:bg-red-500 text-white hover:scale-110 shadow-lg cursor-pointer"
                      : "bg-muted dark:bg-slate-800 text-muted-foreground dark:text-slate-500 cursor-not-allowed"
                  }`}
                >
                  <Volume2
                    size={32}
                    className={
                      audioStatus[activeQuestion._key] === "playing" ? "animate-pulse" : ""
                    }
                  />
                </Button>
                <div className="text-center sm:text-left">
                  <p className="text-xs md:text-xs font-bold uppercase tracking-widest mb-2 text-foreground">
                    {!audioStatus[activeQuestion._key] || audioStatus[activeQuestion._key] === "idle"
                      ? "Dengarkan Audio"
                      : audioStatus[activeQuestion._key] === "playing"
                        ? "Lagi Didengarkan..."
                        : "Selesai Didengarkan"}
                  </p>
                  <p className="text-xs md:text-xs text-muted-foreground leading-relaxed uppercase font-bold tracking-widest">
                    Ingat: Audionya cuma bisa diputar <span className="text-red-600 dark:text-red-500 underline">SEKALI</span>. Yuk, fokus dengerin!
                  </p>
                </div>
              </Card>
            )}

            {activeQuestion.questionText && (
              <div
                className="text-xl sm:text-2xl md:text-3xl text-foreground font-medium leading-relaxed mb-12 font-japanese prose-custom bg-muted/30 dark:bg-black/10 p-8 rounded-3xl border border-border dark:border-white/5 neo-inset"
                dangerouslySetInnerHTML={{ __html: activeQuestion.questionText }}
              />
            )}

            {activeQuestion.imageUrl && (
              <div className="mb-12 rounded-3xl overflow-hidden neo-inset p-3 bg-muted/20 dark:bg-black/20 border border-border dark:border-white/5 relative min-h-[300px] md:min-h-[400px]">
                <Image
                  src={activeQuestion.imageUrl}
                  alt="Gambar Pendukung Soal"
                  fill
                  className="object-contain opacity-90 rounded-2xl p-4"
                />
              </div>
            )}

            <div className="grid grid-cols-1 gap-5 mt-auto">
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
          </Card>
        </motion.div>
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row justify-between gap-5 pb-20">
        <Button
          variant="ghost"
          onClick={prevQuestion}
          disabled={disablePreviousButton}
          className="w-full sm:w-auto neo-card border border-border dark:border-white/5 bg-muted/50 dark:bg-black/20 px-10 py-8 h-auto text-muted-foreground hover:bg-background hover:text-foreground disabled:opacity-20 disabled:cursor-not-allowed flex items-center justify-center gap-3 font-black uppercase tracking-widest text-xs transition-all rounded-2xl shadow-none"
        >
          <ArrowLeft size={20} /> Sebelumnya
        </Button>

        {currentQuestionIndex === exam.questions.length - 1 ? (
          <Button
            onClick={() => {
              if (confirm("Kirim jawaban sekarang? Waktu masih tersisa.")) finishExam();
            }}
            className="w-full sm:w-auto bg-amber-600 dark:bg-amber-500 hover:bg-foreground text-white dark:text-black px-12 py-8 h-auto flex items-center justify-center font-black uppercase tracking-widest text-xs shadow-lg rounded-2xl border-none transition-all"
          >
            <CheckCircle size={20} className="mr-3" /> Kumpulkan Jawaban
          </Button>
        ) : (
          <Button
            onClick={nextQuestion}
            variant="ghost"
            className="w-full sm:w-auto neo-card border border-primary/30 dark:border-red-500/30 bg-primary/10 dark:bg-red-500/10 text-primary dark:text-red-500 hover:bg-primary dark:hover:bg-red-500 hover:text-white dark:hover:text-black px-10 py-8 h-auto flex items-center justify-center gap-3 font-black uppercase tracking-widest text-xs transition-all rounded-2xl shadow-none"
          >
            Selanjutnya <ArrowRight size={20} />
          </Button>
        )}
      </div>
    </div>
  );
}
