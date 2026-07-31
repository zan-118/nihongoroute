/**
 * @file useFlashcardMaster.ts
 * @description Custom Hook pengelola logika state dan kendali interaksi utama sesi kartu pengingat (flashcard), mencakup sistem SRS, navigasi kartu, keyboard handler (Enter, Space, Arrow), kalkulasi kombo, dan sinkronisasi status ke awan.
 */

// ==========================================
// IMPORT & DEPENDENSI
// ==========================================
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/useUserStore";
import { useSRSStore } from "@/store/useSRSStore";
import { useUIStore } from "@/store/useUIStore";
import { updateCardState } from "@/lib/learning/srs";
import { FlashcardSessionEngine } from "@/lib/srs/flashcard-session-engine";
import { sounds } from "@/lib/audio";
import { MasterCardData, StudyMode } from "./types";



// ==========================================
// CUSTOM HOOK UTAMA
// ==========================================
/**
 * Custom hook to manage flashcard study session state, SRS updates, keyboard navigation, and user statistics.
 * 
 * @param {Object} params - Hook parameters.
 * @param {MasterCardData[]} params.cards - Active cards for current session.
 * @param {StudyMode} [params.initialMode="latihan"] - Initial study mode.
 * @returns {Object} State variables and handler functions for flashcard interface.
 */
