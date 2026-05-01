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
    <Card className="bg-cyber-surface p-8 md:p-12 rounded-[4rem] border-white/5 shadow-none relative overflow-hidden neo-card">
      <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/5 blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-red-500/5 blur-[80px] pointer-events-none" />

      <div className="relative z-10">
        <header className="flex justify-between items-end mb-6">
          <div className="flex items-center gap-4">
             <Card className="w-12 h-12 rounded-2xl bg-black/40 border-white/5 flex items-center justify-center neo-inset shadow-none">
                <Brain size={22} className="text-red-500" />
             </Card>
             <div className="text-left">
                <Badge variant="outline" className="text-red-500 font-black text-[9px] tracking-[0.3em] uppercase bg-red-500/5 px-3 py-1 rounded-lg border-red-500/20 neo-inset h-auto">
                  Tahap 0{currentIndex + 1}
                </Badge>
                <span className="block text-slate-500 text-[10px] font-black uppercase mt-1">Tes Pemahaman</span>
             </div>
          </div>
          <div className="flex items-center gap-3 font-black text-sm italic">
            <span className="text-red-500 text-2xl drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]">{currentIndex + 1}</span>
            <span className="text-white/10 text-xl">/</span>
            <span className="text-white/40">{totalQuestions}</span>
          </div>
        </header>

        <Progress
          value={(currentIndex / totalQuestions) * 100}
          className="h-2 mb-12 bg-black/40"
          indicatorClassName="bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)]"
        />

        <div className="mb-14 min-h-[140px] flex items-center">
          <AnimatePresence mode="wait">
            <motion.h3
              key={currentIndex}
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -30, opacity: 0 }}
              className="text-3xl md:text-5xl font-black text-white leading-tight tracking-tighter italic uppercase"
            >
              {currentQ.question}
            </motion.h3>
          </AnimatePresence>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <AnimatePresence mode="wait">
            {currentQ.options.map((option, index) => {
              const isSelected = selectedOption === option;
              const isCorrect = option === currentQ.answer;

              let buttonStyle = "bg-black/20 border-white/5 text-slate-400 hover:border-white/20 hover:bg-black/40 neo-card";
              let statusIcon = null;

              if (isAnswered) {
                if (isCorrect) {
                  buttonStyle = "bg-emerald-500/10 border-emerald-500/50 text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.2)] neo-card scale-105 z-10";
                  statusIcon = "✓";
                } else if (isSelected && !isCorrect) {
                  buttonStyle = "bg-red-500/10 border-red-500/50 text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.2)] neo-card z-10";
                  statusIcon = "✗";
                } else {
                  buttonStyle = "bg-black/10 border-transparent text-white/10 scale-95 opacity-40 neo-card grayscale";
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
                  className={`relative p-6 md:p-8 rounded-3xl border text-left transition-all duration-500 h-auto group ${buttonStyle}`}
                >
                  <div className="flex items-center gap-6">
                    <Card className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center text-xs font-black uppercase neo-inset shadow-none transition-colors ${isSelected ? 'bg-white text-black' : 'bg-black/40 text-white/30 border-white/5'}`}>
                      {String.fromCharCode(65 + index)}
                    </Card>
                    <span className="flex-1 text-xl md:text-2xl font-black uppercase italic tracking-tight">{option}</span>

                    {statusIcon && (
                      <motion.span
                        initial={{ scale: 0, rotate: -45 }}
                        animate={{ scale: 1, rotate: 0 }}
                        className="text-3xl font-black"
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
              className="mt-10"
            >
              <Card className="bg-red-500/5 border-l-4 border-l-red-500 p-8 rounded-[2rem] border-y-white/5 border-r-white/5 neo-inset shadow-none">
                 <div className="flex items-center gap-3 mb-3">
                    <AlertCircle size={18} className="text-red-500" />
                    <span className="text-[10px] text-red-500 font-black uppercase tracking-[0.4em]">Penjelasan</span>
                 </div>
                 <p className="text-slate-300 text-base md:text-lg leading-relaxed italic font-medium">
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
