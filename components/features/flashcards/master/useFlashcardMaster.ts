import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/useUserStore";
import { useSRSStore } from "@/store/useSRSStore";
import { useUIStore } from "@/store/useUIStore";
import { updateCardState } from "@/lib/srs";
import { sounds } from "@/lib/audio";
import confetti from "canvas-confetti";
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
  const [isShaking, setIsShaking] = useState(false);
  const [mistakeIndices, setMistakeIndices] = useState<number[]>([]);
  const [currentCards, setCurrentCards] = useState<MasterCardData[]>(cards);
  const [userInput, setUserInput] = useState("");
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [inputResult, setInputResult] = useState<"correct" | "wrong" | null>(null);
  const [combo, setCombo] = useState(0);


  const { srs, updateProgress } = useSRSStore();
  const { xp } = useUserStore();
  const { isSyncing } = useUIStore();
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const isProcessing = useRef(false);

  const handleAnswer = useCallback((grade: number) => {
    if (currentCards.length === 0 || isProcessing.current) return;
    isProcessing.current = true;
    
    const card = currentCards[currentIndex];
    const cardId = card._id || card.id || "unknown";
    
    // XP Scaling based on Grade (0: 5, 1: 10, 2: 15, 3: 20)
    const xpRewards = [5, 10, 15, 20];
    const xpReward = xpRewards[grade] || 15;
    const isCorrect = grade >= 2;

    if (typeof window !== "undefined" && window.navigator.vibrate) {
      if (grade === 0) window.navigator.vibrate([100, 50, 100]);
      else if (grade === 1) window.navigator.vibrate([80]);
      else if (grade === 2) window.navigator.vibrate([50]);
      else window.navigator.vibrate([50, 30, 50]);
    }

    setSessionStats((prev) => ({
      known: prev.known + (isCorrect ? 1 : 0),
      learning: prev.learning + (isCorrect ? 0 : 1),
      xpGained: prev.xpGained + xpReward,
    }));

    const currentState = srs[cardId] || {
      interval: 1,
      repetition: 0,
      easeFactor: 2.5,
      nextReview: Date.now(),
    };

    if (isCorrect) {
      sounds?.playSuccess();
      setShowXP(true);
      setTimeout(() => setShowXP(false), 800);
    } else {
      sounds?.playError();
      setIsShaking(true);
      setMistakeIndices((prev) => [...new Set([...prev, currentIndex])]);
      setTimeout(() => setIsShaking(false), 200);
    }

    setDirection(isCorrect ? 1 : -1);
    
    const newState = updateCardState(currentState, grade);

    // Combo Logic
    if (isCorrect) {
      setCombo(prev => prev + 1);
      // Mastery Celebration
      if (newState.interval >= 30 && currentState.interval < 30) {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#FFD700", "#FFA500", "#00EEFF"]
        });
      }
    } else {
      setCombo(0);
    }

    updateProgress(xp + xpReward, {
      [cardId]: newState,
    });

    setIsFlipped(false);
    setUserInput("");
    setIsAnswerChecked(false);
    setInputResult(null);

    setTimeout(() => {
      if (currentIndex < currentCards.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        setDirection(0);
      } else {
        setIsFinished(true);
      }
      isProcessing.current = false;
    }, 200);
  }, [currentCards, currentIndex, srs, xp, updateProgress]);

  const checkAnswer = useCallback(() => {
    if (studyMode !== "tantangan" || isAnswerChecked) return;
    
    const card = currentCards[currentIndex];
    const target = (card.furigana || card.word).toLowerCase();
    const isCorrect = userInput.trim().toLowerCase() === target;

    setIsAnswerChecked(true);
    setInputResult(isCorrect ? "correct" : "wrong");

    if (typeof window !== "undefined" && window.navigator.vibrate) {
      window.navigator.vibrate(isCorrect ? [50] : [100, 50, 100]);
    }

    if (isCorrect) {
      setTimeout(() => {
        setIsFlipped(true);
      }, 500);
    } else {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 200);
    }
  }, [studyMode, isAnswerChecked, currentCards, currentIndex, userInput]);


  const handleReviewMistakes = () => {
    if (mistakeIndices.length === 0) return;
    const cardsToReview = mistakeIndices.map(idx => currentCards[idx]);
    setCurrentCards(cardsToReview);
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsFinished(false);
    setMistakeIndices([]);
    setSessionStats({ known: 0, learning: 0, xpGained: 0 });
  };

  const handleNav = useCallback((dir: 1 | -1) => {
    if (currentIndex + dir >= 0 && currentIndex + dir < currentCards.length) {
      setDirection(dir);
      setIsFlipped(false);
      setTimeout(() => {
        setCurrentIndex(currentIndex + dir);
      }, 200);
    }
  }, [currentIndex, currentCards.length]);

  useEffect(() => {
    if (!isClient || isFinished) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Space to Flip
      if (e.code === "Space") {
        e.preventDefault();
        if ((studyMode === "ujian" || studyMode === "tantangan") && isFlipped) return;
        if (studyMode === "tantangan" && !isFlipped) return;
        
        sounds?.playPop();
        setIsFlipped((prev) => !prev);
      }
      
      // Navigation & Grades (when Flipped)
      if (isFlipped && (studyMode === "ujian" || studyMode === "tantangan")) {
        if (e.key === "1") handleAnswer(0); // Again
        else if (e.key === "2") handleAnswer(1); // Hard
        else if (e.key === "3") handleAnswer(2); // Good
        else if (e.key === "4") handleAnswer(3); // Easy
        else if (e.key === "ArrowLeft") handleAnswer(0);
        else if (e.key === "ArrowRight") handleAnswer(2);
      }

      // Challenge Mode - Enter to Check
      if (studyMode === "tantangan" && !isFlipped && e.key === "Enter") {
        checkAnswer();
      }

      // Practice Mode Navigation
      if (studyMode === "latihan") {
        if (e.key === "ArrowLeft") handleNav(-1);
        else if (e.key === "ArrowRight") handleNav(1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isClient, isFinished, isFlipped, studyMode, handleAnswer, handleNav, checkAnswer]);

  const handleRestart = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsFinished(false);
    setSessionStats({ known: 0, learning: 0, xpGained: 0 });
    setUserInput("");
    setIsAnswerChecked(false);
    setInputResult(null);
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
    isShaking,
    handleNav,
    handleAnswer,
    handleRestart: () => {
      handleRestart();
      setMistakeIndices([]);
      setCurrentCards(cards);
    },
    handleReviewMistakes,
    mistakeIndices,
    currentCards,
    srs,
    router,
    userInput,
    setUserInput,
    isAnswerChecked,
    setIsAnswerChecked,
    inputResult,
    checkAnswer,
    combo,
    isSyncing,
  };
}
