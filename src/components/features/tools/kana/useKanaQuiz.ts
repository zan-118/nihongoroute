/**
 * @file useKanaQuiz.ts
 * @description Hook kustom untuk mengelola seluruh status dan logika interaksi kuis latihan membaca dan menulis huruf Hiragana & Katakana.
 */

// ==========================================
// IMPORT & DEPENDENSI
// ==========================================
import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useUserStore } from "@/store/useUserStore";
import { KANA_DATA, KanaType, KanaCategory } from "./kana-data";

// ==========================================
// HOOK UTAMA
// ==========================================
/**
 * Hook khusus pengendali logika kuis kana.
 * 
 * @returns State kuis kana, score, sisa nyawa, opsi, dan method handler.
 */
export function useKanaQuiz() {
  // ==========================================
  // STATUS & STATE & HOOKS
  // ==========================================
  const searchParams = useSearchParams();
  const [type, setType] = useState<KanaType>("hiragana");
  const [category, setCategory] = useState<KanaCategory>("seion");
  const [selectedChar, setSelectedChar] = useState<{
    char: string;
    romaji: string;
  } | null>(null);

  // ==========================================
  // EFEK SAMPING (EFFECTS)
  // ==========================================
  // Auto-open writing dialog if mode=writing is present
  useEffect(() => {
    const mode = searchParams.get("mode");
    if (mode === "writing" && !selectedChar) {
      requestAnimationFrame(() => {
        setSelectedChar({ char: "あ", romaji: "a" });
      });
    }
  }, [searchParams, selectedChar]);

  const [isQuizActive, setIsQuizActive] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizLives, setQuizLives] = useState(3);
  const [quizChar, setQuizChar] = useState<{ char: string; romaji: string } | null>(null);
  const [quizOptions, setQuizOptions] = useState<string[]>([]);
  const [quizInput, setQuizInput] = useState("");
  const [quizFeedback, setQuizFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [questionMode, setQuestionMode] = useState<"classic" | "audio">("classic");
  const [questionCount, setQuestionCount] = useState(0);
  const [isVictory, setIsVictory] = useState(false);

  const addXP = useUserStore((state) => state.addXP);

  // ==========================================
  // FUNGSI PEMBANTU (HELPERS)
  // ==========================================

  const getAllKanaForType = useCallback((currentType: KanaType, currentCategory: KanaCategory) => {
    const pairs: { char: string; romaji: string }[] = [];
    const data = KANA_DATA[currentCategory];
    data[currentType].forEach((row, rowIndex) => {
      row.forEach((char, colIndex) => {
        if (char !== "") {
          pairs.push({
            char,
            romaji: data.romaji[rowIndex][colIndex],
          });
        }
      });
    });
    return pairs;
  }, []);

  // ==========================================
  // LOGIKA PENGENDALI & METODE (HANDLERS)
  // ==========================================
  const nextQuizQuestion = useCallback((currentType: KanaType = type, currentCategory: KanaCategory = category) => {
    const pairs = getAllKanaForType(currentType, currentCategory);
    if (pairs.length === 0) return;
    
    const randomPair = pairs[Math.floor(Math.random() * pairs.length)];
    
    // Randomize mode between classic and audio-to-shape
    const nextMode = Math.random() > 0.5 ? "audio" : "classic";
    setQuestionMode(nextMode);

    const options = new Set<string>();
    const correctAnswerValue = nextMode === "classic" ? randomPair.romaji : randomPair.char;
    options.add(correctAnswerValue);
    
    while (options.size < 4 && options.size < pairs.length) {
      const wrongPair = pairs[Math.floor(Math.random() * pairs.length)];
      const wrongValue = nextMode === "classic" ? wrongPair.romaji : wrongPair.char;
      options.add(wrongValue);
    }
    
    const shuffledOptions = Array.from(options).sort(() => Math.random() - 0.5);
    
    setQuizChar(randomPair);
    setQuizOptions(shuffledOptions);
    setQuizInput("");
    setQuizFeedback(null);
  }, [type, category, getAllKanaForType]);

  const startQuiz = useCallback(() => {
    setQuizScore(0);
    setQuizLives(3);
    setQuestionCount(0);
    setIsVictory(false);
    setGameOver(false);
    setIsQuizActive(true);
    nextQuizQuestion(type, category);
  }, [type, category, nextQuizQuestion]);

  const handleOptionClick = useCallback((option: string) => {
    if (gameOver || isVictory || !quizChar || quizFeedback) return;
    setQuizInput(option);

    const isCorrect = questionMode === "classic"
      ? option.toLowerCase() === quizChar.romaji.toLowerCase()
      : option === quizChar.char;

    const nextCount = questionCount + 1;
    setQuestionCount(nextCount);

    if (isCorrect) {
      setQuizFeedback("correct");
      const nextScore = quizScore + 1;
      setQuizScore(nextScore);
      addXP(1);

      if (nextCount >= 20) {
        setTimeout(() => {
          if (nextScore >= 15 && quizLives > 0) {
            setIsVictory(true);
            addXP(20);
          }
          setGameOver(true);
        }, 500);
      } else {
        setTimeout(() => {
          nextQuizQuestion();
        }, 500);
      }
    } else {
      setQuizFeedback("incorrect");
      const nextLives = quizLives - 1;
      setQuizLives(nextLives);
      
      if (nextLives <= 0 || nextCount >= 20) {
        setTimeout(() => {
          if (nextCount >= 20 && quizScore >= 15 && nextLives > 0) {
            setIsVictory(true);
            addXP(20);
          }
          setGameOver(true);
        }, 500);
      } else {
        setTimeout(() => {
          setQuizFeedback(null);
        }, 500);
      }
    }
  }, [gameOver, isVictory, quizChar, quizFeedback, questionMode, questionCount, quizScore, quizLives, addXP, nextQuizQuestion]);

  const handleCloseQuiz = useCallback((open: boolean) => {
    setIsQuizActive(open);
    if (!open) {
      setGameOver(false);
      setIsVictory(false);
    }
  }, []);

  const isHira = type === "hiragana";
  const themeColor = isHira ? "text-primary" : "text-secondary";
  const themeBorder = isHira ? "border-primary/30" : "border-secondary/30";
  const themeBgHover = isHira ? "hover:bg-primary/10" : "hover:bg-secondary/10";
  const themeAccent = isHira ? "bg-primary" : "bg-secondary";

  // ==========================================
  // HASIL HOOK (RETURN VALUE)
  // ==========================================
  return {
    type,
    setType,
    category,
    setCategory,
    selectedChar,
    setSelectedChar,
    isQuizActive,
    quizScore,
    quizLives,
    quizChar,
    quizOptions,
    quizInput,
    quizFeedback,
    gameOver,
    questionMode,
    questionCount,
    isVictory,
    startQuiz,
    handleOptionClick,
    handleCloseQuiz,
    themeColor,
    themeBorder,
    themeBgHover,
    themeAccent,
  };
}