export function useFlashcardMaster({
  cards,
  initialMode = "latihan"
}: {
  cards: MasterCardData[];
  initialMode?: StudyMode;
}) {
  /** @type {number} Index of current active card */
  const [currentIndex, setCurrentIndex] = useState(0);
  /** @type {boolean} Card flip state (true if back side visible) */
  const [isFlipped, setIsFlipped] = useState(false);
  /** @type {number} Slide transition direction (-1 for left, 1 for right, 0 for static) */
  const [direction, setDirection] = useState(0);
  /** @type {boolean} Controls visibility of XP gain animation */
  const [showXP, setShowXP] = useState(false);
  /** @type {boolean} Client-side hydration flag */
  const [isClient, setIsClient] = useState(false);
  /** @type {StudyMode} Current active study mode */
  const [studyMode, setStudyMode] = useState<StudyMode>(initialMode);

  /** @type {React.MutableRefObject<number>} Timestamp of session start */
  const startTimeRef = useRef(0);
  /** @type {Object} Session statistics accumulator */
  const [sessionStats, setSessionStats] = useState(() => ({
    known: 0,
    learning: 0,
    xpGained: 0,
    maxCombo: 0,
    accuracy: 0,
    duration: 0,
  }));
  /** @type {boolean} True if all cards in session are completed */
  const [isFinished, setIsFinished] = useState(false);
  /** @type {boolean} Controls shake animation on incorrect answers */
  const [isShaking, setIsShaking] = useState(false);
  /** @type {number[]} Indices of cards answered incorrectly */
  const [mistakeIndices, setMistakeIndices] = useState<number[]>([]);
  /** @type {MasterCardData[]} Active card list for current session */
  const [currentCards, setCurrentCards] = useState<MasterCardData[]>(cards);
  /** @type {string} User input text for challenge mode */
  const [userInput, setUserInput] = useState("");
  /** @type {boolean} True if user submitted answer in challenge mode */
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  /** @type {"correct" | "wrong" | null} Result of challenge mode answer validation */
  const [inputResult, setInputResult] = useState<"correct" | "wrong" | null>(null);
  /** @type {number} Current consecutive correct answers */
  const [combo, setCombo] = useState(0);

  /** SRS state from global store */
  const srs = useSRSStore((state) => state.srs);
  /** Action to update SRS progress in store and database */
  const updateProgress = useSRSStore((state) => state.updateProgress);
  /** Syncing state indicator from UI store */
  const isSyncing = useUIStore((state) => state.isSyncing);
  const router = useRouter();

  // Initialize session start time and client flag
  useEffect(() => {
    startTimeRef.current = Date.now();
    const frame = requestAnimationFrame(() => setIsClient(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  /** @type {React.MutableRefObject<boolean>} Lock to prevent double-submitting answers */
  const isProcessing = useRef(false);

  /**
   * Handles SRS grade submission, updates stats, plays audio, and advances to next card.
   * 
   * @param {number} grade - SRS grade (0: Again, 1: Hard, 2: Good, 3: Easy)
   */
  const handleAnswer = useCallback((grade: number) => {
    if (currentCards.length === 0 || isProcessing.current) return;
    isProcessing.current = true;
    
    const card = currentCards[currentIndex];
    const cardId = card.id || "unknown";
    
    // Trigger device haptic feedback if supported
    if (typeof window !== "undefined" && window.navigator.vibrate) {
      if (grade === 0) window.navigator.vibrate([100, 50, 100]);
      else if (grade === 1) window.navigator.vibrate([80]);
      else if (grade === 2) window.navigator.vibrate([50]);
      else window.navigator.vibrate([50, 30, 50]);
    }

    // Retrieve existing SRS state or fallback to default
    const currentState = srs[cardId] || {
      interval: 1,
      repetition: 0,
      easeFactor: 2.5,
      nextReview: Date.now(),
      updatedAt: Date.now(),
    };

    // Instantiate session engine seam for current session
    const engine = new FlashcardSessionEngine(currentCards, currentIndex);
    const { isCorrect, xpReward, newState, stats: updatedStats } = engine.processGrade(grade, currentState);


    // Update session statistics via engine
    setSessionStats((prev) => ({
      ...prev,
      known: updatedStats.known,
      learning: updatedStats.learning,
      xpGained: prev.xpGained + xpReward,
      maxCombo: Math.max(prev.maxCombo, updatedStats.maxCombo),
    }));

    if (isCorrect) {
      sounds?.playSuccess();
      setShowXP(true);
      setTimeout(() => setShowXP(false), 800);
      setCombo((prev) => prev + 1);
    } else {
      sounds?.playError();
      setIsShaking(true);
      setMistakeIndices((prev) => [...new Set([...prev, currentIndex])]);
      setTimeout(() => setIsShaking(false), 200);
      setCombo(0);
    }

    setDirection(isCorrect ? 1 : -1);

    // Always read xp fresh from store to prevent stale snapshot across multi-card sessions
    const currentXp = useUserStore.getState().xp;
    updateProgress(currentXp + xpReward, {
      [cardId]: newState,
    });

    setIsFlipped(false);
    setUserInput("");
    setIsAnswerChecked(false);
    setInputResult(null);


    // Transition to next card or finish session
    setTimeout(() => {
      if (currentIndex < currentCards.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        setDirection(0);
      } else {
        const durationSec = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setSessionStats(prev => {
          return {
            ...prev,
            duration: durationSec,
            accuracy: Math.round((prev.known / currentCards.length) * 100)
          };
        });
        setIsFinished(true);
      }
      isProcessing.current = false;
    }, 200);
  }, [currentCards, currentIndex, srs, updateProgress]);

  /**
   * Validates user text input against target word in challenge mode.
   */
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

  /**
   * Filters session cards to only review incorrect answers and restarts session.
   */
  const handleReviewMistakes = () => {
    if (mistakeIndices.length === 0) return;
    const cardsToReview = mistakeIndices.map(idx => currentCards[idx]);
    setCurrentCards(cardsToReview);
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsFinished(false);
    setMistakeIndices([]);
    setCombo(0);
    startTimeRef.current = Date.now();
    setSessionStats({
      known: 0,
      learning: 0,
      xpGained: 0,
      maxCombo: 0,
      accuracy: 0,
      duration: 0,
    });
  };

  /**
   * Navigates forward or backward in practice mode.
   * 
   * @param {1 | -1} dir - Navigation direction (1 for next, -1 for previous)
   */
  const handleNav = useCallback((dir: 1 | -1) => {
    if (currentIndex + dir >= 0 && currentIndex + dir < currentCards.length) {
      setDirection(dir);
      setIsFlipped(false);
      setTimeout(() => {
        setCurrentIndex(currentIndex + dir);
      }, 200);
    }
  }, [currentIndex, currentCards.length]);

  // Keyboard shortcut listener
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

  /**
   * Resets session state variables to initial values.
   */
  const handleRestart = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsFinished(false);
    setCombo(0);
    startTimeRef.current = Date.now();
    setSessionStats({
      known: 0,
      learning: 0,
      xpGained: 0,
      maxCombo: 0,
      accuracy: 0,
      duration: 0,
    });
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