import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useProgressStore } from "@/store/useProgressStore";
import { useShallow } from "zustand/react/shallow";
import { updateCardState } from "@/lib/srs";
import { sounds } from "@/lib/audio";
import { MasterCardData, StudyMode } from "./types";

export function useFlashcardMaster({
  cards,
  initialMode = "latihan"
}: {
  cards: MasterCardData[];
  initialMode?: StudyMode;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [direction, setDirection] = useState(0);
  const [showXP, setShowXP] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [studyMode, setStudyMode] = useState<StudyMode>(initialMode);

  const [sessionStats, setSessionStats] = useState({
    known: 0,
    learning: 0,
    xpGained: 0,
  });
  const [isFinished, setIsFinished] = useState(false);

  const { progress, updateProgress } = useProgressStore(
    useShallow((state) => ({ progress: state.progress, updateProgress: state.updateProgress }))
  );
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleAnswer = useCallback((correct: boolean) => {
    if (cards.length === 0) return;
    const card = cards[currentIndex];
    const cardId = card._id || card.id || "unknown";
    const xpReward = correct ? 15 : 5;

    if (typeof window !== "undefined" && window.navigator.vibrate) {
      window.navigator.vibrate(correct ? [50] : [100, 50, 100]);
    }

    setSessionStats((prev) => ({
      known: prev.known + (correct ? 1 : 0),
      learning: prev.learning + (correct ? 0 : 1),
      xpGained: prev.xpGained + xpReward,
    }));

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

    updateProgress(progress.xp + xpReward, {
      ...progress.srs,
      [cardId]: newState,
    });

    setIsFlipped(false);
    
    setTimeout(() => {
      if (currentIndex < cards.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        setDirection(0);
      } else {
        setIsFinished(true);
      }
    }, 200);
  }, [cards, currentIndex, progress, updateProgress]);

  useEffect(() => {
    if (!isClient || isFinished) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        if (studyMode === "ujian" && isFlipped) return;
        sounds?.playPop();
        setIsFlipped((prev) => !prev);
      }
      
      if (e.key === "1" && isFlipped && studyMode === "ujian") {
        handleAnswer(false);
      }
      
      if (e.key === "2" && isFlipped && studyMode === "ujian") {
        handleAnswer(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isClient, isFinished, isFlipped, studyMode, handleAnswer]);

  const handleNav = (dir: 1 | -1) => {
    if (currentIndex + dir >= 0 && currentIndex + dir < cards.length) {
      setDirection(dir);
      setIsFlipped(false);
      setTimeout(() => {
        setCurrentIndex(currentIndex + dir);
      }, 200);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsFinished(false);
    setSessionStats({ known: 0, learning: 0, xpGained: 0 });
  };

  return {
    currentIndex,
    isFlipped,
    setIsFlipped,
    direction,
    showXP,
    isClient,
    studyMode,
    setStudyMode,
    sessionStats,
    isFinished,
    setIsFinished,
    handleNav,
    handleAnswer,
    handleRestart,
    router,
  };
}
