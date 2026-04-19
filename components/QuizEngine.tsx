/**
 * @file QuizEngine.tsx
 * @description Mesin kuis interaktif yang digunakan dalam pelajaran untuk menguji pemahaman pengguna secara real-time.
 * @module QuizEngine
 */

"use client";

// ======================
// IMPORTS
// ======================
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useProgress } from "@/context/UserProgressContext";
import { sounds } from "@/lib/audio";
import XPPop from "./XPPop";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trophy, Target, RefreshCw, ArrowRight, Brain, AlertCircle } from "lucide-react";

// ======================
// TYPES
// ======================
interface QuizProps {
  questions: Array<{
    question: string;
    options: string[];
    answer: string;
    explanation?: string;
  }>;
}

// ======================
// MAIN EXECUTION
// ======================

/**
 * Komponen QuizEngine: Menangani logika kuis, perhitungan skor, dan pemberian XP.
 * 
 * @param {QuizProps} props - Daftar pertanyaan kuis.
 * @returns {JSX.Element} Antarmuka kuis.
 */
export default function QuizEngine({ questions }: QuizProps) {
  // State Management
  const [isClient, setIsClient] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [showXP, setShowXP] = useState(false);
  const [xpGained, setXpGained] = useState(0);

  const { progress, updateProgress } = useProgress();
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient || !questions || questions.length === 0) return null;

  const currentQ = questions[currentIndex];

  // ======================
  // HELPER FUNCTIONS
  // ======================

  /**
   * Menangani pemilihan opsi jawaban.
   */
  const handleSelect = (option: string) => {
    if (isAnswered) return;

    setSelectedOption(option);
    setIsAnswered(true);

    const isCorrect = option === currentQ.answer;

    if (isCorrect) {
      sounds?.playSuccess();
      setScore((prev) => prev + 1);
    } else {
      sounds?.playError();
    }

    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        setSelectedOption(null);
        setIsAnswered(false);
      } else {
        handleFinish(score + (isCorrect ? 1 : 0));
      }
    }, 1500);
  };

  /**
   * Menyelesaikan sesi kuis dan menghitung XP.
   */
  const handleFinish = (finalScore: number) => {
    setIsFinished(true);
    const baseXP = finalScore * 25;
    const bonusXP = finalScore === questions.length ? 50 : 0;
    const totalXP = baseXP + bonusXP;

    if (totalXP > 0) {
      setXpGained(totalXP);
      setShowXP(true);
      updateProgress(progress.xp + totalXP, progress.srs);
      setTimeout(() => setShowXP(false), 2000);
    }
  };

  /**
   * Mereset ulang kuis.
   */
  const resetQuiz = () => {
    setCurrentIndex(0);
    setScore(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setIsFinished(false);
  };

  // ======================
  // RENDER: FINISHED STATE
  // ======================

  if (isFinished) {
    const percentage = Math.round((score / questions.length) * 100);
    const isPerfect = percentage === 100;

    return (
      <Card className="bg-cyber-surface p-10 md:p-16 rounded-[4rem] border-white/5 text-center relative overflow-hidden neo-card shadow-none">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
          <XPPop show={showXP} amount={xpGained} />
        </div>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative z-10"
        >
          <div className="mb-8 inline-block">
            <Card
              className={`w-28 h-28 rounded-[2.5rem] border flex items-center justify-center text-4xl neo-inset shadow-none ${
                isPerfect
                  ? "bg-red-500/10 border-red-500/30 shadow-[0_0_40px_rgba(239,68,68,0.2)]"
                  : "bg-amber-500/10 border-amber-500/30"
              }`}
            >
              {isPerfect ? <Trophy size={56} className="text-red-500" /> : <Target size={56} className="text-amber-500" />}
            </Card>
          </div>

          <Badge variant="outline" className="border-red-500/20 text-red-500 font-black text-[10px] uppercase tracking-[0.5em] mb-6 h-auto px-6 py-2 rounded-xl neo-inset bg-red-500/5">
            Mission Evaluation
          </Badge>
          
          <h2 className="text-5xl md:text-6xl font-black text-white italic uppercase tracking-tighter mb-4">
            {isPerfect ? "Operation Flawless" : "Mission Complete"}
          </h2>

          <div className="flex items-center justify-center gap-10 my-12">
            <div className="text-center">
              <p className="text-slate-500 text-[11px] font-black uppercase tracking-widest mb-2">
                Score Rank
              </p>
              <p className="text-5xl font-black text-white italic">
                {score}<span className="text-xl opacity-20 not-italic mx-1">/</span>{questions.length}
              </p>
            </div>
            <div className="w-px h-16 bg-white/5" />
            <div className="text-center">
              <p className="text-slate-500 text-[11px] font-black uppercase tracking-widest mb-2">
                Accuracy
              </p>
              <p className={`text-5xl font-black italic ${isPerfect ? "text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]" : "text-amber-500"}`}>
                {percentage}%
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 mt-10">
            <Button
              onClick={resetQuiz}
              variant="ghost"
              className="w-full sm:w-auto h-auto px-10 py-5 bg-black/40 text-slate-400 font-black rounded-2xl hover:bg-white hover:text-black transition-all uppercase tracking-widest text-[10px] border border-white/5 neo-inset"
            >
              <RefreshCw size={18} className="mr-3" /> Re-Deploy
            </Button>
            <Button
              onClick={() => {
                const basePath = window.location.pathname.replace(/\/[^/]+$/, "");
                router.push(basePath || "/courses");
              }}
              className="w-full sm:w-auto h-auto px-10 py-5 bg-red-500 hover:bg-white text-black font-black rounded-2xl transition-all uppercase tracking-[0.2em] text-[10px] shadow-[0_0_25px_rgba(239,68,68,0.4)] border-none"
            >
              Next Module <ArrowRight size={18} className="ml-3" />
            </Button>
          </div>
        </motion.div>
      </Card>
    );
  }

  // ======================
  // RENDER: ACTIVE QUIZ
  // ======================
  return (
    <Card className="bg-cyber-surface p-8 md:p-12 rounded-[4rem] border-white/5 shadow-none relative overflow-hidden neo-card">
      {/* HUD Background elements */}
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
                  PHASE_0{currentIndex + 1}
                </Badge>
                <span className="block text-slate-500 text-[10px] font-black uppercase mt-1">Intelligence Test</span>
             </div>
          </div>
          <div className="flex items-center gap-3 font-black text-sm italic">
            <span className="text-red-500 text-2xl drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]">{currentIndex + 1}</span>
            <span className="text-white/10 text-xl">/</span>
            <span className="text-white/40">{questions.length}</span>
          </div>
        </header>

        <Progress
          value={(currentIndex / questions.length) * 100}
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
                    <span className="text-[10px] text-red-500 font-black uppercase tracking-[0.4em]">Strategic Intel</span>
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

