/**
 * @file types.ts
 * @description Definisi tipe data (interfaces & types) untuk domain simulasi ujian Mock Exam Engine NihongoRoute.
 */

// ======================
// IMPOR
// ======================
import { ExamPortableTextBlock } from "./ExamQuestionText";

// ======================
// ANTARMUKA / TIPE DATA
// ======================
export type ExamChoice =
  | {
      type: "text";
      value: string;
    }
  | {
      type: "image";
      value: string;
      alt?: string | null;
    };

export interface ExamPassage {
  id: string;
  contentHtml?: string | null;
  transcriptHtml?: string | null;
  audioUrl?: string | null;
  visualUrl?: string | null;
}

export interface ExamQuestion {
  id?: string;
  _key: string;
  section: "vocabulary" | "grammar" | "reading" | "listening";
  questionText?: string | ExamPortableTextBlock[];
  imageUrl?: string | null;
  audioUrl?: string | null;
  options: string[];
  correctAnswer: number;
  choices?: ExamChoice[];
  passage?: ExamPassage | null;
  explanationHtml?: string | null;
  transcriptHtml?: string | null;
  sourceType?: string | null;
  sourceId?: string | null;
  sourceReference?: string | null;
}

export interface ExamServerResult {
  sessionId: string;
  status: "completed";
  completedAt: string;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  totalScore: number;
  passingScore: number;
  failedSection: boolean;
  isPassed: boolean;
  sectionBreakdown: Record<string, { total: number; correct: number; passed: boolean }>;
  answers: Record<string, number | null>;
}

export interface ExamData {
  id: string;
  title: string;
  timeLimit: number;
  passingScore: number;
  description?: string | null;
  is_published?: boolean;
  category_id?: string | null;
  /** Slug kategori — di-join dari course_categories jika dibutuhkan */
  categorySlug?: string;
  /** Kode level JLPT (N5–N1), bukan kolom DB — diisi dari kategori */
  levelCode?: string;
  source?: "sanity" | "supabase";
  slug?: string | null;
  templateId?: string | null;
  templateSlug?: string | null;
  sessionId?: string | null;
  /** URL audio chōkai — bukan kolom DB, diambil dari questions */
  choukaiAudioUrl?: string;
  questions: ExamQuestion[];
  serverResult?: ExamServerResult | null;
  savedAnswers?: Record<string, number>;
  remainingTimeSeconds?: number;
  created_at?: string | null;
  updated_at?: string | null;
}

export type GameState = "intro" | "playing" | "result" | "review";
export type AudioState = "idle" | "playing" | "played";
/** State untuk konfirmasi navigasi seksi — menggantikan window.confirm() */
export type PendingConfirmType = "section" | "finish" | null;
