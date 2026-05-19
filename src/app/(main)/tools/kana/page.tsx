/**
 * @file app/(main)/tools/kana/page.tsx
 * @description Halaman fondasi aksara bahasa Jepang (Matriks Kana) yang memuat tabel Hiragana & Katakana lengkap.
 * @module Client Component
 */

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";

// Feature Components & Data
import { KANA_DATA, KanaType, KanaCategory } from "@/components/features/tools/kana/kana-data";
import { KanaHeader } from "@/components/features/tools/kana/KanaHeader";
import { KanaControls } from "@/components/features/tools/kana/KanaControls";
import { KanaMatrix } from "@/components/features/tools/kana/KanaMatrix";
import { KanaWritingDialog } from "@/components/features/tools/kana/KanaWritingDialog";
import { KanaQuizDialog } from "@/components/features/tools/kana/KanaQuizDialog";

export default function KanaPage() {
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

  const getAllKanaForType = useCallback((currentType: KanaType) => {
    const pairs: { char: string; romaji: string }[] = [];
    const categories: KanaCategory[] = ["seion", "dakuon", "yoon"];
    categories.forEach((cat) => {
      const data = KANA_DATA[cat];
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
    });
    return pairs;
  }, []);

  const nextQuizQuestion = useCallback((currentType: KanaType = type) => {
    const pairs = getAllKanaForType(currentType);
    const randomPair = pairs[Math.floor(Math.random() * pairs.length)];
    
    const options = new Set<string>();
    options.add(randomPair.romaji);
    while (options.size < 4 && options.size < pairs.length) {
      const randomWrong = pairs[Math.floor(Math.random() * pairs.length)].romaji;
      options.add(randomWrong);
    }
    
    const shuffledOptions = Array.from(options).sort(() => Math.random() - 0.5);
    
    setQuizChar(randomPair);
    setQuizOptions(shuffledOptions);
    setQuizInput("");
    setQuizFeedback(null);
  }, [type, getAllKanaForType]);

  const startQuiz = () => {
    setQuizScore(0);
    setQuizLives(3);
    setGameOver(false);
    setIsQuizActive(true);
    nextQuizQuestion(type);
  };

  const handleOptionClick = (option: string) => {
    if (gameOver || !quizChar || quizFeedback) return;
    setQuizInput(option);

    if (option.toLowerCase() === quizChar.romaji.toLowerCase()) {
      setQuizFeedback("correct");
      setQuizScore((s) => s + 1);
      setTimeout(() => {
        nextQuizQuestion();
      }, 500);
    } else {
      setQuizFeedback("incorrect");
      setQuizLives((l) => l - 1);
      if (quizLives - 1 <= 0) {
        setGameOver(true);
      } else {
        setTimeout(() => {
          setQuizFeedback(null);
        }, 500);
      }
    }
  };

  const isHira = type === "hiragana";
  const themeColor = isHira ? "text-primary" : "text-secondary";
  const themeBorder = isHira ? "border-primary/30" : "border-secondary/30";
  const themeBgHover = isHira ? "hover:bg-primary/10" : "hover:bg-secondary/10";
  const themeAccent = isHira ? "bg-primary" : "bg-secondary";

  return (
    <div className="w-full flex-1 relative overflow-hidden flex flex-col bg-background transition-colors duration-300 pt-12 pb-24 px-4 md:px-8">
      <div className="neural-grid" />

      <div className="max-w-4xl mx-auto w-full relative z-10 flex flex-col h-full">
        <KanaHeader themeColor={themeColor} />

        <KanaControls 
          type={type}
          setType={setType}
          category={category}
          setCategory={setCategory}
          startQuiz={startQuiz}
          themeColor={themeColor}
          themeBorder={themeBorder}
          themeAccent={themeAccent}
        />

        <KanaMatrix 
          type={type}
          category={category}
          onSelectChar={(char, romaji) => setSelectedChar({ char, romaji })}
          themeBgHover={themeBgHover}
        />
      </div>

      <KanaWritingDialog 
        selectedChar={selectedChar}
        setSelectedChar={setSelectedChar}
        type={type}
        themeColor={themeColor}
        themeBorder={themeBorder}
      />

      <KanaQuizDialog 
        isActive={isQuizActive}
        onClose={(open) => {
          setIsQuizActive(open);
          if (!open) setGameOver(false);
        }}
        lives={quizLives}
        score={quizScore}
        char={quizChar}
        options={quizOptions}
        input={quizInput}
        feedback={quizFeedback}
        gameOver={gameOver}
        onOptionClick={handleOptionClick}
        startQuiz={startQuiz}
        type={type}
        themeColor={themeColor}
        themeBorder={themeBorder}
        themeAccent={themeAccent}
      />
    </div>
  );
}
