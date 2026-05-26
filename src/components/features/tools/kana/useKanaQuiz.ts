"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useUserStore } from "@/store/useUserStore";
import { KANA_DATA, KanaType, KanaCategory } from "./kana-data";

/**
 * Custom Hook: useKanaQuiz
 * 
 * Mengelola state dan logika interaksi kuis serta latihan menulis karakter Hiragana dan Katakana (Kana).
 * Mendeteksi mode penulisan dari parameter URL peramban, mengelola alur pertanyaan kuis acak,
 * penilaian akurasi jawaban, nyawa (lives), skor akhir, serta penambahan poin XP pengguna.
 * 
 * @returns {Object} State matriks kana, status kuis, dan callback handler interaksi
 * @returns {KanaType} type - Jenis kana aktif ("hiragana" | "katakana")
 * @returns {Function} setType - Setter jenis kana
 * @returns {KanaCategory} category - Kategori bunyi aktif ("seion", "dakuon", "yoon")
 * @returns {Function} setCategory - Setter kategori bunyi kana
 * @returns {Object | null} selectedChar - Karakter kana terpilih untuk latihan menulis (char, romaji)
 * @returns {Function} setSelectedChar - Setter karakter kana terpilih
 * @returns {boolean} isQuizActive - Status aktif dialog layar kuis kana
 * @returns {number} quizScore - Jumlah skor/jawaban benar pada sesi kuis aktif
 * @returns {number} quizLives - Jumlah sisa nyawa sesi kuis aktif (maksimal 3)
 * @returns {Object | null} quizChar - Karakter target soal aktif (char, romaji)
 * @returns {string[]} quizOptions - Daftar 4 pilihan jawaban romaji/karakter acak
 * @returns {string} quizInput - Pilihan jawaban yang di-klik pengguna
 * @returns {string | null} quizFeedback - Umpan balik jawaban ("correct" | "incorrect")
 * @returns {boolean} gameOver - Status kuis berakhir (selesai 20 soal atau nyawa habis)
 * @returns {string} questionMode - Mode soal aktif ("classic" romaji-to-char vs "audio" audio-to-char)
 * @returns {number} questionCount - Jumlah soal yang telah dijawab (maksimal 20)
 * @returns {boolean} isVictory - Menandakan apakah pengguna lulus kuis dengan skor >= 15
 * @returns {Function} startQuiz - Callback untuk memulai sesi kuis baru dan mengatur ulang state
 * @returns {Function} handleOptionClick - Callback saat salah satu pilihan jawaban di-klik
 * @returns {Function} handleCloseQuiz - Callback untuk menutup modal dialog sesi kuis
 * @returns {string} themeColor - Kode kelas warna teks visual tema ("text-primary" | "text-secondary")
 * @returns {string} themeBorder - Kode kelas warna border tema ("border-primary/30" | "border-secondary/30")
 * @returns {string} themeBgHover - Kode kelas warna hover latar belakang tema ("hover:bg-primary/10" | "hover:bg-secondary/10")
 * @returns {string} themeAccent - Kode kelas warna latar belakang tombol tema ("bg-primary" | "bg-secondary")
 */
export function useKanaQuiz() {
  const searchParams = useSearchParams();
  const [type, setType] = useState<KanaType>("hiragana");
  const [category, setCategory] = useState<KanaCategory>("seion");
  const [selectedChar, setSelectedChar] = useState<{
    char: string;
    romaji: string;
  } | null>(null);

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
