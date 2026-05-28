"use client";

import React, { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Trophy, Volume2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { KanaType } from "./kana-data";

interface KanaQuizDialogProps {
  isActive: boolean;
  onClose: (open: boolean) => void;
  lives: number;
  score: number;
  char: { char: string; romaji: string } | null;
  options: string[];
  input: string;
  feedback: "correct" | "incorrect" | null;
  gameOver: boolean;
  onOptionClick: (option: string) => void;
  startQuiz: () => void;
  type: KanaType;
  themeColor: string;
  themeBorder: string;
  themeAccent: string;
  questionMode?: "classic" | "audio";
  questionCount?: number;
  isVictory?: boolean;
}

export function KanaQuizDialog({
  isActive,
  onClose,
  lives,
  score,
  char,
  options,
  input,
  feedback,
  gameOver,
  onOptionClick,
  startQuiz,
  type,
  themeColor,
  themeBorder,
  themeAccent,
  questionMode = "classic",
  questionCount = 0,
  isVictory = false,
}: KanaQuizDialogProps) {
  const isHira = type === "hiragana";

  const speakActiveKana = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis || !char?.char) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(char.char);
    utterance.lang = "ja-JP";
    utterance.rate = 0.85;

    const voices = window.speechSynthesis.getVoices();
    const jaVoice = voices.find((v) => v.lang.startsWith("ja"));
    if (jaVoice) {
      utterance.voice = jaVoice;
    }

    window.speechSynthesis.speak(utterance);
  }, [char]);

  // Autoplay voice in audio mode
  useEffect(() => {
    if (isActive && questionMode === "audio" && char?.char) {
      const timer = setTimeout(() => {
        speakActiveKana();
      }, 120);
      return () => clearTimeout(timer);
    }
  }, [isActive, char, questionMode, speakActiveKana]);

  return (
    <Dialog
      open={isActive}
      onOpenChange={onClose}
    >
      <DialogContent className="max-w-md p-0 border-none bg-transparent shadow-none">
        <DialogTitle className="sr-only">Latihan Kana</DialogTitle>
        <DialogDescription className="sr-only">Latihan membaca huruf kana.</DialogDescription>
        <AnimatePresence>
          {isActive && (
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className={`relative bg-card p-5 md:p-8 rounded-2xl border ${themeBorder} shadow-2xl max-w-[95vw] sm:max-w-md w-full max-h-[90vh] flex flex-col mx-auto overflow-y-auto custom-scrollbar`}
            >
              <div className="relative z-10 flex flex-col h-full">
                <header className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-2">
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive font-black text-sm`}>
                      <Heart size={16} className={lives > 0 ? "fill-current" : ""} />
                      {lives}
                    </div>
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-warning/10 border border-warning/20 text-warning font-black text-sm`}>
                      <Trophy size={16} className="fill-current" />
                      {score}
                    </div>
                    {!gameOver && (
                      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted border border-border text-muted-foreground font-mono text-xs font-bold`}>
                        {questionCount}/20
                      </div>
                    )}
                  </div>
                  <div className={`px-3 py-1.5 rounded-lg bg-muted border border-border text-[9px] font-bold uppercase tracking-widest ${themeColor}`}>
                    {questionMode === "audio" ? "Mendengar" : isHira ? "Hiragana" : "Katakana"}
                  </div>
                </header>

                {!gameOver ? (
                  <div className="flex flex-col items-center">
                    <div className={`w-full aspect-video bg-background rounded-2xl border ${feedback === 'correct' ? 'border-success shadow-lg' : feedback === 'incorrect' ? 'border-destructive shadow-lg' : 'border-border shadow-inner'} flex items-center justify-center mb-8 transition-all duration-300`}>
                      <AnimatePresence mode="wait">
                        {questionMode === "audio" ? (
                          <motion.button
                            key="audio-speaker"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            onClick={speakActiveKana}
                            type="button"
                            aria-label="Putar Suara Aksara"
                            className="w-20 h-20 rounded-full flex items-center justify-center bg-warning/10 border border-warning/45 hover:bg-warning/20 shadow-[0_0_25px_rgba(var(--warning-rgb),0.25)] hover:shadow-[0_0_35px_rgba(var(--warning-rgb),0.4)] transition-all duration-300 text-warning"
                          >
                            <Volume2 size={36} className="animate-pulse" />
                          </motion.button>
                        ) : (
                          <motion.span
                            key={char?.char}
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            className="text-5xl sm:text-7xl font-black text-foreground font-japanese"
                          >
                            {char?.char}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="grid grid-cols-2 gap-3 w-full">
                      {options.map((option, i) => {
                        const isCorrect = questionMode === "classic" 
                          ? option === char?.romaji 
                          : option === char?.char;
                        const isClicked = option === input;
                        let btnClass = "bg-muted border-border text-muted-foreground hover:bg-background hover:text-foreground";
                        
                        if (feedback) {
                          if (isCorrect) {
                            btnClass = "bg-success border-success text-success-foreground shadow-lg";
                          } else if (isClicked && !isCorrect) {
                            btnClass = "bg-destructive border-destructive text-destructive-foreground shadow-lg";
                          } else {
                            btnClass = "bg-muted/50 border-border text-muted-foreground/20 opacity-50";
                          }
                        } else {
                          btnClass = `bg-muted border-border text-muted-foreground hover:border-current focus-visible:ring-1 focus-visible:ring-current hover:${themeColor}`;
                        }

                        return (
                          <Button
                            key={option}
                            type="button"
                            onClick={() => onOptionClick(option)}
                            disabled={!!feedback}
                            variant="outline"
                            className={`h-14 rounded-xl text-lg font-black uppercase tracking-wider transition-all duration-300 ${btnClass}`}
                          >
                            {option}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                ) : isVictory ? (
                  <Card className="bg-success/5 p-8 md:p-10 rounded-2xl border border-success/30 text-center w-full relative overflow-hidden shadow-[0_0_30px_rgba(var(--success-rgb),0.15)] glass">
                    <div className="w-16 h-16 bg-warning/10 rounded-xl flex items-center justify-center mx-auto mb-6 border border-warning/25 shadow-[0_0_20px_rgba(var(--warning-rgb),0.3)] text-warning">
                      <Trophy size={32} className="fill-current" />
                    </div>
                    <h2 className="text-2xl font-black text-foreground uppercase tracking-tight mb-2">Kemenangan!</h2>
                    <p className="text-success text-xs font-bold uppercase tracking-widest mb-4">Lulus Latihan Kana</p>
                    <p className="text-muted-foreground text-xs mb-6 leading-relaxed">
                      Luar biasa! Kamu menyelesaikan 20 soal latihan dengan sisa nyawa dan akurasi tinggi.
                    </p>
                    <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest mb-2">Skor akhir kamu:</p>
                    <div className="text-5xl md:text-6xl font-black text-warning mb-6 drop-shadow-md">
                      {score} <span className="text-xs text-muted-foreground font-mono">/ 20</span>
                    </div>
                    <div className="bg-success/10 border border-success/20 rounded-xl p-3 mb-8 flex items-center justify-center gap-2 text-success font-black text-xs uppercase tracking-wider">
                      <span>+20 XP Bonus Kemenangan</span>
                    </div>
                    <Button
                      onClick={() => startQuiz()}
                      className={`w-full h-auto py-4 rounded-xl font-black uppercase tracking-widest ${themeAccent} text-foreground text-xs transition-all shadow-lg border-none hover:opacity-90`}
                    >
                      Latihan Lagi
                    </Button>
                  </Card>
                ) : (
                  <Card className="bg-muted/20 p-8 md:p-10 rounded-2xl border border-border text-center w-full relative overflow-hidden shadow-2xl">
                    <div className="w-16 h-16 bg-destructive/10 rounded-xl flex items-center justify-center mx-auto mb-6 border border-destructive/20 text-destructive">
                      <Heart size={32} className="fill-current animate-pulse" />
                    </div>
                    <h2 className="text-2xl font-black text-foreground uppercase tracking-tight mb-2">Game Over!</h2>
                    <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest mb-6">Skor akhir kamu:</p>
                    <div className="text-5xl md:text-6xl font-black text-destructive mb-8 drop-shadow-md">
                      {score} <span className="text-xs text-muted-foreground font-mono">/ 20</span>
                    </div>
                    <Button
                      onClick={() => startQuiz()}
                      className={`w-full h-auto py-4 rounded-xl font-black uppercase tracking-widest ${themeAccent} text-foreground text-xs transition-all shadow-lg border-none`}
                    >
                      Main Lagi
                    </Button>
                  </Card>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
