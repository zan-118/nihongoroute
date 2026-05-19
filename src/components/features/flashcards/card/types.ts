export interface FlashcardProps {
  id: string;
  docType?: "vocab" | "kanji";
  slug?: string;
  word: string;
  meaning: string;
  furigana?: string | null;
  romaji?: string | null;
  kanjiDetails?: { onyomi?: string | null; kunyomi?: string | null };
  isFlipped: boolean;
  onFlip: () => void;
  type?: "vocab" | "kanji";
  srsState?: {
    interval: number;
    repetition: number;
    easeFactor: number;
    /** Timestamp ms (next_review) */
    nextReview: number;
  };
  isShaking?: boolean;
  studyMode?: "latihan" | "ujian" | "tantangan";
  userInput?: string;
  onUserInputChange?: (val: string) => void;
  isAnswerChecked?: boolean;
  inputResult?: "correct" | "wrong" | null;
  mnemonic?: string | null;
  pitch_accent?: string | null;
  examples?: Array<{ japanese: string; indonesian: string }> | null;
  hinshi?: string[] | null;
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
  related_kanji?: Array<{
    character: string;
    meaning: string;
    onyomi?: string | null;
    kunyomi?: string | null;
  }> | null;
}

export interface FlashcardThemeContext {
  isKanji: boolean;
  themeColor: string;
  themeBorder: string;
  themeShadow: string;
  glowClass: string;
}
