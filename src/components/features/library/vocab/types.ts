export interface VocabMeaning {
  glosses: string[];
  part_of_speech?: string[];
  field?: string[];
  misc?: string[];
}

export interface VocabItem {
  id: string;
  word: string;
  furigana?: string | null;
  romaji?: string | null;
  meanings_jmdict?: VocabMeaning[];
  /** Shorthand meaning (diambil dari meanings_jmdict[0].glosses[0]) */
  meaning?: string;
  hinshi?: string[] | null;
  transitivity?: string | null;
  mnemonic?: string | null;
  slug: string;
  jlpt_level?: string | null;
  pitch_accent?: string | null;
  audio_url?: string | null;
  usage_notes?: string | null;
  is_common?: boolean;
  show_in_flashcard?: boolean;
  examples?: Array<{
    id?: string;
    jp?: string;
    romaji?: string;
    furigana?: string;
    meaning?: string;
    japanese?: string;
    indonesian?: string;
  }> | null;
  synonyms?: string[] | null;
  antonyms?: string[] | null;
  related_kanji?: Array<{
    character: string;
    meaning: string;
  }> | null;
  conjugations?: Record<string, string> | null;
  created_at?: string;
}

export const LEVELS = ["Semua", "Umum", "N5", "N4", "N3", "N2", "N1"];

export const HINSHI = [
  { label: "Semua Tipe", value: "all" },
  { label: "Kata Benda (Meishi)", value: "noun" },
  { label: "Kata Kerja (Verb)", value: "verb" },
  { label: "Kata Sifat-I (I-Keiyoushi)", value: "i-adjective" },
  { label: "Kata Sifat-Na (Na-Keiyoushi)", value: "na-adjective" },
  { label: "Kata Keterangan (Fukushi)", value: "adverb" },
  { label: "Partikel (Joshi)", value: "particle" },
  { label: "Kata Penghubung (Setsuzokushi)", value: "conjunction" },
  { label: "Kata Ganti (Daimeishi)", value: "pronoun" },
  { label: "Ungkapan (Hyougen)", value: "expression" },
];
