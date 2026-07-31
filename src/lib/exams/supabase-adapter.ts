import type {
  ExamData,
  ExamQuestion,
} from "@/features/exams/components/mock-engine/types";

/**
 * Exam section types.
 */
export type SupabaseExamSection =
  | "vocabulary"
  | "grammar"
  | "reading"
  | "listening";

/**
 * Exam choice structure. Support text or image.
 */
export type SupabaseExamChoice =
  | {
      type: "text";
      value: string;
    }
  | {
      type: "image";
      value: string;
      alt?: string | null;
    };

/**
 * Passage data for reading or listening questions.
 */
export interface SupabaseExamPassage {
  id: string;
  contentHtml?: string | null;
  transcriptHtml?: string | null;
  audioUrl?: string | null;
  visualUrl?: string | null;
}

/**
 * Question structure from database.
 */
export interface SupabaseExamQuestion {
  id: string;
  sessionType: SupabaseExamSection;
  mondaiNumber?: number | null;
  questionNumber?: number | null;
  promptHtml?: string | null;
  visualUrl?: string | null;
  audioUrl?: string | null;
  choices: SupabaseExamChoice[];
  correctChoiceIndex: number;
  passage?: SupabaseExamPassage | null;
  explanationHtml?: string | null;
  sourceType?: string | null;
  sourceId?: string | null;
  sourceReference?: string | null;
}

/**
 * Exam package container. Hold metadata and questions.
 */
export interface SupabaseExamPackage {
  id: string;
  templateId?: string | null;
  sessionId?: string | null;
  slug?: string | null;
  title: string;
  description?: string | null;
  jlptLevel?: string | null;
  timeLimitMinutes: number;
  passingScore: number;
  categoryId?: string | null;
  categorySlug?: string | null;
  choukaiAudioUrl?: string | null;
  questions: SupabaseExamQuestion[];
  createdAt?: string | null;
  updatedAt?: string | null;
}

/**
 * Normalize JLPT level string to lowercase.
 */
function normalizeLevelCode(level?: string | null) {
  if (!level) return undefined;
  return level.toLowerCase();
}

/**
 * Convert choice object to string.
 */
function choiceToLegacyOption(choice: SupabaseExamChoice, index: number) {
  if (choice.type === "text") return choice.value;
  // Use alt text or fallback label for image choices
  return choice.alt || `Pilihan gambar ${index + 1}`;
}

/**
 * Map database question to legacy engine format.
 */
function questionToLegacyQuestion(
  question: SupabaseExamQuestion
): ExamQuestion {
  return {
    id: question.id,
    _key: question.id,
    section: question.sessionType,
    questionText: question.promptHtml || "",
    imageUrl: question.visualUrl || null,
    // Fallback to passage audio if question audio missing
    audioUrl: question.audioUrl || question.passage?.audioUrl || null,
    options: question.choices.map(choiceToLegacyOption),
    correctAnswer: question.correctChoiceIndex,
    choices: question.choices,
    passage: question.passage
      ? {
          id: question.passage.id,
          contentHtml: question.passage.contentHtml,
          transcriptHtml: question.passage.transcriptHtml,
          audioUrl: question.passage.audioUrl,
          visualUrl: question.passage.visualUrl,
        }
      : null,
    explanationHtml: question.explanationHtml,
    transcriptHtml: question.passage?.transcriptHtml ?? null,
    sourceType: question.sourceType,
    sourceId: question.sourceId,
    sourceReference: question.sourceReference,
    mondaiNumber: question.mondaiNumber,
    questionNumber: question.questionNumber,
  };
}

/**
 * Convert database exam package to legacy exam data format.
 */
export function toLegacyExamData(examPackage: SupabaseExamPackage): ExamData {
  return {
    // Resolve unique identifier from session, template, or package ID
    id: examPackage.sessionId || examPackage.templateId || examPackage.id,
    title: examPackage.title,
    timeLimit: examPackage.timeLimitMinutes,
    passingScore: examPackage.passingScore,
    description: examPackage.description ?? null,
    category_id: examPackage.categoryId ?? null,
    categorySlug: examPackage.categorySlug || undefined,
    levelCode: normalizeLevelCode(examPackage.jlptLevel),
    source: "supabase",
    slug: examPackage.slug ?? null,
    templateId: examPackage.templateId ?? examPackage.id,
    templateSlug: examPackage.slug ?? null,
    sessionId: examPackage.sessionId ?? null,
    choukaiAudioUrl: examPackage.choukaiAudioUrl || undefined,
    questions: examPackage.questions.map(questionToLegacyQuestion),
    created_at: examPackage.createdAt ?? null,
    updated_at: examPackage.updatedAt ?? null,
  };
}