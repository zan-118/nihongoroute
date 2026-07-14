/**
 * @file Flashcard.tsx
 * @description Komponen utama kartu Flashcard interaktif dengan efek flip 3D menggunakan Framer Motion. Mengintegrasikan sisi depan (pertanyaan) dan belakang (jawaban).
 */

// ==========================================
// IMPORT & DEPENDENSI
// ==========================================
import { m } from "framer-motion";
import { FlashcardProps } from "./types";
import { useFlashcard } from "./useFlashcard";
import { FlashcardFront } from "./FlashcardFront";
import { FlashcardBack } from "./FlashcardBack";
import { WritingPracticeModal } from "./WritingPracticeModal";

// ==========================================
// KOMPONEN UTAMA
// ==========================================
/**
 * Flashcard component.
 * Renders 3D flipping card with front (question/input) and back (answer/details) faces.
 * Supports shake animation on error and writing practice modal.
 * 
 * @param props - Component properties.
 * @returns React element.
 */
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
  // ==========================================
  // STATUS & STATE & HOOKS
  // ==========================================
  /** Custom hook managing flashcard state, theme, and click handlers */
  const {
    showWritingModal,
    setShowWritingModal,
    themeContext,
    handleClick,
    handleDrawClick,
  } = useFlashcard({ type, onFlip });

  // ==========================================
  // RENDER KOMPONEN
  // ==========================================
  return (
    <>
      {/* Outer container establishing 3D perspective context */}
      <m.div
        className="relative w-full aspect-[4/5] md:aspect-square max-h-[550px] sm:max-h-[600px] cursor-pointer mx-auto"
        style={{ perspective: "1500px" }}
        onClick={handleClick}
        // Triggers horizontal shake animation when answer is incorrect
        animate={isShaking ? {
          x: [-10, 10, -10, 10, 0],
          transition: { duration: 0.4 }
        } : {}}
      >
        {/* Inner container performing the actual 3D rotation */}
        <m.div
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
        </m.div>
      </m.div>

      {/* Modal overlay for canvas-based writing practice */}
      <WritingPracticeModal
        word={word}
        isOpen={showWritingModal}
        onClose={() => setShowWritingModal(false)}
      />
    </>
  );
}