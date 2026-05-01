"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import XPPop from "@/components/XPPop";
import Flashcard from "@/components/Flashcard";
import { sounds } from "@/lib/audio";
import { MasterCardData } from "./features/flashcards/master/types";
import { useFlashcardMaster } from "./features/flashcards/master/useFlashcardMaster";
import { SessionSummaryModal } from "./features/flashcards/master/SessionSummaryModal";
import { FlashcardHeader } from "./features/flashcards/master/FlashcardHeader";
import { FlashcardActions } from "./features/flashcards/master/FlashcardActions";

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
    handleNav,
    handleAnswer,
    handleRestart,
    router,
  } = useFlashcardMaster({ cards, initialMode: mode });

  if (!isClient || !cards || cards.length === 0) return null;

  const card = cards[currentIndex];
  const isKanji = type === "kanji";
  const themeColor = isKanji ? "text-purple-400" : "text-cyber-neon";
  const themeBgColor = isKanji ? "bg-purple-500" : "bg-cyber-neon";
  const themeShadow = isKanji
    ? "shadow-[0_0_20px_rgba(168,85,247,0.3)]"
    : "shadow-[0_0_20px_rgba(0,238,255,0.3)]";

  return (
    <section className="w-full max-w-2xl mx-auto relative px-4 md:px-0">
      <SessionSummaryModal
        isFinished={isFinished}
        setIsFinished={setIsFinished}
        cardsCount={cards.length}
        sessionStats={sessionStats}
        themeBgColor={themeBgColor}
        themeShadow={themeShadow}
        handleRestart={handleRestart}
        router={router}
      />

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
        <XPPop show={showXP} amount={15} />
      </div>

      <FlashcardHeader
        isFixedMode={isFixedMode}
        studyMode={studyMode}
        setStudyMode={setStudyMode}
        setIsFlipped={setIsFlipped}
        currentIndex={currentIndex}
        totalCards={cards.length}
        themeColor={themeColor}
        themeBgColor={themeBgColor}
        themeShadow={themeShadow}
      />

      {/* KARTU UTAMA SECTION */}
      <div className="relative w-full mb-8 md:mb-10">
        {/* SRS LIFE BAR (Mini Progress) */}
        <div className="mb-4 flex flex-col gap-1.5 px-2">
          <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-[0.3em] text-slate-500">
            <span>Session Energy</span>
            <span className={themeColor}>
              {Math.round(((currentIndex + 1) / cards.length) * 100)}%
            </span>
          </div>
          <Progress
            value={((currentIndex + 1) / cards.length) * 100}
            className="h-1 bg-black/40 border-none overflow-hidden rounded-full"
            indicatorClassName={`${themeBgColor} shadow-[0_0_15px_rgba(0,238,255,0.8)] animate-pulse`}
          />
        </div>

        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={currentIndex}
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
              word={card.word}
              meaning={card.meaning}
              furigana={card.furigana}
              romaji={card.romaji}
              kanjiDetails={card.kanjiDetails || card.details}
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
