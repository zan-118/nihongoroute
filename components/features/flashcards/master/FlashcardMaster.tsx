"use client";

import { motion, AnimatePresence } from "framer-motion";

import XPPop from "@/components/features/gamification/XPPop";
import Flashcard from "@/components/features/flashcards/card/Flashcard";
import { sounds } from "@/lib/audio";
import { MasterCardData } from "./types";
import { useFlashcardMaster } from "./useFlashcardMaster";
import { SessionSummaryModal } from "./SessionSummaryModal";
import { FlashcardActions } from "./FlashcardActions";
import { FlashcardHeader } from "./FlashcardHeader";

export default function FlashcardMaster({
  cards,
  type = "vocab",
  mode = "latihan",
  isFixedMode = false,
}: {
  cards: MasterCardData[];
  type?: "vocab" | "kanji";
  mode?: "latihan" | "ujian";
  isFixedMode?: boolean;
}) {
  const {
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
    handleRestart,
    handleReviewMistakes,
    mistakeIndices,
    currentCards,
    progress,
    router,
  } = useFlashcardMaster({ cards, initialMode: mode });

  if (!isClient || !cards || cards.length === 0) return null;

  const card = cards[currentIndex];
  const cardId = card._id || card.id || "";
  const srsState = progress.srs[cardId];
  const isKanji = type === "kanji";
  const themeColor = isKanji ? "text-purple-600 dark:text-purple-400" : "text-primary";
  const themeBgColor = isKanji ? "bg-purple-600 dark:bg-purple-500" : "bg-primary";
  const themeShadow = isKanji
    ? "shadow-lg dark:shadow-[0_0_20px_rgba(168,85,247,0.3)]"
    : "shadow-lg dark:shadow-[0_0_20px_rgba(0,238,255,0.3)]";

  return (
    <section className="w-full max-w-2xl mx-auto relative px-4 md:px-0 transition-colors duration-300">
      <SessionSummaryModal
        isFinished={isFinished}
        setIsFinished={setIsFinished}
        cardsCount={currentCards.length}
        sessionStats={sessionStats}
        themeBgColor={themeBgColor}
        themeShadow={themeShadow}
        handleRestart={handleRestart}
        handleReviewMistakes={handleReviewMistakes}
        mistakeCount={mistakeIndices.length}
        router={router}
      />

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
        <XPPop show={showXP} amount={15} />
      </div>

      {/* HEADER SECTION */}
      <FlashcardHeader
        isFixedMode={isFixedMode}
        studyMode={studyMode}
        setStudyMode={setStudyMode}
        setIsFlipped={setIsFlipped}
        currentIndex={currentIndex}
        totalCards={currentCards.length}
        themeColor={themeColor}
        themeBgColor={themeBgColor}
        themeShadow={themeShadow}
        router={router}
      />

      {/* KARTU UTAMA SECTION */}
      <div className="relative w-full mb-8 md:mb-10">
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={currentCards[currentIndex]?._id || currentIndex}
            initial={{
              x: direction === 1 ? 200 : direction === -1 ? -200 : 0,
              opacity: 0,
              scale: 0.95,
            }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            exit={{
              x: direction === 1 ? -200 : direction === -1 ? 200 : 0,
              opacity: 0,
              scale: 0.95,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <Flashcard
              id={cardId}
              word={currentCards[currentIndex]?.word}
              meaning={currentCards[currentIndex]?.meaning}
              furigana={currentCards[currentIndex]?.furigana}
              romaji={currentCards[currentIndex]?.romaji}
              kanjiDetails={currentCards[currentIndex]?.kanjiDetails || currentCards[currentIndex]?.details}
              isFlipped={isFlipped}
              onFlip={() => {
                if (studyMode === "ujian" && isFlipped) return;
                sounds?.playPop();
                if (studyMode === "ujian") {
                  setIsFlipped(true);
                } else {
                  setIsFlipped((prev) => !prev);
                }
              }}
              type={type}
              srsState={srsState}
              isShaking={isShaking}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <FlashcardActions
        studyMode={studyMode}
        isFlipped={isFlipped}
        currentIndex={currentIndex}
        totalCards={cards.length}
        themeColor={themeColor}
        handleNav={handleNav}
        handleAnswer={handleAnswer}
      />
    </section>
  );
}
