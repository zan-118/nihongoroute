/**
 * @file index.ts
 * @description Tipe data untuk fitur Listening Comprehension (Karaoke-Style).
 */

export interface TranscriptLine {
  _key: string;
  text: string | any[]; // Bisa text biasa atau Portable Text (VocabTrigger)
  startTime: number; // Dalam detik
  endTime: number; // Dalam detik
  speaker?: string;
  translation?: string;
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
  title: string;
  audioUrl: string;
  transcript: TranscriptLine[];
  description?: string;
  quiz?: QuizItem[];
}

export interface ListeningState {
  currentTime: number;
  activeIndex: number;
  isScrolling: boolean;
  activeTab: "transcript" | "quiz";
}

