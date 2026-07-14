/**
 * @file types.ts
 * @description Definisi tipe data (TypeScript) untuk komponen kartu Flashcard dan tema visualisasi kartu.
 */

/**
 * Properties for Flashcard component.
 * Holds vocabulary, kanji, SRS state, and study mode configurations.
 */
export interface FlashcardProps {
  /** Unique identifier for flashcard */
  id: string;
  /** Document category type */
  docType?: "vocab" | "kanji" | "sentence";
  /** URL-friendly identifier */
  slug?: string;
  /** Target Japanese text */
  word: string;
  /** Translation or definition */
  meaning: string;
  /** Reading guide in kana */
  furigana?: string | null;
  /** Romanized reading */
  romaji?: string | null;
  /** Readings specific to kanji cards */
  kanjiDetails?: { onyomi?: string | null; kunyomi?: string | null };
  /** Card flip state flag */
  isFlipped: boolean;
  /** Callback to toggle flip state */
  onFlip: () => void;
  /** Card category type */
  type?: "vocab" | "kanji";
  /** Spaced Repetition System parameters */
  srsState?: {
    /** Days until next review */
    interval: number;
    /** Number of consecutive correct reviews */
    repetition: number;
    /** Ease factor multiplier */
    easeFactor: number;
    /** Timestamp ms (next_review) */
    nextReview: number;
  };
  /** Trigger shake animation on wrong answer */
  isShaking?: boolean;
  /** Active study session mode */
  studyMode?: "latihan" | "ujian" | "tantangan";
  /** Current text entered by user */
  userInput?: string;
  /** Callback triggered on input change */
  onUserInputChange?: (val: string) => void;
  /** Flag indicating answer validation completed */
  isAnswerChecked?: boolean;
  /** Result of answer validation */
  inputResult?: "correct" | "wrong" | null;
  /** Memory aid text */
  mnemonic?: string | null;
  /** Pitch accent pattern representation */
  pitch_accent?: string | null;
  /** Example sentences with translations */
  examples?: Array<{ japanese: string; indonesian: string }> | null;
  /** Part of speech tags */
  hinshi?: string[] | null;
  /** URL to pronunciation audio file */
  audio_url?: string | null;
  /** Konjugasi kata kerja — dari kolom conjugations (jsonb) */
  conjugations?: {
    negative?: string;
    past?: string;
    pastNegative?: string;
    teForm?: string;
    adverbial?: string;
    [key: string]: string | undefined;
  } | null;
  /** Associated kanji characters and details */
  related_kanji?: Array<{
    character: string;
    meaning: string;
    onyomi?: string | null;
    kunyomi?: string | null;
  }> | null;
}

/**
 * Visual theme configuration context for flashcards.
 * Determines styling classes based on card type.
 */
export interface FlashcardThemeContext {
  /** True if card displays kanji content */
  isKanji: boolean;
  /** Tailwind color class for text/background */
  themeColor: string;
  /** Tailwind border styling class */
  themeBorder: string;
  /** Tailwind shadow styling class */
  themeShadow: string;
  /** Tailwind glow effect styling class */
  glowClass: string;
}