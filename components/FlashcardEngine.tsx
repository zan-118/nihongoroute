"use client";
import { useEffect, useMemo, useState } from "react";
import { createNewCardState, updateCardState, SRSState } from "@/lib/srs";
import { updateProgressOnReview, loadProgress } from "@/lib/progress";
import { calculateLevel, xpForNextLevel, xpForCurrentLevel } from "@/lib/level";
import { supabase } from "@/lib/supabase";
import confetti from "canvas-confetti";
import Flashcard from "./Flashcard";

interface Props {
  cards: any[];
}

export default function FlashcardEngine({ cards }: Props) {
  const [mounted, setMounted] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [cardStates, setCardStates] = useState<Record<string, SRSState>>({});

  useEffect(() => {
    setMounted(true);
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) await supabase.auth.signInAnonymously();

      // Load progress dari Supabase
      const { data } = await supabase
        .from("user_progress")
        .select("*")
        .eq("user_id", user?.id)
        .single();
      if (data) {
        setXp(data.xp || 0);
        setLevel(calculateLevel(data.xp || 0));
        setCardStates(data.srs || {});
      }
      setInitialized(true);
    };
    init();
  }, []);

  const progressPercent = useMemo(() => {
    const currentXP = xpForCurrentLevel(level);
    const nextXP = xpForNextLevel(level);
    const range = nextXP - currentXP;
    return range <= 0
      ? 0
      : Math.min(Math.max(((xp - currentXP) / range) * 100, 0), 100);
  }, [xp, level]);

  const markAnswer = async (correct: boolean) => {
    const currentCard = cards[index];
    const cardId = currentCard.id;
    const newState = updateCardState(
      cardStates[cardId] || createNewCardState(),
      correct,
    );
    const updatedStates = { ...cardStates, [cardId]: newState };

    setCardStates(updatedStates);
    if (correct) {
      const newXP = xp + 10;
      setXp(newXP);
      const newLevel = calculateLevel(newXP);
      if (newLevel > level) {
        setLevel(newLevel);
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      await supabase.from("user_progress").upsert({
        user_id: user?.id,
        xp: newXP,
        srs: updatedStates,
        updated_at: new Date(),
      });
    }

    setFlipped(false);
    setIndex((prev) => (prev + 1 >= cards.length ? 0 : prev + 1));
  };

  if (!mounted || !initialized)
    return (
      <div className="text-[#0ef] text-center mt-20 font-mono">
        LOADING DATA...
      </div>
    );

  const current = cards[index];

  return (
    <div className="flex flex-col items-center">
      {/* Progress Bar */}
      <div className="w-full max-w-md mb-8">
        <div className="flex justify-between text-xs text-[#0ef] mb-2 font-bold uppercase tracking-widest">
          <span>Level {level}</span>
          <span>{xp} XP</span>
        </div>
        <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden border border-white/5">
          <div
            className="bg-[#0ef] h-full transition-all duration-700 shadow-[0_0_10px_#0ef]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Card Interaction Area */}
      <div
        onClick={() => setFlipped(!flipped)}
        className="w-full cursor-pointer transition-all duration-300 active:scale-95"
      >
        {!flipped ? (
          <div className="bg-[#1e2024] rounded-3xl p-24 border border-[#0ef]/20 shadow-2xl flex items-center justify-center min-h-[400px]">
            <h1 className="text-9xl font-bold text-white tracking-tighter">
              {current.word}
            </h1>
          </div>
        ) : (
          <Flashcard data={current} />
        )}
      </div>

      {/* Control Buttons */}
      <div className="flex gap-6 mt-10">
        <button
          onClick={(e) => {
            e.stopPropagation();
            markAnswer(false);
          }}
          className="px-10 py-4 bg-red-500/10 border border-red-500/50 rounded-2xl text-white font-bold hover:bg-red-500/20 transition-all uppercase tracking-widest text-xs"
        >
          Gagal
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            markAnswer(true);
          }}
          className="px-10 py-4 bg-green-500/10 border border-green-500/50 rounded-2xl text-white font-bold hover:bg-green-500/20 transition-all uppercase tracking-widest text-xs"
        >
          Paham
        </button>
      </div>

      <p className="mt-8 text-[#c4cfde]/40 text-xs uppercase tracking-widest">
        Klik kartu untuk melihat detail
      </p>
    </div>
  );
}
