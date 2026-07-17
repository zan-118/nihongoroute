/**
 * @file index.ts
 * @description Tipe data dan antarmuka untuk aktivitas latihan Menyimak (Listening Comprehension).
 */

// ==========================================
// ANTARMUKA & TIPE DATA UTAMA
// ==========================================

/**
 * Represents a single line in the audio transcript.
 */
export interface TranscriptLine {
  /** Unique identifier for the line. */
  _key: string;
  /** Raw text content or Portable Text structure for vocabulary triggers. */
  text: string | unknown[]; // Bisa berupa teks mentah atau Portable Text (VocabTrigger)
  /** Start time of the line in seconds. */
  startTime: number; // Dalam detik
  /** End time of the line in seconds. */
  endTime: number; // Dalam detik
  /** Optional speaker identifier. */
  speaker?: string;
  /** Optional translation of the text. */
  translation?: string;
  /** Optional furigana reading for Japanese text. */
  furigana?: string;
}

/**
 * Represents an option within a quiz question.
 */
export interface QuizOption {
  /** Text content of the option. */
  text: string;
  /** Indicates if this option is the correct answer. */
  isCorrect: boolean;
}

/**
 * Represents a single quiz question item.
 */
export interface QuizItem {
  /** Unique identifier for the quiz item. */
  _id: string;
  /** The question text. */
  question: string;
  /** List of available options. */
  options: QuizOption[];
  /** Optional explanation for the correct answer. */
  explanation?: string;
}

/**
 * Data structure for a listening comprehension task.
 */
export interface ListeningTaskData {
  /** Optional identifier. */
  id?: string;
  /** Optional database identifier. */
  _id?: string;
  /** Optional URL slug. */
  slug?: string;
  /** Title of the listening task. */
  title: string;
  /** URL of the audio file. */
  audioUrl: string;
  /** Array of transcript lines. */
  transcript: TranscriptLine[];
  /** Optional description of the task. */
  description?: string;
  /** Optional list of quiz questions. */
  quiz?: QuizItem[];
  /** Optional JLPT level. */
  jlpt_level?: string;
  /** Optional difficulty level. */
  difficulty?: string;
  /** Optional illustrations associated with the task. */
  illustrations?: { title?: string; content: string }[];
  /** Optional image URL. */
  image_url?: string;
  /** Optional body text. */
  body?: string;
  /** Optional translation of the body text. */
  translation?: string;
}

/**
 * State structure for the listening component.
 */
export interface ListeningState {
  /** Current playback time of the audio in seconds. */
  currentTime: number;
  /** Index of the currently active transcript line. */
  activeIndex: number;
  /** Flag indicating if auto-scrolling is active. */
  isScrolling: boolean;
  /** Active tab identifier. */
  activeTab: "transcript"; // tab quiz dihapus, kuis kini inline di bawah transkrip
}