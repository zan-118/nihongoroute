"use client";

/**
 * @file FlashcardMaster.tsx
 * @description Main orchestrator component for flashcard study sessions. Manages card transitions, audio pronunciation integration, visual XP feedback, session summary modals, and Zustand state synchronization.
 */

// Import & Dependencies

import { useEffect } from "react";
import { m, AnimatePresence } from "framer-motion";

import XPPop from "@/features/gamification/XPPop";
import Flashcard from "@/features/review/flashcards/card/Flashcard";
import { sounds } from "@/lib/audio";
import { MasterCardData, StudyMode } from "./types";
import { useFlashcardMaster } from "./useFlashcardMaster";
import { SessionSummaryModal } from "./SessionSummaryModal";
import { FlashcardActions } from "./FlashcardActions";
import { FlashcardHeader } from "./FlashcardHeader";
import PronunciationPanel from "./PronunciationPanel";

// Main Component

/**
 * Main orchestrator component for flashcard study sessions.
 * Manages card navigation, study modes, user input validation, and session statistics.
 *
 * @param props - Component properties.
 * @param props.cards - Array of flashcard data.
 * @param props.type - Card category type (vocab or kanji).
 * @param props.mode - Initial study mode.
 * @param props.isFixedMode - Lock study mode to prevent manual changes.
 * @param props.onFinish - Callback triggered when session completes.
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

 // Trigger parent callback when session finishes.
 useEffect(() => {
 if (isFinished && onFinish) {
 onFinish();
 }
 }, [isFinished, onFinish]);

 // Prevent SSR mismatch or rendering empty cards.
 if (!isClient || !cards || cards.length === 0) return null;

 const card = currentCards[currentIndex];
 const cardId = card.id || "";
 const srsState = srs[cardId];
 const isKanji = card.docType === "kanji" || type === "kanji";
 
 // Compute theme styles based on card type.
 const themeColor = isKanji ? "text-secondary" : "text-primary";
 const themeBgColor = isKanji ? "bg-secondary" : "bg-primary";
 const themeShadow = isKanji
 ? "shadow-md shadow-sm"
 : "shadow-md shadow-sm";

 return (
 <section className="w-full max-w-2xl mx-auto relative px-4 md:px-0 transition-colors duration-300">
 {/* Modal shown when all cards are completed */}
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

 {/* Floating XP feedback animation */}
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
 {/* Animate card transitions based on navigation direction */}
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
 // Restrict flipping in test/challenge modes.
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

 {/* Action buttons for navigation and answering */}
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
 {/* Background sync status indicator */}
 {isSyncing && (
 <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-[10px] text-muted-foreground text-center w-full">
 Menyinkronkan progres ke cloud…
 </div>
 )}
 </section>
 );
}