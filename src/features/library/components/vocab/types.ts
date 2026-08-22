/**
 * @file types.ts
 * @description Defini tipe data, antarmuka, serta daftar konstanta kategori level/kelas kata untuk pustaka kosakata.
 */

// ANTARMUKA & TIPE DATA KOSAKATA

/**
 * Represents meaning details of vocabulary item from dictionary source.
 */
export interface VocabMeaning {
 /** English glosses or translations */
 glosses: string[];
 /** Part of speech classifications */
 part_of_speech?: string[];
 /** Field of application or domain */
 field?: string[];
 /** Miscellaneous usage notes */
 misc?: string[];
}

/**
 * Represents vocabulary item structure.
 */
export interface VocabItem {
 /** Unique identifier */
 id: string;
 /** Word in Japanese kanji or kana */
 word: string;
 /** Furigana reading representation */
 furigana?: string | null;
 /** Romaji transliteration */
 romaji?: string | null;
 /** Detailed meanings from JMDict */
 meanings_jmdict?: VocabMeaning[];
 /** Arti ringkas bahasa Indonesia (Shorthand meaning) */
 meaning?: string;
 /** Part of speech tags */
 hinshi?: string[] | null;
 /** Verb transitivity type */
 transitivity?: string | null;
 /** Mnemonic aid for memory */
 mnemonic?: string | null;
 /** URL-friendly identifier */
 slug: string;
 /** JLPT level classification */
 jlpt_level?: string | null;
 /** Pitch accent pattern */
 pitch_accent?: string | null;
 /** Audio file URL path */
 audio_url?: string | null;
 /** Specific usage instructions */
 usage_notes?: string | null;
 /** Common word flag */
 is_common?: boolean;
 /** Flashcard visibility flag */
 show_in_flashcard?: boolean;
 /** Example sentences list */
 examples?: Array<{
 id?: string;
 jp?: string;
 romaji?: string;
 furigana?: string;
 meaning?: string;
 japanese?: string;
 indonesian?: string;
 }> | null;
 /** Synonymous words list */
 synonyms?: string[] | null;
 /** Antonymous words list */
 antonyms?: string[] | null;
 /** Kanji characters related to word */
 related_kanji?: Array<{
 character: string;
 meaning: string;
 }> | null;
 /** Verb or adjective conjugation forms map */
 conjugations?: Record<string, string> | null;
 /** Creation timestamp */
 created_at?: string;
}

// DAFTAR KONSTANTA DAN PRESET FILTER

/**
 * Available JLPT and general difficulty levels.
 */
export const LEVELS = ["Semua", "Umum", "N5", "N4", "N3", "N2", "N1"];

/**
 * Part of speech filter options with Indonesian labels.
 */
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