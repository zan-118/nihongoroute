"use client";

import { motion } from "framer-motion";
import { FlashcardProps } from "./features/flashcards/card/types";
import { useFlashcard } from "./features/flashcards/card/useFlashcard";
import { FlashcardFront } from "./features/flashcards/card/FlashcardFront";
import { FlashcardBack } from "./features/flashcards/card/FlashcardBack";
import { WritingPracticeModal } from "./features/flashcards/card/WritingPracticeModal";

export default function Flashcard({
  word,
  meaning,
  furigana,
  romaji,
  kanjiDetails,
  isFlipped,
  onFlip,
  type = "vocab",
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
      <div
        className="relative w-full aspect-square max-h-[550px] sm:max-h-[600px] cursor-pointer mx-auto"
        style={{ perspective: "1500px" }}
        onClick={handleClick}
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
          <FlashcardFront word={word} themeContext={themeContext} />

          <FlashcardBack
            word={word}
            meaning={meaning}
            furigana={furigana}
            romaji={romaji}
            kanjiDetails={kanjiDetails}
            themeContext={themeContext}
            onDrawClick={handleDrawClick}
          />
        </motion.div>
      </div>

      <WritingPracticeModal
        word={word}
        isOpen={showWritingModal}
        onClose={() => setShowWritingModal(false)}
      />
    </>
  );
}
