/**
 * @file types.ts
 * @description Definisi tipe data (interfaces & types) untuk domain simulasi ujian Mock Exam Engine NihongoRoute.
 */

// IMPOR

import { ExamPortableTextBlock } from "./ExamQuestionText";

// ANTARMUKA / TIPE DATA

/**
 * Choice option for exam question. Can be text or image.
 */
export type ExamChoice =
 | {
 /** Choice type identifier. */
 type: "text";
 /** Text content. */
 value: string;
 }
 | {
 /** Choice type identifier. */
 type: "image";
 /** Image URL. */
 value: string;
 /** Alternative text for image. */
 alt?: string | null;
 };

/**
 * Reading passage or listening context data.
 */
export interface ExamPassage {
 /** Unique identifier. */
 id: string;
 /** HTML content for reading section. */
 contentHtml?: string | null;
 /** Audio transcript HTML. */
 transcriptHtml?: string | null;
 /** Audio file URL. */
 audioUrl?: string | null;
 /** Visual aid image URL. */
 visualUrl?: string | null;
}

/**
 * Single exam question structure.
 */
export interface ExamQuestion {
 /** Question ID. */
 id?: string;
 /** Unique key. */
 _key: string;
 /** Exam section category. */
 section: "vocabulary" | "grammar" | "reading" | "listening";
 /** Question text content. */
 questionText?: string | ExamPortableTextBlock[];
 /** Question image URL. */
 imageUrl?: string | null;
 /** Question audio URL. */
 audioUrl?: string | null;
 /** Legacy string options. */
 options: string[];
 /** Index of correct answer. */
 correctAnswer: number;
 /** Rich choices containing text or image. */
 choices?: ExamChoice[];
 /** Associated passage. */
 passage?: ExamPassage | null;
 /** Explanation HTML. */
 explanationHtml?: string | null;
 /** Audio transcript HTML. */
 transcriptHtml?: string | null;
 /** Source origin type. */
 sourceType?: string | null;
 /** Source identifier. */
 sourceId?: string | null;
 /** Source reference text. */
 sourceReference?: string | null;
 /** Mondai group number. */
 mondaiNumber?: number | null;
 /** Question number. */
 questionNumber?: number | null;
}

/**
 * Exam result data returned from server.
 */
export interface ExamServerResult {
 /** Session identifier. */
 sessionId: string;
 /** Completion status. */
 status: "completed";
 /** Timestamp of completion. */
 completedAt: string;
 /** Total questions count. */
 totalQuestions: number;
 /** Correct answers count. */
 correctCount: number;
 /** Wrong answers count. */
 wrongCount: number;
 /** Unanswered questions count. */
 unansweredCount: number;
 /** Total score achieved. */
 totalScore: number;
 /** Score needed to pass. */
 passingScore: number;
 /** True if any section failed passing threshold. */
 failedSection: boolean;
 /** True if exam passed. */
 isPassed: boolean;
 /** Score breakdown per section. */
 sectionBreakdown: Record<string, { total: number; correct: number; passed: boolean }>;
 /** Map of question ID to selected answer index. */
 answers: Record<string, number | null>;
}

/**
 * Complete exam data structure.
 */
export interface ExamData {
 /** Exam ID. */
 id: string;
 /** Exam title. */
 title: string;
 /** Time limit in minutes. */
 timeLimit: number;
 /** Passing score threshold. */
 passingScore: number;
 /** Exam description. */
 description?: string | null;
 /** Publish status. */
 is_published?: boolean;
 /** Category ID. */
 category_id?: string | null;
 /** Slug kategori — di-join dari course_categories jika dibutuhkan */
 categorySlug?: string;
 /** Kode level JLPT (N5–N1), bukan kolom DB — diisi dari kategori */
 levelCode?: string;
 /** Data source origin. */
 source?: "database" | "supabase";
 /** Exam slug. */
 slug?: string | null;
 /** Template ID. */
 templateId?: string | null;
 /** Template slug. */
 templateSlug?: string | null;
 /** Active session ID. */
 sessionId?: string | null;
 /** URL audio chōkai — bukan kolom DB, diambil dari questions */
 choukaiAudioUrl?: string;
 /** List of questions. */
 questions: ExamQuestion[];
 /** Server evaluation result. */
 serverResult?: ExamServerResult | null;
 /** Map of question ID to answer index. */
 savedAnswers?: Record<string, number>;
 /** Remaining time in seconds. */
 remainingTimeSeconds?: number;
 /** Creation timestamp. */
 created_at?: string | null;
 /** Update timestamp. */
 updated_at?: string | null;
}

/** Current phase of exam engine. */
export type GameState = "intro" | "playing" | "result" | "review";
/** Audio playback state. */
export type AudioState = "idle" | "playing" | "played";
/** State untuk konfirmasi navigasi seksi — menggantikan window.confirm() */
export type PendingConfirmType = "section" | "finish" | null;