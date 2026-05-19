import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, AlertCircle, ArrowRight, CheckCircle2, XCircle } from "lucide-react";
import { QuizQuestion } from "./types";
import { Button } from "@/components/ui/button";
import { QuizProgress } from "./QuizProgress";

interface QuizPlayingProps {
  currentQ: QuizQuestion;
  currentIndex: number;
  totalQuestions: number;
  selectedOption: string | null;
  isAnswered: boolean;
  handleSelect: (option: string) => void;
  nextQuestion: () => void;
}

export function QuizPlaying({
  currentQ,
  currentIndex,
  totalQuestions,
  selectedOption,
  isAnswered,
  handleSelect,
  nextQuestion,
}: QuizPlayingProps) {
  const isCorrectAnswer = isAnswered && selectedOption === currentQ.answer;

  return (
    <Card className="bg-card p-5 md:p-12 rounded-[2rem] md:rounded-[4rem] border-border shadow-none relative overflow-hidden neo-card">
      <div className="absolute top-0 right-0 w-96 h-96 bg-destructive/5 blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-destructive/5 blur-[80px] pointer-events-none" />

      <div className="relative z-10">
        <header className="flex justify-between items-center mb-4 md:mb-6">
          <div className="flex items-center gap-2 md:gap-4">
             <Card className="w-9 h-9 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-muted border border-border flex items-center justify-center neo-inset shadow-none">
                <Brain size={18} className="text-destructive md:w-6 md:h-6" />
             </Card>
              <div className="text-left">
                <Badge variant="outline" className="text-destructive text-destructive font-bold text-[10px] md:text-xs tracking-widest uppercase bg-destructive/5 px-2 py-0.5 md:px-3 md:py-1 rounded-lg border-destructive/20 neo-inset h-auto">
                   PERTANYAAN {currentIndex + 1}
                </Badge>
                <span className="hidden sm:block text-muted-foreground text-[10px] font-bold uppercase tracking-widest mt-1">Tes Pemahaman</span>
              </div>
          </div>
          <div className="flex items-center gap-2 md:gap-3 font-black text-sm italic">
            <span className="text-destructive text-destructive text-xl md:text-2xl drop-shadow-[0_0_8px_rgba(var(--destructive-rgb),0.5)]">{currentIndex + 1}</span>
            <span className="text-muted-foreground/10 text-lg md:text-xl">/</span>
            <span className="text-muted-foreground/40">{totalQuestions}</span>
          </div>
        </header>

        <QuizProgress
          current={currentIndex + 1}
          total={totalQuestions}
          color="bg-destructive"
          indicatorClassName="shadow-[0_0_15px_rgba(var(--destructive-rgb),0.8)]"
        />
        <div className="mb-8 md:mb-12" />

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

        {/* ─── Result Banner: BENAR / SALAH ─── */}
        <AnimatePresence>
          {isAnswered && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className={`mb-6 md:mb-8 p-4 md:p-5 rounded-2xl md:rounded-3xl flex items-center gap-3 md:gap-4 border ${
                isCorrectAnswer 
                  ? 'bg-success/10 border-success/30 shadow-[0_0_40px_rgba(var(--success-rgb),0.15)]' 
                  : 'bg-destructive/10 border-destructive/30 shadow-[0_0_40px_rgba(var(--destructive-rgb),0.15)]'
              }`}
            >
              <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center shrink-0 ${
                isCorrectAnswer ? 'bg-success/20' : 'bg-destructive/20'
              }`}>
                {isCorrectAnswer 
                  ? <CheckCircle2 className="w-6 h-6 md:w-7 md:h-7 text-success" />
                  : <XCircle className="w-6 h-6 md:w-7 md:h-7 text-destructive" />
                }
              </div>
              <div>
                <p className={`text-sm md:text-base font-black uppercase tracking-widest ${
                  isCorrectAnswer ? 'text-success' : 'text-destructive'
                }`}>
                  {isCorrectAnswer ? '✨ BENAR!' : '✗ SALAH'}
                </p>
                <p className="text-muted-foreground text-xs md:text-sm mt-0.5">
                  {isCorrectAnswer 
                    ? 'Jawaban kamu tepat!' 
                    : `Jawaban yang benar: ${currentQ.answer}`
                  }
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5">
          <AnimatePresence mode="wait">
            {(currentQ.options || []).map((option, index) => {
              const isSelected = selectedOption === option;
              const isCorrect = option === currentQ.answer;

              let buttonStyle = "bg-muted/50 border-border text-muted-foreground md:hover:border-primary/50 md:hover:bg-muted neo-card active:scale-[0.98] transition-transform";
              let statusIcon = null;

              if (isAnswered) {
                if (isCorrect) {
                  buttonStyle = "bg-success/15 border-success/60 text-success shadow-[0_0_30px_rgba(var(--success-rgb),0.2)] neo-card scale-[1.03] z-10 ring-2 ring-success/30";
                  statusIcon = <CheckCircle2 className="w-6 h-6 md:w-7 md:h-7 text-success" />;
                } else if (isSelected && !isCorrect) {
                  buttonStyle = "bg-destructive/15 border-destructive/60 text-destructive shadow-[0_0_30px_rgba(var(--destructive-rgb),0.2)] neo-card z-10 ring-2 ring-destructive/30";
                  statusIcon = <XCircle className="w-6 h-6 md:w-7 md:h-7 text-destructive" />;
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
                    <Card className={`w-8 h-8 md:w-10 md:h-10 shrink-0 rounded-lg md:rounded-xl flex items-center justify-center text-[10px] md:text-xs font-black uppercase neo-inset shadow-none transition-colors ${
                      isAnswered && isCorrect 
                        ? 'bg-success text-success-foreground border-none' 
                        : isAnswered && isSelected && !isCorrect
                          ? 'bg-destructive text-destructive-foreground border-none'
                          : isSelected 
                            ? 'bg-foreground text-background border-none' 
                            : 'bg-muted text-muted-foreground border-border'
                    }`}>
                      {String.fromCharCode(65 + index)}
                    </Card>
                    <span className="flex-1 text-base md:text-2xl font-black uppercase tracking-tight leading-tight">{option}</span>

                    {statusIcon && (
                      <motion.span
                        initial={{ scale: 0, rotate: -45 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 20 }}
                        className="shrink-0"
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
          {isAnswered && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 md:mt-10 flex flex-col gap-6"
            >
              {currentQ.explanation && (
                <Card className={`border-l-4 p-5 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-border neo-inset shadow-none ${
                  isCorrectAnswer 
                    ? 'bg-success/5 border-l-success' 
                    : 'bg-destructive/5 border-l-destructive'
                }`}>
                  <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-4">
                     <AlertCircle size={16} className={`md:w-5 md:h-5 ${isCorrectAnswer ? 'text-success' : 'text-destructive'}`} />
                     <span className={`text-[10px] md:text-xs font-bold uppercase tracking-widest ${isCorrectAnswer ? 'text-success' : 'text-destructive'}`}>Pembahasan</span>
                  </div>
                  <p className="text-muted-foreground text-sm md:text-lg leading-relaxed font-medium">
                   {currentQ.explanation}
                 </p>
                </Card>
              )}
              
              <Button 
                onClick={nextQuestion}
                className="w-full py-6 md:py-8 rounded-[1.5rem] md:rounded-[2rem] bg-destructive hover:bg-destructive/90 text-destructive-foreground font-black text-sm md:text-lg uppercase tracking-widest shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Lanjut Ke Soal Berikutnya <ArrowRight size={20} className="ml-3" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
}
