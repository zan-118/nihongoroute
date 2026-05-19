export interface MasterCardData {
  /** ID dari Supabase (uuid) */
  id: string;
  /** "vocab" | "kanji" — ditentukan dari konteks, bukan kolom DB */
  docType?: "vocab" | "kanji";
  slug?: string;
  word: string;
  /** Shorthand meaning */
  meaning: string;
  furigana?: string | null;
  romaji?: string | null;
  jlpt_level?: string | null;
  mnemonic?: string | null;
  pitch_accent?: string | null;
  hinshi?: string[] | null;
  /** Khusus kanji: onyomi & kunyomi */
  kanjiDetails?: { onyomi?: string | null; kunyomi?: string | null };
  examples?: Array<{ japanese: string; indonesian: string }> | null;
  related_kanji?: Array<{
    character: string;
    meaning: string;
    onyomi?: string | null;
    kunyomi?: string | null;
  }> | null;
  audio_url?: string | null;
  show_in_flashcard?: boolean;
}

export type StudyMode = "latihan" | "ujian" | "tantangan";
