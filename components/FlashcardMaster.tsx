"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import XPPop from "@/components/XPPop";
import Flashcard from "@/components/Flashcard";
import { sounds } from "@/lib/audio";
import { MasterCardData } from "./features/flashcards/master/types";
import { useFlashcardMaster } from "./features/flashcards/master/useFlashcardMaster";
import { SessionSummaryModal } from "./features/flashcards/master/SessionSummaryModal";
import { FlashcardActions } from "./features/flashcards/master/FlashcardActions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Check } from "lucide-react";

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

      {/* HEADER SECTION */}
      <div className="mb-6 flex flex-col gap-4">
        {!isFixedMode && (
          <Card className="flex justify-between items-center bg-muted/50 dark:bg-white/[0.03] p-1 rounded-xl md:rounded-2xl border border-border dark:border-white/[0.08] shadow-none">
            <Button
              variant="ghost"
              onClick={() => {
                setStudyMode("latihan");
                setIsFlipped(false);
              }}
              className={`flex-1 rounded-lg md:rounded-xl h-9 md:h-11 text-[9px] md:text-[10px] font-bold uppercase tracking-widest transition-all ${
                studyMode === "latihan"
                  ? "bg-background dark:bg-white/10 text-foreground dark:text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Brain size={14} className="mr-1.5 md:mr-2" /> Pemanasan
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setStudyMode("ujian");
                setIsFlipped(false);
              }}
              className={`flex-1 rounded-lg md:rounded-xl h-9 md:h-11 text-[9px] md:text-[10px] font-bold uppercase tracking-widest transition-all ${
                studyMode === "ujian"
                  ? `${themeBgColor} text-white dark:text-black ${themeShadow} hover:opacity-90`
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Check size={14} className="mr-1.5 md:mr-2" /> Uji Hafalan
            </Button>
          </Card>
        )}

        <div className="flex items-center gap-3 px-1">
          <Badge variant="ghost" className="text-muted-foreground font-mono text-[9px] md:text-[10px] font-bold bg-muted/50 dark:bg-white/[0.03] px-3 py-1 md:px-4 md:py-1.5 rounded-lg border border-border dark:border-white/[0.08] shadow-none h-auto">
            {currentIndex + 1} <span className="opacity-30 mx-1">/</span> {cards.length}
          </Badge>
          <Progress
            value={((currentIndex + 1) / cards.length) * 100}
            className="h-1 bg-muted dark:bg-black/40 border-none overflow-hidden rounded-full flex-1"
            indicatorClassName={`${themeBgColor} shadow-sm dark:shadow-[0_0_10px_rgba(0,238,255,0.5)]`}
          />
        </div>
      </div>

      {/* KARTU UTAMA SECTION */}
      <div className="relative w-full mb-8 md:mb-10">
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
