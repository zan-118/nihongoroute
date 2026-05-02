export interface ExamQuestion {
  _key: string;
  section: "vocabulary" | "grammar" | "reading" | "listening";
  questionText?: string;
  imageUrl?: string;
  audioUrl?: string;
  options: string[];
  correctAnswer: number;
}

export interface ExamData {
  _id: string;
  title: string;
  timeLimit: number;
  passingScore: number;
  categorySlug?: string;
  levelCode?: string;
  questions: ExamQuestion[];
}

export type GameState = "intro" | "playing" | "result" | "review";
export type AudioState = "idle" | "playing" | "played";
