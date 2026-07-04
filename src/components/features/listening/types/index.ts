/**
 * @file index.ts
 * @description Tipe data dan antarmuka untuk aktivitas latihan Menyimak (Listening Comprehension).
 */

// ==========================================
// ANTARMUKA & TIPE DATA UTAMA
// ==========================================
export interface TranscriptLine {
  _key: string;
  text: string | unknown[]; // Bisa berupa teks mentah atau Portable Text (VocabTrigger)
  startTime: number; // Dalam detik
  endTime: number; // Dalam detik
  speaker?: string;
  translation?: string;
  furigana?: string;
}

export interface QuizOption {
  text: string;
  isCorrect: boolean;
}

export interface QuizItem {
  _id: string;
  question: string;
  options: QuizOption[];
  explanation?: string;
}

export interface ListeningTaskData {
  id?: string;
  _id?: string;
  slug?: string;
  title: string;
  audioUrl: string;
  transcript: TranscriptLine[];
  description?: string;
  quiz?: QuizItem[];
  jlpt_level?: string;
  difficulty?: string;
  illustrations?: { title?: string; content: string }[];
  image_url?: string | { _type: string; asset: { _type: string; _ref: string } };
  body?: string;
  translation?: string;
}

export interface ListeningState {
  currentTime: number;
  activeIndex: number;
  isScrolling: boolean;
  activeTab: "transcript"; // tab quiz dihapus, kuis kini inline di bawah transkrip
}
