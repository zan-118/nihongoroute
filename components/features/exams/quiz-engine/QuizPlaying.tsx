import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Brain, AlertCircle } from "lucide-react";
import { QuizQuestion } from "./types";

interface QuizPlayingProps {
  currentQ: QuizQuestion;
  currentIndex: number;
  totalQuestions: number;
  selectedOption: string | null;
  isAnswered: boolean;
  handleSelect: (option: string) => void;
}

export function QuizPlaying({
  currentQ,
  currentIndex,
  totalQuestions,
  selectedOption,
  isAnswered,
  handleSelect,
}: QuizPlayingProps) {
  return (
    <Card className="bg-card p-5 md:p-12 rounded-[2rem] md:rounded-[4rem] border-border shadow-none relative overflow-hidden neo-card">
      <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/5 blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-red-500/5 blur-[80px] pointer-events-none" />

      <div className="relative z-10">
        <header className="flex justify-between items-center mb-4 md:mb-6">
          <div className="flex items-center gap-2 md:gap-4">
             <Card className="w-9 h-9 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-muted border border-border flex items-center justify-center neo-inset shadow-none">
                <Brain size={18} className="text-red-500 md:w-6 md:h-6" />
             </Card>
              <div className="text-left">
                <Badge variant="outline" className="text-red-600 dark:text-red-500 font-bold text-[10px] md:text-xs tracking-widest uppercase bg-red-500/5 px-2 py-0.5 md:px-3 md:py-1 rounded-lg border-red-500/20 neo-inset h-auto">
                   TAHAP {currentIndex + 1}
                </Badge>
                <span className="hidden sm:block text-muted-foreground text-[10px] font-bold uppercase tracking-widest mt-1">Tes Pemahaman</span>
              </div>
          </div>
          <div className="flex items-center gap-2 md:gap-3 font-black text-sm italic">
            <span className="text-red-600 dark:text-red-500 text-xl md:text-2xl drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]">{currentIndex + 1}</span>
            <span className="text-muted-foreground/10 text-lg md:text-xl">/</span>
            <span className="text-muted-foreground/40">{totalQuestions}</span>
          </div>
        </header>

        <Progress
          value={(currentIndex / totalQuestions) * 100}
          className="h-1.5 md:h-2 mb-8 md:mb-12 bg-muted"
          indicatorClassName="bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)]"
        />

        <div className="mb-8 md:mb-14 min-h-[100px] md:min-h-[140px] flex items-center">
          <AnimatePresence mode="wait">
            <motion.h3
              key={currentIndex}
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -30, opacity: 0 }}
              className="text-2xl md:text-5xl font-black text-foreground leading-tight tracking-tighter uppercase"
            >
              {currentQ.question}
            </motion.h3>
          </AnimatePresence>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5">
          <AnimatePresence mode="wait">
            {currentQ.options.map((option, index) => {
              const isSelected = selectedOption === option;
              const isCorrect = option === currentQ.answer;

              let buttonStyle = "bg-muted/50 border-border text-muted-foreground hover:border-primary/50 hover:bg-muted neo-card";
              let statusIcon = null;

              if (isAnswered) {
                if (isCorrect) {
                  buttonStyle = "bg-emerald-500/10 border-emerald-500/50 text-emerald-600 dark:text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.2)] neo-card scale-105 z-10";
                  statusIcon = "✓";
                } else if (isSelected && !isCorrect) {
                  buttonStyle = "bg-red-500/10 border-red-500/50 text-red-600 dark:text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.2)] neo-card z-10";
                  statusIcon = "✗";
                } else {
                  buttonStyle = "bg-muted/20 border-transparent text-muted-foreground/20 scale-95 opacity-40 neo-card grayscale";
                }
              }

              return (
                <motion.button
                  key={`${currentIndex}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  disabled={isAnswered}
                  onClick={() => handleSelect(option)}
                  className={`relative p-4 md:p-8 rounded-2xl md:rounded-3xl border text-left transition-all duration-500 h-auto group ${buttonStyle}`}
                >
                  <div className="flex items-center gap-4 md:gap-6">
                    <Card className={`w-8 h-8 md:w-10 md:h-10 shrink-0 rounded-lg md:rounded-xl flex items-center justify-center text-[10px] md:text-xs font-black uppercase neo-inset shadow-none transition-colors ${isSelected ? 'bg-foreground text-background border-none' : 'bg-muted text-muted-foreground border-border'}`}>
                      {String.fromCharCode(65 + index)}
                    </Card>
                    <span className="flex-1 text-base md:text-2xl font-black uppercase tracking-tight leading-tight">{option}</span>

                    {statusIcon && (
                      <motion.span
                        initial={{ scale: 0, rotate: -45 }}
                        animate={{ scale: 1, rotate: 0 }}
                        className="text-2xl md:text-3xl font-black"
                      >
                        {statusIcon}
                      </motion.span>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {isAnswered && currentQ.explanation && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 md:mt-10"
            >
               <Card className="bg-red-500/5 border-l-4 border-l-red-500 p-5 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-border neo-inset shadow-none">
                  <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-4">
                     <AlertCircle size={16} className="text-red-500 md:w-5 md:h-5" />
                     <span className="text-[10px] md:text-xs text-red-600 dark:text-red-500 font-bold uppercase tracking-widest">Penjelasan Materi</span>
                  </div>
                  <p className="text-muted-foreground text-sm md:text-lg leading-relaxed font-medium">
                   {currentQ.explanation}
                 </p>
               </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
}
