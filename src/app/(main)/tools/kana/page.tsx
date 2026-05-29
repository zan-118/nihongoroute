/**
 * @file page.tsx
 * @description Halaman utama Kana Master — alat latihan penguasaan aksara Hiragana dan Katakana.
 */

"use client";

// ======================
// IMPOR
// ======================
import React, { Suspense } from "react";

import { useKanaQuiz } from "@/components/features/tools/kana/useKanaQuiz";
import { KanaHeader } from "@/components/features/tools/kana/KanaHeader";
import { KanaControls } from "@/components/features/tools/kana/KanaControls";
import { KanaMatrix } from "@/components/features/tools/kana/KanaMatrix";
import { KanaWritingDialog } from "@/components/features/tools/kana/KanaWritingDialog";
import { KanaQuizDialog } from "@/components/features/tools/kana/KanaQuizDialog";

function KanaContent() {
  const {
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
  } = useKanaQuiz();

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
        onClose={handleCloseQuiz}
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
        questionMode={questionMode}
        questionCount={questionCount}
        isVictory={isVictory}
      />
    </div>
  );
}

export default function KanaPage() {
  return (
    <Suspense fallback={
      <div className="w-full flex-1 flex items-center justify-center bg-background">
        <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest animate-pulse">Memuat Kana...</p>
      </div>
    }>
      <KanaContent />
    </Suspense>
  );
}
