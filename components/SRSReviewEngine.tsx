"use client";

import { useState } from "react";
import { useProgress } from "@/context/UserProgressContext";
import { updateCardState } from "@/lib/srs";
import TTSReader from "./TTSReader";
import { motion, AnimatePresence } from "framer-motion";

export default function SRSReviewEngine({ cards }: { cards: any[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [direction, setDirection] = useState(0); // 1 untuk kanan, -1 untuk kiri
  const { progress, updateProgress } = useProgress();

  const currentCard = cards[currentIndex];

  const handleAnswer = (correct: boolean) => {
    const cardId = currentCard._id;
    const currentState = progress.srs[cardId];
    const newState = updateCardState(currentState, correct);

    setDirection(correct ? 1 : -1);
    updateProgress(progress.xp + (correct ? 10 : 2), {
      ...progress.srs,
      [cardId]: newState,
    });

    setIsFlipped(false);
    setTimeout(() => {
      if (currentIndex < cards.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setDirection(0);
      } else {
        window.location.reload();
      }
    }, 200);
  };

  return (
    <div className="w-full overflow-hidden">
      {/* Progress Bar */}
      <div className="w-full bg-white/5 h-1 rounded-full mb-12">
        <motion.div
          className="bg-[#0ef] h-full shadow-[0_0_10px_#0ef]"
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
        >
          {/* Card Body */}
          <motion.div
            onClick={() => !isFlipped && setIsFlipped(true)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`relative aspect-[4/5] md:aspect-square glass-card flex flex-col items-center justify-center p-8 cursor-pointer transition-colors duration-500 ${isFlipped ? "border-[#0ef]/30 shadow-[0_0_40px_rgba(0,255,239,0.1)]" : "hover:border-white/20"}`}
          >
            {!isFlipped ? (
              <div className="text-center">
                <motion.h2
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className="text-7xl font-black text-white tracking-tighter mb-4"
                >
                  {currentCard.word}
                </motion.h2>
                <p className="text-[#0ef]/40 text-[10px] font-black uppercase tracking-[0.4em] animate-pulse">
                  Tap to reveal
                </p>
              </div>
            ) : (
              <motion.div
                initial={{ rotateY: 180, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                className="text-center w-full"
              >
                <ruby className="text-5xl font-black text-white mb-2">
                  {currentCard.word}
                  <rt className="text-base text-[#0ef] font-bold">
                    {currentCard.furigana}
                  </rt>
                </ruby>
                <p className="text-[#c4cfde]/60 font-mono mb-8">
                  {currentCard.romaji}
                </p>

                <div className="bg-[#0ef]/5 border border-[#0ef]/10 p-6 rounded-2xl mb-8">
                  <p className="text-2xl font-black text-green-400 uppercase tracking-tight">
                    {currentCard.meaning}
                  </p>
                </div>

                <TTSReader text={currentCard.word} minimal={true} />
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* SRS Controls */}
      <AnimatePresence>
        {isFlipped && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="grid grid-cols-2 gap-4 mt-8"
          >
            <button
              onClick={() => handleAnswer(false)}
              className="p-6 bg-red-500/10 border border-red-500/20 rounded-[2rem] text-red-400 font-black uppercase tracking-widest hover:bg-red-500/20 active:scale-95 transition-all"
            >
              Lupa ❌
            </button>
            <button
              onClick={() => handleAnswer(true)}
              className="p-6 bg-green-500/10 border border-green-500/20 rounded-[2rem] text-green-400 font-black uppercase tracking-widest hover:bg-green-500/20 active:scale-95 transition-all shadow-[0_0_20px_rgba(34,197,94,0.1)]"
            >
              Ingat ✅
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
