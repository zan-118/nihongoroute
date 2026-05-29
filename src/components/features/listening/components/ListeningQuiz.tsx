"use client";

/**
 * @file ListeningQuiz.tsx
 * @description Komponen kuis interaktif untuk mengukur pemahaman menyimak (Listening Quiz).
 * Menampilkan pertanyaan pilihan ganda secara linear lengkap dengan penjelasan dan navigasi progres.
 */

// ==========================================
// IMPOR UTAMA
// ==========================================
import React, { useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, ChevronRight, CircleHelp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuizItem } from "../types";
import { cn } from "@/lib/utils";

// ==========================================
// ANTARMUKA & TIPE DATA
// ==========================================
interface ListeningQuizProps {
  questions: QuizItem[];
  onComplete: (score: number) => void;
}

// ==========================================
// KOMPONEN UTAMA: ListeningQuiz
// ==========================================
/**
 * Komponen interaktif kuis menyimak dengan animasi transisi yang mulus.
 * 
 * @param {ListeningQuizProps} props Properti untuk komponen kuis menyimak.
 */
export default function ListeningQuiz({ questions, onComplete }: ListeningQuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [score, setScore] = useState(0);
  const [showFinished, setShowFinished] = useState(false);

  const currentQuestion = questions[currentIndex];

  // Menangani penekanan opsi jawaban kuis
  const handleOptionClick = (optionIndex: number, isCorrect: boolean) => {
    if (isLocked) return;
    
    setSelectedOption(optionIndex);
    setIsLocked(true);

    if (isCorrect) {
      setScore(s => s + 1);
    }
  };

  // Menavigasi ke pertanyaan berikutnya atau menyelesaikan kuis
  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(c => c + 1);
      setSelectedOption(null);
      setIsLocked(false);
    } else {
      setShowFinished(true);
      onComplete(score + (selectedOption !== null && currentQuestion.options[selectedOption].isCorrect ? 1 : 0));
    }
  };

  // Tampilan Akhir: Kuis Selesai
  if (showFinished) {
    return (
      <m.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-8 rounded-3xl bg-muted/30 border border-border text-center flex flex-col items-center gap-4"
      >
        <div className="size-16 rounded-full bg-primary/20 flex items-center justify-center text-primary mb-2">
          <CheckCircle2 size={32} />
        </div>
        <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">
          Latihan Menyimak Selesai!
        </h2>
        <p className="text-muted-foreground text-sm">
          Kamu menjawab <span className="text-primary font-bold">{score}/{questions.length}</span> pertanyaan dengan benar.
        </p>
        <Button 
          className="mt-4 rounded-full px-8 font-bold uppercase tracking-widest"
          onClick={() => window.location.reload()}
        >
          Ulangi Pelajaran
        </Button>
      </m.div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Header Progres Kuis */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <CircleHelp size={18} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
            Soal {currentIndex + 1} dari {questions.length}
          </span>
        </div>
        <div className="flex gap-1">
          {questions.map((_, idx) => (
            <div 
              key={`qdot-${idx}`}
              className={cn(
                "h-1 w-6 rounded-full transition-all duration-500",
                idx === currentIndex ? "bg-primary" : idx < currentIndex ? "bg-primary/30" : "bg-background/10"
              )}
            />
          ))}
        </div>
      </div>

      {/* Kartu Soal Kuis Aktif */}
      <m.div
        key={currentIndex}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="p-8 rounded-3xl bg-muted/20 border border-border backdrop-blur-xl relative overflow-hidden"
      >
        {/* Efek Pendar Ambient (Glow) */}
        <div className="absolute -top-24 -right-24 size-48 bg-primary/5 blur-[80px] rounded-full" />
        
        <h3 className="text-xl font-bold text-foreground mb-8 leading-snug font-sans">
          {currentQuestion.question}
        </h3>

        {/* Daftar Opsi Jawaban */}
        <div className="grid gap-3">
          {currentQuestion.options.map((option, idx) => {
            const isSelected = selectedOption === idx;
            const showResult = isLocked;
            const isCorrect = option.isCorrect;
            
            return (
              <button type="button"
                key={option.text}
                disabled={isLocked}
                onClick={() => handleOptionClick(idx, isCorrect)}
                className={cn(
                  "group relative w-full p-5 rounded-2xl text-left transition-all duration-300 border",
                  !showResult && "bg-muted/50 border-border hover:bg-muted hover:border-primary/30",
                  showResult && isCorrect && "bg-success/10 border-success/40 shadow-[0_0_20px_-10px_rgba(var(--success-rgb),0.5)]",
                  showResult && isSelected && !isCorrect && "bg-destructive/10 border-destructive/40 shadow-[0_0_20px_-10px_rgba(var(--destructive-rgb),0.5)]",
                  showResult && !isSelected && !isCorrect && "opacity-40 grayscale"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className={cn(
                    "font-medium transition-colors",
                    showResult && isCorrect ? "text-success" : showResult && isSelected && !isCorrect ? "text-destructive" : "text-foreground/80"
                  )}>
                    {option.text}
                  </span>
                  
                  {showResult && isCorrect && <CheckCircle2 size={20} className="text-success" />}
                  {showResult && isSelected && !isCorrect && <XCircle size={20} className="text-destructive" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Penjelasan Jawaban & Tombol Lanjut */}
        <AnimatePresence>
          {isLocked && (
            <m.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              className="mt-8 pt-6 border-t border-border"
            >
              {currentQuestion.explanation && (
                <p className="text-sm text-muted-foreground leading-relaxed mb-6 italic font-medium">
                  {currentQuestion.explanation}
                </p>
              )}
              
              <Button 
                onClick={handleNext}
                className="w-full rounded-2xl py-6 bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-[0.2em] group"
              >
                {currentIndex === questions.length - 1 ? "Selesaikan Tugas" : "Pertanyaan Berikutnya"}
                <ChevronRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </m.div>
          )}
        </AnimatePresence>
      </m.div>
    </div>
  );
}

