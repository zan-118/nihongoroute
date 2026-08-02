/**
 * @file useSRSReview.ts
 * @description Hook kustom untuk mengelola logika sesi ulasan SRS (Spaced Repetition System).
 * Mengatur urutan kartu, status balik kartu (flip), penanganan jawaban pengguna,
 * kalkulasi perolehan XP, efek audio, serta pintasan papan ketik (keyboard shortcuts).
 *
 * @package features/review/hooks
 * @project NihongoRoute
 */

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/useUserStore";
import { useSRSStore } from "@/store/useSRSStore";
import { useUIStore } from "@/store/useUIStore";
import { updateCardState, createNewCardState } from "@/lib/srs";
import { FlashcardType } from "../types/srs-review";
import { shuffleArray } from "@/lib/utils";
import { sounds } from "@/lib/audio";

/**
 * Manage SRS review session state and logic.
 * Handles card order, flip state, user answers, XP calculation, audio, and keyboard shortcuts.
 *
 * @param cards Flashcards to review.
 * @returns Review state and handlers.
 */
export function useSRSReview(cards: FlashcardType[]) {
 const [currentIndex, setCurrentIndex] = useState(0);
 const [isFlipped, setIsFlipped] = useState(false);
 const [direction, setDirection] = useState(0);
 const [isClient, setIsClient] = useState(false);
 
 // Shuffle cards once on mount or when cards change. Prevent layout shifts.
 const shuffledCards = useMemo(() => {
 if (!cards || cards.length === 0) return [];
 return shuffleArray([...cards]);
 }, [cards]);
 
 // Status umpan balik (feedback states)
 const [isFinished, setIsFinished] = useState(false);
 const [showXP, setShowXP] = useState(false);
 const [isShaking, setIsShaking] = useState(false);
 const [flash, setFlash] = useState<"correct" | "wrong" | null>(null);
 const [earnedXP, setEarnedXP] = useState(0);

 // Akses ke Zustand stores
 const updateProgress = useSRSStore((state) => state.updateProgress);
 const xp = useUserStore((state) => state.xp);
 const isSyncing = useUIStore((state) => state.isSyncing);
 const router = useRouter();

 // Delay client render to avoid hydration mismatch.
 useEffect(() => {
 const frame = requestAnimationFrame(() => setIsClient(true));
 return () => cancelAnimationFrame(frame);
 }, []);

 const currentCard = shuffledCards[currentIndex];

 /**
 * Advance to next card or finish session.
 */
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

 /**
 * Process user answer, update SRS state, award XP, trigger audio/visual feedback.
 * @param grade Answer quality score (0 for wrong, 2 for correct).
 */
 const handleAnswer = useCallback(
 (grade: number) => {
 if (!currentCard || isProcessing.current) return;
 isProcessing.current = true;

 const cardId = currentCard.id;
 const srs = useSRSStore.getState().srs;
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
 [currentCard, xp, updateProgress, goToNext],
 );

 /**
 * Flip card to show/hide answer.
 */
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
