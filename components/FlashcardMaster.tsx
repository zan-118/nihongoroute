"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useProgress } from "@/context/UserProgressContext";
import { updateCardState } from "@/lib/srs";
import { sounds } from "@/lib/audio";
import TTSReader from "./TTSReader";
import XPPop from "./XPPop";

export default function FlashcardMaster({
  cards,
  type = "vocab",
}: {
  cards: any[];
  type?: "vocab" | "kanji";
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [direction, setDirection] = useState(0);
  const [showXP, setShowXP] = useState(false);

  const { progress, updateProgress } = useProgress();

  if (!cards || cards.length === 0) return null;

  const card = cards[currentIndex];

  const handleAnswer = (correct: boolean) => {
    const cardId = card._id || card.id;
    const currentState = progress.srs[cardId] || {
      interval: 1,
      repetition: 0,
      easeFactor: 2.5,
      nextReview: Date.now(),
    };

    // SFX & XP Animation
    if (correct) {
      sounds?.playSuccess();
      setShowXP(true);
      setTimeout(() => setShowXP(false), 800);
    } else {
      sounds?.playError();
    }

    setDirection(correct ? 1 : -1);
    const newState = updateCardState(currentState, correct);

    updateProgress(progress.xp + (correct ? 15 : 5), {
      ...progress.srs,
      [cardId]: newState,
    });

    setIsFlipped(false);
    setTimeout(() => {
      if (currentIndex < cards.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setDirection(0);
      } else {
        const basePath = window.location.pathname.replace(
          /\/(flashcards|kanji)$/,
          "",
        );
        window.location.href = basePath || "/jlpt";
      }
    }, 200);
  };

  return (
    <div className="w-full max-w-xl mx-auto relative">
      {/* XP Pop Animation */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
        <XPPop show={showXP} amount={15} />
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-white/5 h-1.5 rounded-full mb-10 overflow-hidden">
        <motion.div
          className={`h-full shadow-[0_0_15px] ${type === "kanji" ? "bg-purple-500 shadow-purple-500/50" : "bg-[#0ef] shadow-[#0ef]/50"}`}
          initial={{ width: 0 }}
          animate={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: direction * -300, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className={`relative aspect-[4/5] md:aspect-square glass-card flex flex-col items-center justify-center p-8 cursor-pointer transition-all ${isFlipped ? "border-[#0ef]/30 shadow-[0_0_40px_rgba(0,255,239,0.1)]" : "hover:border-white/20"}`}
          onClick={() => {
            if (!isFlipped) {
              sounds?.playPop();
              setIsFlipped(true);
            }
          }}
        >
          {!isFlipped ? (
            <div className="text-center">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 mb-8 block">
                Tebak Arti & Bacaan
              </span>
              <h2
                className={`${card.word.length > 5 ? "text-6xl" : "text-8xl md:text-9xl"} font-black text-white tracking-tighter`}
              >
                {card.word}
              </h2>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center w-full"
            >
              {type === "kanji" && card.details && (
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-blue-500/10 p-3 rounded-2xl border border-blue-500/20">
                    <span className="text-[8px] text-blue-400 block font-black uppercase mb-1">
                      Onyomi
                    </span>
                    <span className="text-white text-sm font-bold">
                      {card.details.onyomi || "-"}
                    </span>
                  </div>
                  <div className="bg-orange-500/10 p-3 rounded-2xl border border-orange-500/20">
                    <span className="text-[8px] text-orange-400 block font-black uppercase mb-1">
                      Kunyomi
                    </span>
                    <span className="text-white text-sm font-bold">
                      {card.details.kunyomi || "-"}
                    </span>
                  </div>
                </div>
              )}

              <ruby className="text-4xl md:text-5xl font-black text-white mb-2">
                {card.word}
                <rt className="text-sm text-[#0ef] font-bold uppercase">
                  {card.furigana || card.romaji}
                </rt>
              </ruby>

              <div className="my-6 p-6 bg-white/5 rounded-[2rem] border border-white/5">
                <h3 className="text-2xl md:text-3xl font-black text-green-400 uppercase italic tracking-tight leading-tight">
                  {card.meaning}
                </h3>
              </div>

              <TTSReader text={card.word} minimal={true} />
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Kontrol SRS */}
      {isFlipped && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="grid grid-cols-2 gap-4 mt-8"
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAnswer(false);
            }}
            className="p-6 bg-red-500/10 border border-red-500/20 rounded-[2rem] text-red-400 font-black uppercase text-xs tracking-widest hover:bg-red-500/20 active:scale-95 transition-all"
          >
            Lupa ❌
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAnswer(true);
            }}
            className="p-6 bg-green-500/10 border border-green-500/20 rounded-[2rem] text-green-400 font-black uppercase text-xs tracking-widest hover:bg-green-500/20 active:scale-95 transition-all shadow-[0_0_20px_rgba(34,197,94,0.1)]"
          >
            Ingat ✅
          </button>
        </motion.div>
      )}
    </div>
  );
}
