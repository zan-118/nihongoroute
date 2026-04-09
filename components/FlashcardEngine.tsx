"use client";
import { useMemo, useState } from "react";
import { createNewCardState, updateCardState } from "@/lib/srs";
import { xpForNextLevel, xpForCurrentLevel } from "@/lib/level";
import confetti from "canvas-confetti";
import Flashcard from "./Flashcard";
import { useProgress } from "@/context/UserProgressContext";

interface Props {
  cards: any[];
}

export default function FlashcardEngine({ cards }: Props) {
  const { progress, loading, updateProgress } = useProgress();
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const progressPercent = useMemo(() => {
    const currentXP = xpForCurrentLevel(progress.level);
    const nextXP = xpForNextLevel(progress.level);
    const range = nextXP - currentXP;
    return range <= 0
      ? 0
      : Math.min(Math.max(((progress.xp - currentXP) / range) * 100, 0), 100);
  }, [progress.xp, progress.level]);

  const markAnswer = (correct: boolean) => {
    const currentCard = cards[index];
    const cardId = currentCard.id;

    const currentState = progress.srs[cardId] || createNewCardState();
    const newState = updateCardState(currentState, correct);
    const updatedSrs = { ...progress.srs, [cardId]: newState };

    let newXp = progress.xp;
    const oldLevel = progress.level;

    if (correct) {
      newXp += 10;
    }

    updateProgress(newXp, updatedSrs);

    const newCalculatedLevel = Math.floor(Math.sqrt(newXp / 50)) + 1;
    if (correct && newCalculatedLevel > oldLevel) {
      setTimeout(() => {
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
      }, 150);
    }

    setFlipped(false);
    setIndex((prev) => (prev + 1 >= cards.length ? 0 : prev + 1));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center w-full max-w-md mx-auto animate-pulse mt-10 px-4 md:px-0">
        <div className="w-full flex justify-between mb-4 px-2">
          <div className="h-4 bg-[#1e2024] rounded w-16 border border-white/5"></div>
          <div className="h-4 bg-[#1e2024] rounded w-16 border border-white/5"></div>
        </div>
        <div className="w-full bg-[#1e2024] h-2 rounded-full mb-8 border border-white/5"></div>
        <div className="w-full h-[300px] md:h-[400px] bg-[#1e2024] rounded-[2rem] border border-white/5"></div>
      </div>
    );
  }

  const current = cards[index];

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto px-2 md:px-0">
      {/* Progress Bar */}
      <div className="w-full mb-6 md:mb-8">
        <div className="flex justify-between text-[10px] md:text-xs text-[#0ef] mb-2 font-bold uppercase tracking-widest px-1">
          <span>Level {progress.level}</span>
          <span>{progress.xp} XP</span>
        </div>
        <div className="w-full bg-white/5 h-1.5 md:h-2 rounded-full overflow-hidden border border-white/5">
          <div
            className="bg-[#0ef] h-full transition-all duration-700 shadow-[0_0_10px_#0ef]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Card Area */}
      <div
        onClick={() => setFlipped(!flipped)}
        className="w-full cursor-pointer transition-transform duration-300 active:scale-95 perspective-1000 select-none relative group"
      >
        {/* Helper Badge di pojok */}
        <div className="absolute -top-3 -right-2 md:-right-4 bg-[#0ef] text-black text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest z-10 shadow-lg animate-bounce">
          Tap Card
        </div>

        {!flipped ? (
          <div className="bg-gradient-to-br from-[#1e2024] to-[#1a1c20] rounded-[2.5rem] p-8 md:p-16 border border-[#0ef]/20 shadow-2xl flex flex-col items-center justify-center min-h-[300px] md:min-h-[400px] hover:border-[#0ef]/50 transition-colors">
            <h1 className="text-7xl md:text-9xl font-black text-white tracking-tighter text-center">
              {current.word}
            </h1>
          </div>
        ) : (
          <Flashcard data={current} />
        )}
      </div>

      {/* Control Buttons - Disesuaikan agar sangat mudah disentuh jempol (Thumb-friendly) */}
      <div className="flex gap-3 md:gap-4 mt-8 md:mt-10 w-full justify-center">
        <button
          onClick={(e) => {
            e.stopPropagation();
            markAnswer(false);
          }}
          className="flex-1 max-w-[180px] h-16 md:h-20 bg-gradient-to-t from-red-500/10 to-transparent border-2 border-red-500/30 rounded-[1.5rem] text-red-100 font-black hover:bg-red-500/20 hover:border-red-500 active:scale-90 transition-all uppercase tracking-widest text-xs md:text-sm shadow-[0_4px_20px_rgba(239,68,68,0.1)]"
        >
          Sulit
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            markAnswer(true);
          }}
          className="flex-1 max-w-[180px] h-16 md:h-20 bg-gradient-to-t from-green-500/10 to-transparent border-2 border-green-500/30 rounded-[1.5rem] text-green-100 font-black hover:bg-green-500/20 hover:border-green-500 active:scale-90 transition-all uppercase tracking-widest text-xs md:text-sm shadow-[0_4px_20px_rgba(34,197,94,0.1)]"
        >
          Hafal
        </button>
      </div>
    </div>
  );
}
