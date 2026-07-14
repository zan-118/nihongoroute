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
 * Custom hook to manage Kana quiz state, score, lives, options, and handlers.
 * 
 * @returns Object containing quiz state, theme variables, and control handlers.
 */
export function useKanaQuiz() {
  // ==========================================
  // STATUS & STATE & HOOKS
  // ==========================================
  const searchParams = useSearchParams();
  
  /** Active kana type (hiragana or katakana) */
  const [type, setType] = useState<KanaType>("hiragana");
  
  /** Active kana category (seion, dakuon, or yoon) */
  const [category, setCategory] = useState<KanaCategory>("seion");
  
  /** Currently selected character for writing practice */
  const [selectedChar, setSelectedChar] = useState<{
    char: string;
    romaji: string;
  } | null>(null);

  // ==========================================
  // EFEK SAMPING (EFFECTS)
  // ==========================================
  // Auto-open writing dialog if mode=writing is present in URL search parameters
  useEffect(() => {
    const mode = searchParams.get("mode");
    if (mode === "writing" && !selectedChar) {
      // Defer state update to avoid rendering conflicts
      requestAnimationFrame(() => {
        setSelectedChar({ char: "あ", romaji: "a" });
      });
    }
  }, [searchParams, selectedChar]);

  /** Flag indicating if the quiz is currently active */
  const [isQuizActive, setIsQuizActive] = useState(false);
  
  /** Current score of the user in the active quiz session */
  const [quizScore, setQuizScore] = useState(0);
  
  /** Remaining lives of the user in the active quiz session */
  const [quizLives, setQuizLives] = useState(3);
  
  /** Current target character for the active quiz question */
  const [quizChar, setQuizChar] = useState<{ char: string; romaji: string } | null>(null);
  
  /** Multiple choice options for the current question */
  const [quizOptions, setQuizOptions] = useState<string[]>([]);
  
  /** User's selected answer input */
  const [quizInput, setQuizInput] = useState("");
  
  /** Feedback status for the answered question */
  const [quizFeedback, setQuizFeedback] = useState<"correct" | "incorrect" | null>(null);
  
  /** Flag indicating if the quiz session has ended */
  const [gameOver, setGameOver] = useState(false);
  
  /** Question mode: classic (read kana, choose romaji) or audio (hear sound, choose kana) */
  const [questionMode, setQuestionMode] = useState<"classic" | "audio">("classic");
  
  /** Total number of questions answered in the current session */
  const [questionCount, setQuestionCount] = useState(0);
  
  /** Flag indicating if the user successfully passed the quiz */
  const [isVictory, setIsVictory] = useState(false);

  /** Action to add experience points to the user's profile */
  const addXP = useUserStore((state) => state.addXP);

  // ==========================================
  // FUNGSI PEMBANTU (HELPERS)
  // ==========================================

  /**
   * Retrieves all valid kana characters and their romaji equivalents for a given type and category.
   * 
   * @param currentType - The kana type (hiragana/katakana).
   * @param currentCategory - The kana category (seion/dakuon/yoon).
   * @returns Array of character-romaji pairs.
   */
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
  
  /**
   * Generates the next quiz question, randomizes the mode, and populates multiple choice options.
   * 
   * @param currentType - The active kana type.
   * @param currentCategory - The active kana category.
   */
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
    
    // Fill options set with unique incorrect answers
    while (options.size < 4 && options.size < pairs.length) {
      const wrongPair = pairs[Math.floor(Math.random() * pairs.length)];
      const wrongValue = nextMode === "classic" ? wrongPair.romaji : wrongPair.char;
      options.add(wrongValue);
    }
    
    // Shuffle options randomly
    const shuffledOptions = Array.from(options).sort(() => Math.random() - 0.5);
    
    setQuizChar(randomPair);
    setQuizOptions(shuffledOptions);
    setQuizInput("");
    setQuizFeedback(null);
  }, [type, category, getAllKanaForType]);

  /**
   * Resets quiz states and starts a new quiz session.
   */
  const startQuiz = useCallback(() => {
    setQuizScore(0);
    setQuizLives(3);
    setQuestionCount(0);
    setIsVictory(false);
    setGameOver(false);
    setIsQuizActive(true);
    nextQuizQuestion(type, category);
  }, [type, category, nextQuizQuestion]);

  /**
   * Handles the user's option selection, updates score/lives, and checks for game over or victory conditions.
   * 
   * @param option - The selected answer string.
   */
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

      // Check if maximum questions reached
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
      
      // Check if lives depleted or maximum questions reached
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

  /**
   * Closes the quiz modal and resets victory/gameover states.
   * 
   * @param open - Boolean indicating if the quiz should remain open.
   */
  const handleCloseQuiz = useCallback((open: boolean) => {
    setIsQuizActive(open);
    if (!open) {
      setGameOver(false);
      setIsVictory(false);
    }
  }, []);

  // Dynamic theme classes based on active kana type
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