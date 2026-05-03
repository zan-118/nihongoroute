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
}

export interface FlashcardThemeContext {
  isKanji: boolean;
  themeColor: string;
  themeBorder: string;
  themeShadow: string;
  glowClass: string;
}
