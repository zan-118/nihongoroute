"use client";

import { motion } from "framer-motion";
import { FlashcardProps } from "./types";
import { useFlashcard } from "./useFlashcard";
import { FlashcardFront } from "./FlashcardFront";
import { FlashcardBack } from "./FlashcardBack";
import { WritingPracticeModal } from "./WritingPracticeModal";

export default function Flashcard({
  id,
  docType,
  slug,
  word,
  meaning,
  furigana,
  romaji,
  kanjiDetails,
  isFlipped,
  onFlip,
  type = "vocab",
  srsState,
  isShaking,
  studyMode,
  userInput,
  onUserInputChange,
  isAnswerChecked,
  inputResult,
  mnemonic,
  related_kanji,
}: FlashcardProps) {
  const {
    showWritingModal,
    setShowWritingModal,
    themeContext,
    handleClick,
    handleDrawClick,
  } = useFlashcard({ type, onFlip });


  return (
    <>
      <motion.div
        className="relative w-full aspect-[4/5] md:aspect-square max-h-[550px] sm:max-h-[600px] cursor-pointer mx-auto"
        style={{ perspective: "1500px" }}
        onClick={handleClick}
        animate={isShaking ? {
          x: [-10, 10, -10, 10, 0],
          transition: { duration: 0.4 }
        } : {}}
      >
        <motion.div
          className="w-full h-full relative"
          style={{ transformStyle: "preserve-3d" }}
          initial={false}
          animate={{
            rotateY: isFlipped ? 180 : 0,
          }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
          <FlashcardFront 
            word={word} 
            themeContext={themeContext} 
            studyMode={studyMode}
            userInput={userInput}
            onUserInputChange={onUserInputChange}
            isAnswerChecked={isAnswerChecked}
            inputResult={inputResult}
            srsState={srsState}
          />

          <FlashcardBack
            id={id}
            docType={docType}
            slug={slug}
            word={word}
            meaning={meaning}
            furigana={furigana}
            romaji={romaji}
            kanjiDetails={kanjiDetails}
            themeContext={themeContext}
            onDrawClick={handleDrawClick}
            srsState={srsState}
            mnemonic={mnemonic}
            relatedKanji={related_kanji}
          />
        </motion.div>
      </motion.div>

      <WritingPracticeModal
        word={word}
        isOpen={showWritingModal}
        onClose={() => setShowWritingModal(false)}
      />
    </>
  );
}
