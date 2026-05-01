import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useProgressStore } from "@/store/useProgressStore";
import { useShallow } from "zustand/react/shallow";
import { updateCardState, createNewCardState } from "@/lib/srs";
import { FlashcardType } from "./types";
import { shuffleArray } from "@/lib/helpers";

export function useSRSReview(cards: FlashcardType[]) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [direction, setDirection] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [shuffledCards, setShuffledCards] = useState<FlashcardType[]>([]);

  const { progress, updateProgress } = useProgressStore(
    useShallow((state) => ({ progress: state.progress, updateProgress: state.updateProgress }))
  );
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
      router.push("/dashboard");
    }
  }, [currentIndex, shuffledCards.length, router]);

  const handleAnswer = useCallback(
    (correct: boolean) => {
      if (!currentCard) return;

      const cardId = currentCard._id;
      const currentState = progress.srs[cardId] || createNewCardState();
      const newState = updateCardState(currentState, correct);

      updateProgress(progress.xp + (correct ? 10 : 2), {
        ...progress.srs,
        [cardId]: newState,
      });

      goToNext();
    },
    [currentCard, progress, updateProgress, goToNext],
  );

  const toggleFlip = useCallback(() => {
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
          handleAnswer(false);
        } else if (e.key === "2" || e.key === "ArrowRight") {
          e.preventDefault();
          handleAnswer(true);
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
  };
}
