"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useProgress } from "@/context/UserProgressContext";
import { sounds } from "@/lib/audio";
import XPPop from "./XPPop";

interface QuizProps {
  questions: Array<{
    question: string;
    options: string[];
    answer: string;
    explanation?: string;
  }>;
}

export default function QuizEngine({ questions }: QuizProps) {
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

  const resetQuiz = () => {
    setCurrentIndex(0);
    setScore(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setIsFinished(false);
  };

  /* ================= RENDERING ================= */

  if (isFinished) {
    const percentage = Math.round((score / questions.length) * 100);
    const isPerfect = percentage === 100;

    return (
      <section className="bg-cyber-surface p-8 md:p-12 rounded-[3rem] border border-white/5 shadow-neumorphic text-center relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
          <XPPop show={showXP} amount={xpGained} />
        </div>

        <div className="absolute top-0 right-0 p-8 opacity-5 text-8xl font-black italic select-none uppercase tracking-tighter">
          Result
        </div>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className="relative z-10"
        >
          <div className="mb-6 inline-block">
            <div
              className={`w-24 h-24 rounded-3xl border flex items-center justify-center text-4xl shadow-inner ${
                isPerfect
                  ? "bg-cyber-neon/10 border-cyber-neon/50 shadow-[0_0_30px_rgba(0,255,239,0.3)]"
                  : "bg-blue-500/10 border-blue-500/50 shadow-[0_0_30px_rgba(59,130,246,0.3)]"
              }`}
            >
              {isPerfect ? "🏆" : "🎯"}
            </div>
          </div>

          <h3 className="text-cyber-neon font-mono text-[10px] uppercase tracking-[0.4em] mb-2 block">
            Mission Evaluation
          </h3>
          <h2 className="text-5xl font-black text-white italic uppercase drop-shadow-md mb-2">
            {isPerfect ? "Flawless" : "Completed"}
          </h2>

          <div className="flex items-center justify-center gap-6 my-8">
            <div className="text-center">
              <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1">
                Score
              </p>
              <p className="text-4xl font-mono font-bold text-white">
                {score}/{questions.length}
              </p>
            </div>
            <div className="w-px h-12 bg-white/10" />
            <div className="text-center">
              <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1">
                Accuracy
              </p>
              <p
                className={`text-4xl font-mono font-bold ${isPerfect ? "text-green-400" : "text-blue-400"}`}
              >
                {percentage}%
              </p>
            </div>
          </div>

          <nav className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <button
              onClick={resetQuiz}
              className="px-8 py-4 bg-cyber-bg text-white/60 font-black rounded-2xl hover:bg-white/5 transition-all uppercase tracking-widest text-[10px] border border-white/5 shadow-inner hover:text-white"
            >
              Retry Mission
            </button>
            <button
              onClick={() => {
                const basePath = window.location.pathname.replace(
                  /\/[^/]+$/,
                  "",
                );
                router.push(basePath || "/courses");
              }}
              className="px-8 py-4 bg-cyber-neon text-cyber-bg font-black rounded-2xl hover:bg-white transition-all uppercase tracking-widest text-[10px] shadow-[0_0_20px_rgba(0,255,239,0.3)] hover:scale-105 active:scale-95"
            >
              Return to Module
            </button>
          </nav>
        </motion.div>
      </section>
    );
  }

  /* ================= ACTIVE QUIZ RENDERING ================= */
  return (
    <section className="bg-cyber-surface p-6 md:p-10 rounded-[3rem] border border-white/5 shadow-neumorphic relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

      <div className="relative z-10">
        <header className="flex justify-between items-end mb-4">
          <span className="text-cyber-neon font-mono text-[10px] tracking-[0.2em] uppercase font-black bg-cyber-neon/10 px-3 py-1 rounded border border-cyber-neon/20">
            [Query_0{currentIndex + 1}]
          </span>
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-white font-bold">{currentIndex + 1}</span>
            <span className="text-white/20">/</span>
            <span className="text-white/40">{questions.length}</span>
          </div>
        </header>

        <div className="w-full bg-cyber-bg h-1.5 rounded-full mb-8 overflow-hidden shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]">
          <motion.div
            className="bg-cyber-neon h-full shadow-[0_0_10px_rgba(0,255,239,0.8)]"
            initial={{ width: 0 }}
            animate={{ width: `${(currentIndex / questions.length) * 100}%` }}
            transition={{ ease: "circOut", duration: 0.5 }}
          />
        </div>

        <div className="mb-10 min-h-[120px] flex items-center">
          <AnimatePresence mode="wait">
            <motion.h3
              key={currentIndex}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="text-2xl md:text-4xl font-black text-white leading-snug tracking-tight drop-shadow-md"
            >
              {currentQ.question}
            </motion.h3>
          </AnimatePresence>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AnimatePresence mode="wait">
            {currentQ.options.map((option, index) => {
              const isSelected = selectedOption === option;
              const isCorrect = option === currentQ.answer;

              let buttonStyle =
                "bg-cyber-bg border-white/5 text-[#c4cfde] hover:border-white/20 shadow-[6px_6px_15px_rgba(0,0,0,0.5),-4px_-4px_10px_rgba(255,255,255,0.02)] active:shadow-[inset_4px_4px_10px_rgba(0,0,0,0.5)]";
              let animation = {};

              if (isAnswered) {
                if (isCorrect) {
                  buttonStyle =
                    "bg-green-500/20 border-green-500/50 text-green-400 shadow-[0_0_20px_rgba(34,197,94,0.3)] z-10";
                  if (isSelected) animation = { scale: 1.05 };
                } else if (isSelected && !isCorrect) {
                  buttonStyle =
                    "bg-red-500/20 border-red-500/50 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.3)] z-10";
                  animation = {
                    x: [-10, 10, -10, 10, 0],
                    transition: { duration: 0.4 },
                  };
                } else {
                  buttonStyle =
                    "bg-cyber-bg/50 border-transparent text-white/20 scale-95 opacity-50";
                }
              }

              return (
                <motion.button
                  key={`${currentIndex}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0, ...animation }}
                  transition={{ delay: index * 0.1 }}
                  disabled={isAnswered}
                  onClick={() => handleSelect(option)}
                  className={`relative p-5 md:p-6 rounded-2xl border text-left font-bold text-lg md:text-xl transition-all duration-300 group ${buttonStyle}`}
                >
                  <div className="flex items-center gap-4">
                    <span className="w-8 h-8 shrink-0 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black uppercase text-white/40">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="flex-1">{option}</span>

                    {isAnswered && isCorrect && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-green-400 text-2xl"
                      >
                        ✓
                      </motion.span>
                    )}
                    {isAnswered && isSelected && !isCorrect && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-red-400 text-2xl"
                      >
                        ✗
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
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: "auto", marginTop: 24 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-blue-500/10 border-l-4 border-blue-500 p-5 rounded-r-2xl">
                <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest mb-1 block">
                  System Note
                </p>
                <p className="text-white/80 text-sm leading-relaxed">
                  {currentQ.explanation}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
