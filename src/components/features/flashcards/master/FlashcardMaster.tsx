"use client";

/**
 * @file FlashcardMaster.tsx
 * @description Komponen pengendali utama (orchestrator) sesi belajar kartu pengingat (flashcard). Mengelola perpindahan kartu, integrasi audio pelafalan lisan, pemberian feedback visual XP, pop-up ringkasan sesi, dan sinkronisasi ke Zustand.
 */

// ==========================================
// IMPORT & DEPENDENSI
// ==========================================
import { useEffect } from "react";
import { m, AnimatePresence } from "framer-motion";

import XPPop from "@/components/features/gamification/XPPop";
import Flashcard from "@/components/features/flashcards/card/Flashcard";
import { sounds } from "@/lib/audio";
import { MasterCardData, StudyMode } from "./types";
import { useFlashcardMaster } from "./useFlashcardMaster";
import { SessionSummaryModal } from "./SessionSummaryModal";
import { FlashcardActions } from "./FlashcardActions";
import { FlashcardHeader } from "./FlashcardHeader";
import PronunciationPanel from "./PronunciationPanel";

// ==========================================
// KOMPONEN UTAMA
// ==========================================
/**
 * Komponen pembungkus utama untuk melatih kosakata atau kanji melalui kartu flashcard interaktif.
 *
 * @param {Object} props - Properti komponen
 * @param {MasterCardData[]} props.cards - Koleksi data kartu pengingat
 * @param {"vocab" | "kanji"} props.type - Kategori pembelajaran kartu
 * @param {StudyMode} props.mode - Mode belajar awal
 * @param {boolean} props.isFixedMode - Kunci mode belajar agar tidak dapat diganti manual
 * @param {Function} props.onFinish - Callback ketika sesi belajar selesai sepenuhnya
 */
export default function FlashcardMaster({
  cards,
  type = "vocab",
  mode = "latihan",
  isFixedMode = false,
  onFinish,
}: {
  cards: MasterCardData[];
  type?: "vocab" | "kanji";
  mode?: StudyMode;
  isFixedMode?: boolean;
  onFinish?: () => void;
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
    srs,
    router,
    userInput,
    setUserInput,
    isAnswerChecked,
    inputResult,
    checkAnswer,
    combo,
    isSyncing,
  } = useFlashcardMaster({ cards, initialMode: mode });

  // Pemicu onFinish untuk parent (ReviewClient)
  useEffect(() => {
    if (isFinished && onFinish) {
      onFinish();
    }
  }, [isFinished, onFinish]);

  if (!isClient || !cards || cards.length === 0) return null;

  const card = currentCards[currentIndex];
  const cardId = card.id || "";
  const srsState = srs[cardId];
  const isKanji = card.docType === "kanji" || type === "kanji";
  const themeColor = isKanji ? "text-secondary" : "text-primary";
  const themeBgColor = isKanji ? "bg-secondary" : "bg-primary";
  const themeShadow = isKanji
    ? "shadow-md dark:shadow-[0_0_12px_rgb(var(--secondary-rgb)/0.18)]"
    : "shadow-md dark:shadow-[0_0_12px_rgb(var(--primary-rgb)/0.18)]";

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
        combo={combo}
      />

      {/* KARTU UTAMA SECTION */}
      {studyMode === "pelafalan" ? (
        <div className="relative w-full mb-8 md:mb-10 animate-in fade-in duration-300">
          <PronunciationPanel
            card={currentCards[currentIndex]}
            onNext={() => handleNav(1)}
            currentIndex={currentIndex}
            totalCards={currentCards.length}
          />
        </div>
      ) : (
        <>
          <div className="relative w-full mb-8 md:mb-10">
            <AnimatePresence initial={false} mode="wait">
              <m.div
                key={currentCards[currentIndex]?.id || currentIndex}
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
                  kanjiDetails={currentCards[currentIndex]?.kanjiDetails}
                  isFlipped={isFlipped}
                  onFlip={() => {
                    if ((studyMode === "ujian" || studyMode === "tantangan") && isFlipped) return;
                    if (studyMode === "tantangan" && !isFlipped) {
                      return;
                    }
                    sounds?.playPop();
                    if (studyMode === "ujian") {
                      setIsFlipped(true);
                    } else {
                      setIsFlipped((prev) => !prev);
                    }
                  }}
                  type={isKanji ? "kanji" : "vocab"}
                  docType={card.docType}
                  slug={card.slug}
                  srsState={srsState}
                  isShaking={isShaking}
                  studyMode={studyMode}
                  userInput={userInput}
                  onUserInputChange={setUserInput}
                  isAnswerChecked={isAnswerChecked}
                  inputResult={inputResult}
                  mnemonic={card.mnemonic}
                  pitch_accent={card.pitch_accent}
                  hinshi={card.hinshi}
                  examples={card.examples}
                  related_kanji={card.related_kanji}
                />
              </m.div>
            </AnimatePresence>
          </div>

          <FlashcardActions
            studyMode={studyMode}
            isFlipped={isFlipped}
            currentIndex={currentIndex}
            totalCards={currentCards.length}
            themeColor={themeColor}
            handleNav={handleNav}
            handleAnswer={handleAnswer}
            isAnswerChecked={isAnswerChecked}
            onCheckAnswer={checkAnswer}
          />
        </>
      )}
      {isSyncing && (
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-[10px] text-muted-foreground text-center w-full">
          Menyinkronkan progres ke cloud…
        </div>
      )}
    </section>
  );
}
