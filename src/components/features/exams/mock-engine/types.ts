export interface ExamQuestion {
  _key: string;
  section: "vocabulary" | "grammar" | "reading" | "listening";
  questionText?: string;
  imageUrl?: string | null;
  audioUrl?: string | null;
  options: string[];
  correctAnswer: number;
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
  /** URL audio chōkai — bukan kolom DB, diambil dari questions */
  choukaiAudioUrl?: string;
  questions: ExamQuestion[];
  created_at?: string | null;
  updated_at?: string | null;
}

export type GameState = "intro" | "playing" | "result" | "review";
export type AudioState = "idle" | "playing" | "played";
/** State untuk konfirmasi navigasi seksi — menggantikan window.confirm() */
export type PendingConfirmType = "section" | "finish" | null;
