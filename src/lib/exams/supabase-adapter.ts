import type {
  ExamData,
  ExamQuestion,
} from "@/components/features/exams/mock-engine/types";

export type SupabaseExamSection =
  | "vocabulary"
  | "grammar"
  | "reading"
  | "listening";

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

export interface SupabaseExamPassage {
  id: string;
  contentHtml?: string | null;
  transcriptHtml?: string | null;
  audioUrl?: string | null;
  visualUrl?: string | null;
}

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

function normalizeLevelCode(level?: string | null) {
  if (!level) return undefined;
  return level.toLowerCase();
}

function choiceToLegacyOption(choice: SupabaseExamChoice, index: number) {
  if (choice.type === "text") return choice.value;
  return choice.alt || `Pilihan gambar ${index + 1}`;
}

function questionToLegacyQuestion(
  question: SupabaseExamQuestion
): ExamQuestion {
  return {
    id: question.id,
    _key: question.id,
    section: question.sessionType,
    questionText: question.promptHtml || "",
    imageUrl: question.visualUrl || null,
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
  };
}

export function toLegacyExamData(examPackage: SupabaseExamPackage): ExamData {
  return {
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
