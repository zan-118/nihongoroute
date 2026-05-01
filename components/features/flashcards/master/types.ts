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
}

export type StudyMode = "latihan" | "ujian";
