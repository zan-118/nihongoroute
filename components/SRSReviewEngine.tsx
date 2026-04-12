"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useProgress } from "@/context/UserProgressContext";
import { updateCardState, createNewCardState } from "@/lib/srs";
import TTSReader from "./TTSReader";
import { motion, AnimatePresence } from "framer-motion";
import { updateProgressOnReview } from "@/lib/progress";

// 1. Definisikan Interface TypeScript
export interface FlashcardType {
  _id: string;
  word: string;
  meaning: string;
  furigana?: string;
  romaji?: string;
}

export default function SRSReviewEngine({ cards }: { cards: FlashcardType[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [direction, setDirection] = useState(0);
  const [isClient, setIsClient] = useState(false);

  const { progress, updateProgress } = useProgress();
  const router = useRouter();

  const SESSION_KEY = "nihongo_srs_review_session_index";

  useEffect(() => {
    setIsClient(true);
    const savedIndex = localStorage.getItem(SESSION_KEY);
    if (savedIndex !== null) {
      const parsedIndex = parseInt(savedIndex, 10);
      if (!isNaN(parsedIndex) && parsedIndex < cards.length) {
        setCurrentIndex(parsedIndex);
      } else {
        localStorage.removeItem(SESSION_KEY);
      }
    }
  }, [cards.length]);

  if (!isClient || !cards || cards.length === 0) {
    return (
      <section className="flex flex-col items-center justify-center py-20 text-white/50">
        <h2 className="text-xl font-black uppercase tracking-widest mb-2">
          Review Selesai
        </h2>
        <p className="text-sm">Tidak ada kartu yang jatuh tempo saat ini.</p>
      </section>
    );
  }

  const currentCard = cards[currentIndex];

  const handleAnswer = (correct: boolean) => {
    updateProgressOnReview();

    const cardId = currentCard._id;
    // 2. PERBAIKAN BUG KRITIS: Fallback jika kartu belum ada di memori
    const currentState = progress.srs[cardId] || createNewCardState();
    const newState = updateCardState(currentState, correct);

    setDirection(correct ? 1 : -1);

    updateProgress(progress.xp + (correct ? 10 : 2), {
      ...progress.srs,
      [cardId]: newState,
    });

    setIsFlipped(false);

    setTimeout(() => {
      if (currentIndex < cards.length - 1) {
        const nextIndex = currentIndex + 1;
        setCurrentIndex(nextIndex);
        setDirection(0);
        localStorage.setItem(SESSION_KEY, nextIndex.toString());
      } else {
        localStorage.removeItem(SESSION_KEY);
        // 3. PENGGUNAAN ROUTER NEXT.JS
        router.push("/dashboard");
      }
    }, 200);
  };

  return (
    <section className="w-full max-w-xl mx-auto relative perspective-1000">
      <header className="flex justify-between items-end mb-3 px-2">
        <span className="text-cyber-neon font-mono text-[10px] tracking-[0.2em] uppercase font-black">
          [System.SRS_Active]
        </span>
        <div className="flex items-center gap-2 font-mono">
          <span className="text-white font-bold text-sm">
            {String(currentIndex + 1).padStart(2, "0")}
          </span>
          <span className="text-white/20 text-xs">/</span>
          <span className="text-white/40 text-xs">
            {String(cards.length).padStart(2, "0")}
          </span>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="w-full bg-cyber-bg h-1.5 rounded-full mb-10 overflow-hidden shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]">
        <motion.div
          className="bg-cyber-neon h-full shadow-[0_0_15px_rgba(0,255,239,0.8)]"
          initial={{ width: 0 }}
          animate={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
          transition={{ ease: "circOut", duration: 0.5 }}
        />
      </div>

      <div className="relative aspect-[4/5] md:aspect-square w-full">
        <AnimatePresence initial={false} mode="wait">
          {/* 4. MENGGUNAKAN <article> UNTUK SEMANTIK KARTU */}
          <motion.article
            key={currentIndex + (isFlipped ? "-back" : "-front")}
            initial={
              isFlipped
                ? { rotateY: 90, opacity: 0 }
                : {
                    x: direction === 1 ? 300 : direction === -1 ? -300 : 0,
                    opacity: 0,
                  }
            }
            animate={
              isFlipped ? { rotateY: 0, opacity: 1 } : { x: 0, opacity: 1 }
            }
            exit={
              isFlipped
                ? { rotateY: -90, opacity: 0 }
                : {
                    x: direction === 1 ? -300 : direction === -1 ? 300 : 0,
                    opacity: 0,
                  }
            }
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            // 5. MENGGUNAKAN TAILWIND CONFIG CUSTOM
            className={`absolute inset-0 w-full h-full flex flex-col items-center justify-center p-8 cursor-pointer rounded-[2.5rem] border transition-all duration-500 overflow-hidden
              ${
                isFlipped
                  ? "bg-[#1a1c20] border-cyber-neon/30 shadow-[0_0_40px_rgba(0,255,239,0.1)]"
                  : "bg-cyber-surface border-white/5 shadow-neumorphic hover:border-white/10"
              }`}
            onClick={() => !isFlipped && setIsFlipped(true)}
          >
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] opacity-20 pointer-events-none" />

            {!isFlipped ? (
              <div className="text-center relative z-10 w-full">
                <div className="absolute -top-16 left-0 right-0 flex justify-center">
                  <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20 bg-cyber-surface px-4 py-1 rounded-full border border-white/5">
                    Uji Memori
                  </span>
                </div>
                <h2 className="text-6xl md:text-8xl font-black text-white tracking-tighter drop-shadow-2xl">
                  {currentCard.word}
                </h2>
                <p className="text-cyber-neon/40 text-[10px] font-black uppercase tracking-[0.4em] mt-8 animate-pulse">
                  Tap to reveal
                </p>
              </div>
            ) : (
              <div className="text-center w-full flex flex-col items-center relative z-10 h-full">
                <header className="mb-6 w-full flex flex-col items-center justify-center mt-4">
                  <p className="text-cyber-neon font-mono font-bold text-sm md:text-base tracking-[0.2em] uppercase mb-1">
                    {currentCard.furigana || currentCard.romaji}
                  </p>
                  <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter drop-shadow-lg">
                    {currentCard.word}
                  </h2>
                </header>

                <div className="w-full mb-6 py-4 px-6 bg-green-500/10 rounded-2xl border-l-4 border-green-500 shadow-[inset_0_0_20px_rgba(34,197,94,0.05)] relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-2 opacity-10">
                    <span className="font-mono text-4xl font-black text-green-500">
                      JP
                    </span>
                  </div>
                  <h3 className="text-xl md:text-2xl font-black text-green-400 uppercase tracking-tight relative z-10">
                    {currentCard.meaning}
                  </h3>
                </div>

                <div className="mt-auto">
                  <TTSReader text={currentCard.word} minimal={false} />
                </div>
              </div>
            )}
          </motion.article>
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isFlipped && (
          <motion.nav
            initial={{ y: 30, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            className="grid grid-cols-2 gap-5 mt-8"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAnswer(false);
              }}
              aria-label="Tandai sebagai Lupa"
              className="group relative p-5 md:p-6 bg-cyber-surface rounded-3xl border border-red-500/20 text-red-400 font-black uppercase tracking-[0.2em] text-[10px] md:text-xs shadow-neumorphic active:shadow-neumorphic-pressed active:translate-y-1 transition-all"
            >
              <div className="absolute inset-0 rounded-3xl bg-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              Lupa ❌
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAnswer(true);
              }}
              aria-label="Tandai sebagai Ingat"
              className="group relative p-5 md:p-6 bg-cyber-surface rounded-3xl border border-green-500/20 text-green-400 font-black uppercase tracking-[0.2em] text-[10px] md:text-xs shadow-[15px_15px_40px_rgba(0,0,0,0.6),-10px_-10px_30px_rgba(255,255,255,0.02),0_0_15px_rgba(34,197,94,0.1)] active:shadow-neumorphic-pressed active:translate-y-1 transition-all"
            >
              <div className="absolute inset-0 rounded-3xl bg-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              Ingat ✅
            </button>
          </motion.nav>
        )}
      </AnimatePresence>
    </section>
  );
}
