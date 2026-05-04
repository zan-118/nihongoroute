export interface FlashcardProps {
  id: string;
  word: string;
  meaning: string;
  furigana?: string;
  romaji?: string;
  kanjiDetails?: { onyomi?: string; kunyomi?: string };
  isFlipped: boolean;
  onFlip: () => void;
  type?: "vocab" | "kanji";
  srsState?: {
    interval: number;
    repetition: number;
    easeFactor: number;
    nextReview: number;
  };
  isShaking?: boolean;
  studyMode?: "latihan" | "ujian" | "tantangan";
  userInput?: string;
  onUserInputChange?: (val: string) => void;
  isAnswerChecked?: boolean;
  inputResult?: "correct" | "wrong" | null;
  mnemonic?: string;
  relatedKanji?: Array<{
    character: string;
    meaning: string;
    onyomi?: string;
    kunyomi?: string;
  }>;
}

export interface FlashcardThemeContext {
  isKanji: boolean;
  themeColor: string;
  themeBorder: string;
  themeShadow: string;
  glowClass: string;
}
