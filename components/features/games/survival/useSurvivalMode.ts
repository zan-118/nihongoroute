import { useState, useEffect, useCallback } from "react";
import { CardData, SurvivalGameState } from "./types";
import { shuffleArray } from "@/lib/helpers";

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

  const loadNextQuestion = useCallback((currentDeck: CardData[], index: number) => {
    if (index >= currentDeck.length) {
      setGameState("victory");
      return;
    }

    const targetCard = currentDeck[index];
    setCurrentCard(targetCard);
    setTimeLeft(TIME_PER_QUESTION);
    setSelectedId(null);

    let wrongOptions = currentDeck.filter((c) => c._id !== targetCard._id);

    if (targetCard.category) {
      const sameCategoryOptions = wrongOptions.filter((c) => c.category === targetCard.category);
      if (sameCategoryOptions.length >= 3) {
        wrongOptions = sameCategoryOptions;
      } else {
        wrongOptions = [...sameCategoryOptions, ...shuffleArray(wrongOptions.filter(c => c.category !== targetCard.category))];
      }
    }

    const selectedWrongOptions = shuffleArray(wrongOptions).slice(0, 3);
    setOptions(shuffleArray([targetCard, ...selectedWrongOptions]));
  }, []);

  const handleWrongAnswer = useCallback(() => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);

    setHp((prevHp) => {
      const newHp = prevHp - 1;
      if (newHp <= 0) {
        setGameState("gameover");
      } else {
        const currentIndex = deck.findIndex((c) => c._id === currentCard?._id);
        loadNextQuestion(deck, currentIndex + 1);
      }
      return newHp;
    });
  }, [deck, currentCard, loadNextQuestion]);

  const handleAnswer = useCallback((selectedOption: CardData) => {
    if (gameState !== "playing" || isCorrecting) return;

    if (selectedOption._id === currentCard?._id) {
      setSelectedId(selectedOption._id);
      setScore((prev) => prev + 1);
      const currentIndex = deck.findIndex((c) => c._id === currentCard?._id);
      
      setIsCorrecting(true);
      setTimeout(() => {
        loadNextQuestion(deck, currentIndex + 1);
        setIsCorrecting(false);
      }, 400);
    } else {
      setSelectedId(selectedOption._id);
      setSelectedWrongId(selectedOption._id);
      setIsCorrecting(true);
      
      setTimeout(() => {
        handleWrongAnswer();
        setSelectedWrongId(null);
        setIsCorrecting(false);
      }, 600);
    }
  }, [gameState, isCorrecting, currentCard, deck, loadNextQuestion, handleWrongAnswer]);

  const startGame = useCallback(() => {
    if (cards.length < 4) return;
    const shuffledDeck = shuffleArray(cards);
    setDeck(shuffledDeck);
    setHp(MAX_HP);
    setScore(0);
    setGameState("playing");
    loadNextQuestion(shuffledDeck, 0);
  }, [cards, loadNextQuestion]);

  useEffect(() => {
    if (gameState !== "playing") return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleWrongAnswer();
          return TIME_PER_QUESTION;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, handleWrongAnswer]);

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
