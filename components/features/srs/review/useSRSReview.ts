import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/useUserStore";
import { useSRSStore } from "@/store/useSRSStore";
import { useUIStore } from "@/store/useUIStore";
import { updateCardState, createNewCardState } from "@/lib/srs";
import { FlashcardType } from "./types";
import { shuffleArray } from "@/lib/helpers";
import { sounds } from "@/lib/audio";

export function useSRSReview(cards: FlashcardType[]) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [direction, setDirection] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [shuffledCards, setShuffledCards] = useState<FlashcardType[]>([]);
  
  // Feedback states
  const [isFinished, setIsFinished] = useState(false);
  const [showXP, setShowXP] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [flash, setFlash] = useState<"correct" | "wrong" | null>(null);
  const [earnedXP, setEarnedXP] = useState(0);

  const { srs, updateProgress } = useSRSStore();
  const { xp } = useUserStore();
  const { isSyncing } = useUIStore();
  const router = useRouter();

  useEffect(() => {
    if (cards && cards.length > 0) {
      setShuffledCards(shuffleArray(cards));
    }
    setIsClient(true);
  }, [cards]);

  const currentCard = shuffledCards[currentIndex];

  const goToNext = useCallback(() => {
    setDirection(1);
    setIsFlipped(false);

    if (currentIndex < shuffledCards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsFinished(true);
    }
  }, [currentIndex, shuffledCards.length]);

  const isProcessing = useRef(false);

  const handleAnswer = useCallback(
    (grade: number) => {
      if (!currentCard || isProcessing.current) return;
      isProcessing.current = true;

      const cardId = currentCard._id;
      const currentState = srs[cardId] || createNewCardState();
      const newState = updateCardState(currentState, grade);

      const xpGain = grade >= 2 ? 10 : 2;
      updateProgress(xp + xpGain, {
        [cardId]: newState,
      });
      setEarnedXP((prev) => prev + xpGain);

      if (grade >= 2) {
        sounds?.playSuccess();
        setFlash("correct");
        setShowXP(true);
        setTimeout(() => setShowXP(false), 800);
      } else {
        sounds?.playError();
        setFlash("wrong");
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 300);
      }

      setTimeout(() => {
        setFlash(null);
        goToNext();
        isProcessing.current = false;
      }, 300);
    },
    [currentCard, srs, xp, updateProgress, goToNext],
  );

  const toggleFlip = useCallback(() => {
    sounds?.playPop();
    setIsFlipped((prev) => !prev);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      )
        return;

      if (!isFlipped) {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          toggleFlip();
        }
      } else {
        if (e.key === "1" || e.key === "ArrowLeft") {
          e.preventDefault();
          handleAnswer(0);
        } else if (e.key === "2" || e.key === "ArrowRight") {
          e.preventDefault();
          handleAnswer(2);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFlipped, toggleFlip, handleAnswer]);

  return {
    currentIndex,
    isFlipped,
    direction,
    isClient,
    shuffledCards,
    currentCard,
    handleAnswer,
    toggleFlip,
    isSyncing,
    isFinished,
    showXP,
    isShaking,
    flash,
    earnedXP,
    router,
  };
}
