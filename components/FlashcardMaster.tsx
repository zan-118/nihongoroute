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

  // Helper untuk menarik SVG Stroke Order
  const getStrokeImageUrl = (char: string) => {
    const code = char.charCodeAt(0).toString(16).padStart(5, "0");
    return `https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/${code}.svg`;
  };

  const handleAnswer = (correct: boolean) => {
    const cardId = card._id || card.id;
    const currentState = progress.srs[cardId] || {
      interval: 1,
      repetition: 0,
      easeFactor: 2.5,
      nextReview: Date.now(),
    };

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
      {/* XP Animation Layer */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
        <XPPop show={showXP} amount={15} />
      </div>

      {/* Modern Progress Bar */}
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
          className={`relative aspect-[4/5] md:aspect-square glass-card flex flex-col items-center justify-center p-8 cursor-pointer transition-all ${isFlipped ? "border-[#0ef]/30 shadow-[0_0_40px_rgba(0,255,239,0.15)]" : "hover:border-white/20"}`}
          onClick={() => {
            if (!isFlipped) {
              sounds?.playPop();
              setIsFlipped(true);
            }
          }}
        >
          {!isFlipped ? (
            /* --- FRONT SIDE --- */
            <div className="text-center">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 mb-8 block italic">
                Tebak Arti & Bacaan
              </span>
              <h2
                className={`${card.word.length > 5 ? "text-6xl" : "text-9xl"} font-black text-white tracking-tighter italic`}
              >
                {card.word}
              </h2>
            </div>
          ) : (
            /* --- BACK SIDE (FLIPPED) --- */
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center w-full flex flex-col items-center"
            >
              {/* 1. Stroke Order Display */}
              {type === "kanji" && (
                <div className="mb-8">
                  <div className="w-36 h-36 bg-white rounded-[2.5rem] p-4 shadow-2xl flex items-center justify-center group overflow-hidden border-4 border-white/10 transition-transform hover:scale-105">
                    <img
                      src={getStrokeImageUrl(card.word[0])}
                      alt="Stroke Order"
                      className="w-full h-full object-contain grayscale transition-all group-hover:grayscale-0"
                    />
                  </div>
                  <p className="text-[9px] font-black text-[#0ef] uppercase tracking-[0.3em] mt-3 opacity-40">
                    Stroke Order
                  </p>
                </div>
              )}

              {/* 2. Main Character & Rubies */}
              <div className="mb-6">
                <ruby className="text-6xl md:text-7xl font-black text-white italic tracking-tighter">
                  {card.word}
                  <rt className="text-sm text-[#0ef] font-bold uppercase tracking-[0.2em] mb-2">
                    {card.furigana || card.romaji}
                  </rt>
                </ruby>
              </div>

              {/* 3. Meaning Box */}
              <div className="w-full mb-6 py-5 px-4 bg-gradient-to-r from-green-500/15 to-transparent rounded-[2rem] border border-green-500/20">
                <h3 className="text-2xl md:text-3xl font-black text-green-400 uppercase italic tracking-tight leading-tight">
                  {card.meaning}
                </h3>
              </div>

              {/* 4. Onyomi & Kunyomi Info */}
              {type === "kanji" && card.details && (
                <div className="grid grid-cols-2 gap-3 w-full mb-6">
                  <div className="bg-[#1e2024] p-4 rounded-2xl border border-white/5 text-left transition-colors hover:border-blue-500/30">
                    <span className="text-[9px] text-blue-400 block font-black uppercase tracking-widest mb-2 border-l-2 border-blue-500 pl-2">
                      Onyomi
                    </span>
                    <span className="text-white text-base font-bold font-japanese tracking-tight leading-relaxed">
                      {card.details.onyomi || "-"}
                    </span>
                  </div>
                  <div className="bg-[#1e2024] p-4 rounded-2xl border border-white/5 text-left transition-colors hover:border-orange-500/30">
                    <span className="text-[9px] text-orange-400 block font-black uppercase tracking-widest mb-2 border-l-2 border-orange-500 pl-2">
                      Kunyomi
                    </span>
                    <span className="text-white text-base font-bold font-japanese tracking-tight leading-relaxed">
                      {card.details.kunyomi || "-"}
                    </span>
                  </div>
                </div>
              )}

              <TTSReader text={card.word} minimal={true} />
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* SRS Control Buttons */}
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
            className="p-6 bg-red-500/10 border border-red-500/20 rounded-[2.5rem] text-red-400 font-black uppercase text-xs tracking-widest hover:bg-red-500/20 active:scale-95 transition-all"
          >
            Lupa ❌
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAnswer(true);
            }}
            className="p-6 bg-green-500/10 border border-green-500/20 rounded-[2.5rem] text-green-400 font-black uppercase text-xs tracking-widest hover:bg-green-500/20 active:scale-95 transition-all shadow-[0_0_30px_rgba(34,197,94,0.1)]"
          >
            Ingat ✅
          </button>
        </motion.div>
      )}
    </div>
  );
}
