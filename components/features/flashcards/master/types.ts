export interface MasterCardData {
  _id?: string;
  id?: string;
  word: string;
  meaning: string;
  furigana?: string;
  romaji?: string;
  level?: { code: string };
  kanjiDetails?: { onyomi?: string; kunyomi?: string };
  details?: { onyomi?: string; kunyomi?: string };
  category?: string;
  mnemonic?: string;
  relatedKanji?: Array<{
    character: string;
    meaning: string;
    onyomi?: string;
    kunyomi?: string;
  }>;
}

export type StudyMode = "latihan" | "ujian" | "tantangan";
