"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Heart, Trophy } from "lucide-react";
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
  input: string; // Add this
  feedback: "correct" | "incorrect" | null;
  gameOver: boolean;
  onOptionClick: (option: string) => void;
  startQuiz: () => void;
  type: KanaType;
  themeColor: string;
  themeBorder: string;
  themeAccent: string;
}

export function KanaQuizDialog({
  isActive,
  onClose,
  lives,
  score,
  char,
  options,
  input, // Add this
  feedback,
  gameOver,
  onOptionClick,
  startQuiz,
  type,
  themeColor,
  themeBorder,
  themeAccent,
}: KanaQuizDialogProps) {
  const isHira = type === "hiragana";

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
                  </div>
                  <div className={`px-3 py-1.5 rounded-lg bg-muted border border-border text-xs font-bold uppercase tracking-widest ${themeColor}`}>
                    {isHira ? "Hiragana" : "Katakana"} Quiz
                  </div>
                </header>

                {!gameOver ? (
                  <div className="flex flex-col items-center">
                    <div className={`w-full aspect-video bg-background rounded-2xl border ${feedback === 'correct' ? 'border-success shadow-lg' : feedback === 'incorrect' ? 'border-destructive shadow-lg' : 'border-border shadow-inner'} flex items-center justify-center mb-8 transition-all duration-300`}>
                      <AnimatePresence mode="wait">
                        <motion.span
                          key={char?.char}
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.5 }}
                          className="text-5xl sm:text-7xl font-black text-foreground font-japanese"
                        >
                          {char?.char}
                        </motion.span>
                      </AnimatePresence>
                    </div>

                    <div className="grid grid-cols-2 gap-3 w-full">
                      {options.map((option, i) => {
                        const isCorrect = option === char?.romaji;
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
                            key={i}
                            type="button"
                            onClick={() => onOptionClick(option)}
                            disabled={!!feedback}
                            variant="outline"
                            className={`h-14 rounded-xl text-lg font-black uppercase tracking-widest transition-all duration-300 ${btnClass}`}
                          >
                            {option}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <Card className="bg-muted/20 p-8 md:p-10 rounded-2xl border border-border text-center w-full relative overflow-hidden shadow-2xl">
                    <div className="w-16 h-16 bg-destructive/10 rounded-xl flex items-center justify-center mx-auto mb-6 border border-destructive/20">
                      <Heart size={32} className="text-destructive" />
                    </div>
                    <h2 className="text-2xl font-black text-foreground uppercase tracking-tight mb-2">Game Over!</h2>
                    <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest mb-6">Skor akhir kamu:</p>
                    <div className="text-5xl md:text-6xl font-black text-warning mb-8 drop-shadow-md">
                      {score}
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
