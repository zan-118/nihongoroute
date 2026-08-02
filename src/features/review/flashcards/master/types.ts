/**
 * @file types.ts
 * @description Deklarasi tipe data dan antarmuka untuk modul kartu pengingat (flashcard) master, memetakan format internal data kartu kosakata/kanji JLPT serta mode belajar aktif.
 */

// ==========================================
// DEKLARASI TIPE & ANTARMUKA
// ==========================================
/**
 * Antarmuka MasterCardData memetakan seluruh data kosakata, kanji, arti, furigana, romaji, mnemonic, dan contoh kalimat.
 */
export interface MasterCardData {
 /** ID dari Supabase (uuid) */
 id: string;
 /** "vocab" | "kanji" — ditentukan dari konteks, bukan kolom DB */
 docType?: "vocab" | "kanji" | "sentence";
 /** Unique URL identifier */
 slug?: string;
 /** Target Japanese word or character */
 word: string;
 /** Shorthand meaning */
 meaning: string;
 /** Reading helper in kana */
 furigana?: string | null;
 /** Latin alphabet representation */
 romaji?: string | null;
 /** JLPT difficulty level */
 jlpt_level?: string | null;
 /** Memory aid text */
 mnemonic?: string | null;
 /** Pitch accent pattern */
 pitch_accent?: string | null;
 /** Part of speech tags */
 hinshi?: string[] | null;
 /** Khusus kanji: onyomi & kunyomi */
 kanjiDetails?: { onyomi?: string | null; kunyomi?: string | null };
 /** Example sentences for context */
 examples?: Array<{ japanese: string; indonesian: string }> | null;
 /** Associated kanji characters */
 related_kanji?: Array<{
 character: string;
 meaning: string;
 onyomi?: string | null;
 kunyomi?: string | null;
 }> | null;
 /** Pronunciation audio link */
 audio_url?: string | null;
 /** Visibility flag for flashcard deck */
 show_in_flashcard?: boolean;
}

/**
 * Active learning mode options
 */
export type StudyMode = "latihan" | "ujian" | "tantangan" | "pelafalan";