/**
 * @file useSurvivalMode.ts
 * @description Hook kustom (Custom Hook) untuk mengelola kondisi dan logika permainan bertema kelangsungan hidup (Survival Mode).
 * Mengontrol pengurangan nyawa (HP), hitung mundur pewaktu, pengacakan opsi jawaban pengecoh, 
 * pelacakan skor, serta sinkronisasi perolehan XP ke Zustand store (`useUserStore`).
 */

// ======================
// IMPOR
// ======================
import { useState, useEffect, useCallback, useRef } from "react";
import { CardData, SurvivalGameState } from "./types";
import { shuffleArray } from "@/lib/utils";
import { useUserStore } from "@/store/useUserStore";

// ======================
// HOOK UTAMA
// ======================
/**
 * Manage survival game state, HP, timer, score, and card deck.
 * @param cards Array of card data for game.
 * @returns Game state, HP, score, timer, current card, options, and control functions.
 */
export function useSurvivalMode(cards: CardData[]) {
 const MAX_HP = 3;
 const TIME_PER_QUESTION = 10;

 const [gameState, setGameState] = useState<SurvivalGameState>("idle");
 const [hp, setHp] = useState(MAX_HP);
 const [score, setScore] = useState(0);
 const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION);

 const [deck, setDeck] = useState<CardData[]>([]);
 const [currentCard, setCurrentCard] = useState<CardData | null>(null);
 const [options, setOptions] = useState<CardData[]>([]);
 const [isShaking, setIsShaking] = useState(false);
 const [selectedWrongId, setSelectedWrongId] = useState<string | null>(null);
 const [selectedId, setSelectedId] = useState<string | null>(null);
 const [isCorrecting, setIsCorrecting] = useState(false);
 const isCorrectingRef = useRef(false);

 const addXP = useUserStore((s) => s.addXP);

 /**
 * Load next card. End game if deck empty.
 * @param currentDeck Active deck.
 * @param index Next card index.
 * @param currentScore Current score.
 */
 const loadNextQuestion = useCallback((currentDeck: CardData[], index: number, currentScore: number) => {
 if (index >= currentDeck.length) {
 setGameState("victory");
 // Award XP: currentScore * 2 + 10 Victory bonus
 addXP(currentScore * 2 + 10);
 return;
 }

 const targetCard = currentDeck[index];
 setCurrentCard(targetCard);
 setTimeLeft(TIME_PER_QUESTION);
 setSelectedId(null);

 let wrongOptions = currentDeck.filter((c) => c.id !== targetCard.id);

 // Filter wrong options. Prefer same category if enough exist.
 if (targetCard.type) {
 const sameCategoryOptions = wrongOptions.filter((c) => c.type === targetCard.type);
 if (sameCategoryOptions.length >= 3) {
 wrongOptions = sameCategoryOptions;
 } else {
 wrongOptions = [...sameCategoryOptions, ...shuffleArray(wrongOptions.filter(c => c.type !== targetCard.type))];
 }
 }

 const selectedWrongOptions = shuffleArray(wrongOptions).slice(0, 3);
 setOptions(shuffleArray([targetCard, ...selectedWrongOptions]));
 }, [addXP]);

 /**
 * Deduct HP. Trigger game over if HP zero.
 */
 const handleWrongAnswer = useCallback(() => {
 // Trigger shake animation.
 setIsShaking(true);
 setTimeout(() => setIsShaking(false), 500);

 setHp((prevHp) => {
 const newHp = prevHp - 1;
 // Schedule side-effects outside state updater callback
 setTimeout(() => {
 if (newHp <= 0) {
 setGameState("gameover");
 if (score > 0) {
 addXP(score * 2);
 }
 } else {
 const currentIndex = currentCard ? deck.findIndex((c) => c.id === currentCard.id) : -1;
 if (currentIndex !== -1) {
 loadNextQuestion(deck, currentIndex + 1, score);
 } else {
 setGameState("gameover");
 }
 }
 }, 0);
 return newHp;
 });
 }, [deck, currentCard, loadNextQuestion, score, addXP]);

 /**
 * Process user answer. Update score or deduct HP.
 * @param selectedOption Chosen card.
 */
 const handleAnswer = useCallback((selectedOption: CardData) => {
 if (gameState !== "playing" || isCorrectingRef.current) return;

 isCorrectingRef.current = true;
 setIsCorrecting(true);

 if (selectedOption.id === currentCard?.id) {
 setSelectedId(selectedOption.id);
 const nextScore = score + 1;
 setScore(nextScore);
 const currentIndex = deck.findIndex((c) => c.id === currentCard?.id);
 
 // Delay transition to show correct state.
 setTimeout(() => {
 loadNextQuestion(deck, currentIndex + 1, nextScore);
 setIsCorrecting(false);
 isCorrectingRef.current = false;
 }, 400);
 } else {
 setSelectedId(selectedOption.id);
 setSelectedWrongId(selectedOption.id);
 
 // Delay transition to show incorrect state.
 setTimeout(() => {
 handleWrongAnswer();
 setSelectedWrongId(null);
 setIsCorrecting(false);
 isCorrectingRef.current = false;
 }, 600);
 }
 }, [gameState, currentCard, deck, loadNextQuestion, handleWrongAnswer, score]);

 /**
 * Reset state and start game.
 */
 const startGame = useCallback(() => {
 if (cards.length < 4) return;
 const shuffledDeck = shuffleArray(cards);
 isCorrectingRef.current = false;
 setDeck(shuffledDeck);
 setHp(MAX_HP);
 setScore(0);
 setGameState("playing");
 loadNextQuestion(shuffledDeck, 0, 0);
 }, [cards, loadNextQuestion]);

 // Countdown timer.
 useEffect(() => {
 if (gameState !== "playing" || !currentCard || isCorrecting) return;

 const timer = setInterval(() => {
 setTimeLeft((prev) => {
 if (prev <= 0) return 0;
 return prev - 1;
 });
 }, 1000);

 return () => clearInterval(timer);
 }, [gameState, currentCard, isCorrecting]);

 // Handle timeout.
 useEffect(() => {
 if (gameState === "playing" && timeLeft === 0 && !isCorrectingRef.current) {
 isCorrectingRef.current = true;
 setIsCorrecting(true);
 const timer = setTimeout(() => {
 handleWrongAnswer();
 setIsCorrecting(false);
 isCorrectingRef.current = false;
 }, 0);
 return () => clearTimeout(timer);
 }
 }, [gameState, timeLeft, handleWrongAnswer]);

 return {
 gameState,
 hp,
 MAX_HP,
 score,
 timeLeft,
 TIME_PER_QUESTION,
 currentCard,
 options,
 isShaking,
 selectedWrongId,
 selectedId,
 isCorrecting,
 startGame,
 handleAnswer,
 };
}