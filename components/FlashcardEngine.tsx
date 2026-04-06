"use client";

import { useEffect, useMemo, useState } from "react";
import { createNewCardState, updateCardState, SRSState } from "@/lib/srs";
import { updateProgressOnReview, loadProgress } from "@/lib/progress";
import { calculateLevel, xpForNextLevel, xpForCurrentLevel } from "@/lib/level";
import { checkAchievements } from "@/lib/achievement";
import { supabase } from "@/lib/supabase";
import confetti from "canvas-confetti";
import { updateReviewMission } from "@/lib/daily";

/* ============================= */
/* TYPES */
/* ============================= */

interface Card {
  id?: string;
  word?: string;
  char?: string;
  meaning?: string;
  romaji?: string;
}

interface ProgressState {
  streak: number;
  totalReviews: number;
  todayReviewCount: number;
  dailyGoal: number;
  studyDays: Record<string, number>;
}

interface Props {
  cards: Card[];
}

/* ============================= */
/* COMPONENT */
/* ============================= */

export default function FlashcardEngine({ cards }: Props) {
  const [mounted, setMounted] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);

  const [cardStates, setCardStates] = useState<Record<string, SRSState>>({});
  const [progress, setProgress] = useState<ProgressState | null>(null);
  const [unlocked, setUnlocked] = useState<string[]>([]);

  const [achievementPopup, setAchievementPopup] = useState<string | null>(null);

  /* ============================= */
  /* MOUNT */
  /* ============================= */

  useEffect(() => {
    setMounted(true);
  }, []);

  /* ============================= */
  /* INIT USER */
  /* ============================= */

  useEffect(() => {
    if (!mounted) return;

    const init = async () => {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        await supabase.auth.signInAnonymously();
      }

      await loadFromCloud();
      setInitialized(true);
    };

    init();
  }, [mounted]);

  /* ============================= */
  /* LOAD CLOUD DATA */
  /* ============================= */

  const loadFromCloud = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data } = await supabase
      .from("user_progress")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (data) {
      const xpValue = data.xp ?? 0;

      setXp(xpValue);
      setLevel(calculateLevel(xpValue));
      setCardStates(data.srs ?? {});
      setUnlocked(data.achievements ?? []);

      const local = loadProgress();

      setProgress({
        ...local,
        streak: data.streak ?? 0,
        totalReviews: data.total_reviews ?? 0,
        todayReviewCount: data.today_review_count ?? 0,
      });
    } else {
      // fallback to local
      const savedXP = localStorage.getItem("nihongo-xp");
      const savedStates = localStorage.getItem("nihongo-srs");
      const savedUnlocks = localStorage.getItem("nihongo-achievements");

      const xpValue = savedXP ? Number(savedXP) : 0;

      setXp(xpValue);
      setLevel(calculateLevel(xpValue));

      if (savedStates) setCardStates(JSON.parse(savedStates));

      if (savedUnlocks) setUnlocked(JSON.parse(savedUnlocks));

      setProgress(loadProgress());
    }
  };

  /* ============================= */
  /* SAVE CLOUD */
  /* ============================= */

  const saveToCloud = async (
    xp: number,
    progress: ProgressState,
    achievements: string[],
    srsState: Record<string, SRSState>,
  ) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    await supabase.from("user_progress").upsert({
      user_id: user.id,
      xp,
      streak: progress.streak,
      total_reviews: progress.totalReviews,
      today_review_count: progress.todayReviewCount,
      achievements,
      srs: srsState,
      updated_at: new Date(),
    });
  };

  /* ============================= */
  /* SAFETY RENDER */
  /* ============================= */

  if (!mounted || !initialized) return null;

  if (!cards || cards.length === 0)
    return (
      <div className="text-white text-center">No flashcards available.</div>
    );

  /* ============================= */
  /* FILTER DUE CARDS */
  /* ============================= */

  const dueCards = useMemo(() => {
    const now = Date.now();

    return cards.filter((card, i) => {
      const id = card.id ?? card.word ?? card.char ?? `card-${i}`;

      const state = cardStates[id];

      if (!state) return true;

      return state.nextReview <= now;
    });
  }, [cards, cardStates]);

  if (dueCards.length === 0) {
    return (
      <div className="mt-10 p-10 bg-[#1e2024] rounded-3xl border border-[#0ef]/10 text-center">
        <h2 className="text-2xl font-black text-[#0ef]">
          🎉 Semua kartu sudah direview hari ini!
        </h2>
        <p className="mt-6 text-[#0ef] font-bold">Total XP: {xp}</p>
      </div>
    );
  }

  const safeIndex = index >= dueCards.length ? 0 : index;

  const current = dueCards[safeIndex];

  const cardId =
    current.id ?? current.word ?? current.char ?? `card-${safeIndex}`;

  /* ============================= */
  /* MARK ANSWER */
  /* ============================= */

  const markAnswer = async (correct: boolean) => {
    const existing = cardStates[cardId] ?? createNewCardState();

    const updated = updateCardState(existing, correct);

    const newStates = {
      ...cardStates,
      [cardId]: updated,
    };

    setCardStates(newStates);
    localStorage.setItem("nihongo-srs", JSON.stringify(newStates));

    if (correct && progress) {
      const updatedProgress = updateProgressOnReview();

      setProgress(updatedProgress);

      const newXP = xp + 10;
      setXp(newXP);
      localStorage.setItem("nihongo-xp", newXP.toString());

      const newLevel = calculateLevel(newXP);

      if (newLevel > level) {
        setLevel(newLevel);
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
      const mission = updateReviewMission();

      if (mission.completed) {
        const bonusXP = mission.rewardXP;
        const newXPWithBonus = newXP + bonusXP;
        setXp(newXPWithBonus);
        localStorage.setItem("nihongo-xp", newXPWithBonus.toString());

        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.5 },
        });
      }

      const newUnlocks = checkAchievements({
        xp: newXP,
        streak: updatedProgress.streak,
        reviewCount: updatedProgress.totalReviews,
        unlocked,
      });

      let updatedUnlocked = unlocked;

      if (newUnlocks.length > 0) {
        updatedUnlocked = [...unlocked, ...newUnlocks.map((a) => a.id)];

        setUnlocked(updatedUnlocked);
        localStorage.setItem(
          "nihongo-achievements",
          JSON.stringify(updatedUnlocked),
        );

        setAchievementPopup(newUnlocks[0].title);

        setTimeout(() => setAchievementPopup(null), 3000);
      }

      await saveToCloud(newXP, updatedProgress, updatedUnlocked, newStates);
    }

    setFlipped(false);
    setIndex((prev) => (prev + 1 >= dueCards.length ? 0 : prev + 1));
  };

  /* ============================= */
  /* LEVEL PROGRESS */
  /* ============================= */

  const progressPercent = useMemo(() => {
    const currentXP = xpForCurrentLevel(level);
    const nextXP = xpForNextLevel(level);
    const range = nextXP - currentXP;

    if (range <= 0) return 0;

    const percent = ((xp - currentXP) / range) * 100;

    return Math.min(Math.max(percent, 0), 100);
  }, [xp, level]);

  /* ============================= */
  /* UI */
  /* ============================= */

  return (
    <div className="mt-10 p-8 bg-[#1e2024] rounded-2xl border border-[#0ef]/10 text-center">
      <div className="mb-4 text-white font-bold text-lg">Level {level}</div>

      <div className="w-full bg-white/10 h-2 rounded mb-4">
        <div
          className="bg-yellow-400 h-2 rounded transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div
        onClick={() => setFlipped(!flipped)}
        className="cursor-pointer mx-auto w-72 h-44 flex items-center justify-center rounded-xl bg-[#0ef]/10 border border-[#0ef]/30 text-4xl font-black text-white transition hover:scale-105"
      >
        {!flipped
          ? current.word ?? current.char
          : current.meaning ?? current.romaji}
      </div>

      <div className="flex justify-center gap-4 mt-6">
        <button
          onClick={() => markAnswer(false)}
          className="px-5 py-2 bg-red-500/20 border border-red-500 rounded-lg text-white"
        >
          Wrong
        </button>

        <button
          onClick={() => markAnswer(true)}
          className="px-5 py-2 bg-green-500/20 border border-green-500 rounded-lg text-white"
        >
          Correct
        </button>
      </div>

      {achievementPopup && (
        <div className="mt-6 text-[#0ef] font-bold">
          🎉 Achievement Unlocked: {achievementPopup}
        </div>
      )}
    </div>
  );
}
