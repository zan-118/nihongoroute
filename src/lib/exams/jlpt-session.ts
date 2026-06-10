import type { ExamData } from "@/components/features/exams/mock-engine/types";
import {
  toLegacyExamData,
  type SupabaseExamChoice,
  type SupabaseExamPackage,
  type SupabaseExamPassage,
  type SupabaseExamQuestion,
  type SupabaseExamSection,
} from "@/lib/exams/supabase-adapter";
import type { Json, Tables, TablesInsert } from "@/types/supabase.generated";

export const EXAM_ASSETS_BUCKET = "exam-assets";
export const JLPT_LEVELS = ["N5", "N4", "N3", "N2", "N1"] as const;

export type JlptLevel = (typeof JLPT_LEVELS)[number];

export type AssetUrlResolver = (objectPath: string) => string;

export type JlptExamTemplateRow = Tables<"jlpt_exam_templates"> & {
  category?: { slug: string | null } | { slug: string | null }[] | null;
};

export type JlptPassageRow = Tables<"jlpt_passages">;

export type JlptQuestionRow = Tables<"jlpt_questions"> & {
  passage?: JlptPassageRow | JlptPassageRow[] | null;
};

export interface JlptTemplateQuestionRow {
  position: number;
  section_order: number;
  question: JlptQuestionRow | JlptQuestionRow[] | null;
}

export interface JlptAnswerRow {
  questionId: string;
  selectedChoiceIndex: number | null;
  isCorrect: boolean;
}

export interface JlptSectionScore {
  total: number;
  correct: number;
  wrong: number;
  unanswered: number;
  passed: boolean;
}

export interface JlptSrsCandidate {
  questionId: string;
  sourceType: string;
  sourceId: string;
  sourceReference?: string | null;
}

export type JlptSrsUpsertRow = TablesInsert<"user_srs">;

export interface JlptExamSubmissionScore {
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  totalScore: number;
  passingScore: number;
  failedSection: boolean;
  isPassed: boolean;
  sectionBreakdown: Record<SupabaseExamSection, JlptSectionScore>;
  answers: Record<string, number | null>;
  answerRows: JlptAnswerRow[];
  srsCandidates: JlptSrsCandidate[];
}

export interface ExamSubmitResult
  extends Omit<JlptExamSubmissionScore, "answerRows"> {
  sessionId: string;
  status: "completed";
  completedAt: string;
}

const EXAM_SECTIONS: SupabaseExamSection[] = [
  "vocabulary",
  "grammar",
  "reading",
  "listening",
];

const SECTION_MIN_ACCURACY = 0.32;
const MAX_EXAM_SCORE = 180;
const DEFAULT_SRS_INTERVAL_DAYS = 1;
const DEFAULT_SRS_EASE_FACTOR = 2.5;
const SRS_REVIEW_DELAY_DAYS = 1;
const DAY_MS = 24 * 60 * 60 * 1000;
const PREFIXED_SRS_SOURCE_TYPES = new Set([
  "grammar",
  "kanji",
  "listening",
  "reading",
  "custom",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function firstOrNull<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function isExamSection(value: string): value is SupabaseExamSection {
  return EXAM_SECTIONS.includes(value as SupabaseExamSection);
}

function isAbsoluteOrAppAssetUrl(value: string) {
  return /^(https?:|data:|blob:)/i.test(value) || value.startsWith("/");
}

export function normalizeJlptLevel(value?: string | null): JlptLevel | null {
  if (!value) return null;
  const normalized = value.trim().toUpperCase();
  return JLPT_LEVELS.includes(normalized as JlptLevel)
    ? (normalized as JlptLevel)
    : null;
}

export function normalizeStorageObjectPath(value?: string | null) {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed || isAbsoluteOrAppAssetUrl(trimmed)) return null;

  return trimmed
    .replace(/^\/+/, "")
    .replace(new RegExp(`^${EXAM_ASSETS_BUCKET}/`), "");
}

export function resolveExamAssetUrl(
  value: string | null | undefined,
  resolveAssetUrl: AssetUrlResolver
) {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (isAbsoluteOrAppAssetUrl(trimmed)) return trimmed;

  const objectPath = normalizeStorageObjectPath(trimmed);
  return objectPath ? resolveAssetUrl(objectPath) : null;
}

function getChoiceString(
  choice: Record<string, unknown>,
  key: "value" | "alt"
) {
  const value = choice[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function parseSupabaseExamChoices(
  choices: Json,
  resolveAssetUrl: AssetUrlResolver
): SupabaseExamChoice[] {
  if (!Array.isArray(choices)) return [];

  return choices
    .map((choice): SupabaseExamChoice | null => {
      if (typeof choice === "string" && choice.trim()) {
        return { type: "text", value: choice.trim() };
      }

      if (!isRecord(choice)) return null;

      const value = getChoiceString(choice, "value");
      if (!value) return null;

      if (choice.type === "image") {
        return {
          type: "image",
          value: resolveExamAssetUrl(value, resolveAssetUrl) ?? value,
          alt: getChoiceString(choice, "alt"),
        };
      }

      return {
        type: "text",
        value,
      };
    })
    .filter((choice): choice is SupabaseExamChoice => Boolean(choice));
}

function buildPassage(
  passage: JlptPassageRow | null,
  resolveAssetUrl: AssetUrlResolver
): SupabaseExamPassage | null {
  if (!passage) return null;

  return {
    id: passage.id,
    contentHtml: passage.content_html,
    transcriptHtml: passage.transcript_html,
    audioUrl: resolveExamAssetUrl(passage.audio_path, resolveAssetUrl),
    visualUrl: resolveExamAssetUrl(passage.visual_path, resolveAssetUrl),
  };
}

function buildQuestion(
  item: JlptTemplateQuestionRow,
  resolveAssetUrl: AssetUrlResolver
): SupabaseExamQuestion {
  const question = firstOrNull(item.question);

  if (!question) {
    throw new Error(
      `Template question at position ${item.position} has no readable question.`
    );
  }

  if (!isExamSection(question.session_type)) {
    throw new Error(`Unsupported JLPT exam section: ${question.session_type}`);
  }

  const choices = parseSupabaseExamChoices(question.choices, resolveAssetUrl);
  if (choices.length < 2) {
    throw new Error(`Question ${question.id} must have at least 2 choices.`);
  }

  return {
    id: question.id,
    sessionType: question.session_type,
    mondaiNumber: question.mondai_number,
    questionNumber: question.question_number,
    promptHtml: question.prompt_html,
    visualUrl: resolveExamAssetUrl(question.visual_path, resolveAssetUrl),
    audioUrl: resolveExamAssetUrl(question.audio_path, resolveAssetUrl),
    choices,
    correctChoiceIndex: question.correct_choice_index,
    passage: buildPassage(firstOrNull(question.passage), resolveAssetUrl),
    explanationHtml: question.explanation_html,
    sourceType: question.source_type,
    sourceId: question.source_id,
    sourceReference: question.source_reference,
  };
}

export function buildSupabaseExamPackage(
  template: JlptExamTemplateRow,
  templateQuestions: JlptTemplateQuestionRow[],
  resolveAssetUrl: AssetUrlResolver
): SupabaseExamPackage {
  const category = firstOrNull(template.category);
  const questions = [...templateQuestions]
    .sort((a, b) => {
      if (a.section_order !== b.section_order) {
        return a.section_order - b.section_order;
      }
      return a.position - b.position;
    })
    .map((item) => buildQuestion(item, resolveAssetUrl));

  return {
    id: template.id,
    templateId: template.id,
    slug: template.slug,
    title: template.title,
    description: template.description,
    jlptLevel: template.jlpt_level,
    timeLimitMinutes: template.time_limit_minutes,
    passingScore: template.passing_score,
    categoryId: template.category_id,
    categorySlug: category?.slug ?? null,
    choukaiAudioUrl: null,
    questions,
    createdAt: template.created_at,
    updatedAt: template.updated_at,
  };
}

function createEmptySectionBreakdown() {
  return EXAM_SECTIONS.reduce(
    (breakdown, section) => {
      breakdown[section] = {
        total: 0,
        correct: 0,
        wrong: 0,
        unanswered: 0,
        passed: true,
      };
      return breakdown;
    },
    {} as Record<SupabaseExamSection, JlptSectionScore>
  );
}

function normalizeSelectedChoice(
  value: number | null | undefined,
  choices: SupabaseExamChoice[]
) {
  if (value === null || value === undefined) return null;
  if (!Number.isInteger(value)) return null;
  if (value < 0 || value >= choices.length) return null;
  return value;
}

export function calculateJlptExamSubmission(
  examPackage: SupabaseExamPackage,
  submittedAnswers: Record<string, number | null | undefined>
): JlptExamSubmissionScore {
  const sectionBreakdown = createEmptySectionBreakdown();
  const answers: Record<string, number | null> = {};
  const answerRows: JlptAnswerRow[] = [];
  const srsCandidates: JlptSrsCandidate[] = [];

  let correctCount = 0;

  for (const question of examPackage.questions) {
    const section = question.sessionType;
    const selectedChoiceIndex = normalizeSelectedChoice(
      submittedAnswers[question.id],
      question.choices
    );
    const isCorrect = selectedChoiceIndex === question.correctChoiceIndex;
    const sectionScore = sectionBreakdown[section];

    answers[question.id] = selectedChoiceIndex;
    answerRows.push({
      questionId: question.id,
      selectedChoiceIndex,
      isCorrect,
    });

    sectionScore.total += 1;

    if (isCorrect) {
      correctCount += 1;
      sectionScore.correct += 1;
    } else if (selectedChoiceIndex === null) {
      sectionScore.unanswered += 1;
    } else {
      sectionScore.wrong += 1;
    }

    if (!isCorrect && question.sourceType && question.sourceId) {
      srsCandidates.push({
        questionId: question.id,
        sourceType: question.sourceType,
        sourceId: question.sourceId,
        sourceReference: question.sourceReference,
      });
    }
  }

  let failedSection = false;
  for (const section of EXAM_SECTIONS) {
    const score = sectionBreakdown[section];
    if (score.total === 0) continue;

    score.passed = score.correct / score.total >= SECTION_MIN_ACCURACY;
    if (!score.passed) failedSection = true;
  }

  const totalQuestions = examPackage.questions.length;
  const totalScore = Math.round(
    (correctCount / Math.max(1, totalQuestions)) * MAX_EXAM_SCORE
  );
  const unansweredCount = answerRows.filter(
    (answer) => answer.selectedChoiceIndex === null
  ).length;
  const wrongCount = totalQuestions - correctCount - unansweredCount;
  const isPassed = totalScore >= examPackage.passingScore && !failedSection;

  return {
    totalQuestions,
    correctCount,
    wrongCount,
    unansweredCount,
    totalScore,
    passingScore: examPackage.passingScore,
    failedSection,
    isPassed,
    sectionBreakdown,
    answers,
    answerRows,
    srsCandidates,
  };
}

export function toJlptSrsWordId(
  candidate: Pick<JlptSrsCandidate, "sourceType" | "sourceId">
) {
  const sourceType = candidate.sourceType.trim().toLowerCase();
  const sourceId = candidate.sourceId.trim();

  if (!sourceType || !sourceId) return null;
  if (sourceType === "vocab") return sourceId;

  if (PREFIXED_SRS_SOURCE_TYPES.has(sourceType)) {
    const prefix = `${sourceType}:`;
    return sourceId.startsWith(prefix) ? sourceId : `${prefix}${sourceId}`;
  }

  return null;
}

export function buildJlptSrsUpsertRows(input: {
  userId: string;
  candidates: JlptSrsCandidate[];
  completedAt?: string | Date;
}): JlptSrsUpsertRow[] {
  const completedAt =
    input.completedAt instanceof Date
      ? input.completedAt
      : new Date(input.completedAt ?? Date.now());
  const updatedAt = completedAt.toISOString();
  const nextReview = new Date(
    completedAt.getTime() + SRS_REVIEW_DELAY_DAYS * DAY_MS
  ).toISOString();
  const rowsByWordId = new Map<string, JlptSrsUpsertRow>();

  for (const candidate of input.candidates) {
    const wordId = toJlptSrsWordId(candidate);
    if (!wordId || rowsByWordId.has(wordId)) continue;

    rowsByWordId.set(wordId, {
      user_id: input.userId,
      word_id: wordId,
      interval: DEFAULT_SRS_INTERVAL_DAYS,
      repetition: 0,
      ease_factor: DEFAULT_SRS_EASE_FACTOR,
      next_review: nextReview,
      status: "learning",
      updated_at: updatedAt,
    });
  }

  return Array.from(rowsByWordId.values());
}

export function toExamSubmitResult(
  sessionId: string,
  score: JlptExamSubmissionScore,
  completedAt: string
): ExamSubmitResult {
  const { answerRows: _answerRows, ...publicScore } = score;

  return {
    ...publicScore,
    sessionId,
    status: "completed",
    completedAt,
  };
}

export function toScoreBreakdownSnapshot(score: JlptExamSubmissionScore): Json {
  return {
    totalQuestions: score.totalQuestions,
    correctCount: score.correctCount,
    wrongCount: score.wrongCount,
    unansweredCount: score.unansweredCount,
    totalScore: score.totalScore,
    passingScore: score.passingScore,
    failedSection: score.failedSection,
    isPassed: score.isPassed,
    sectionBreakdown: score.sectionBreakdown,
    srsCandidates: score.srsCandidates,
  } as unknown as Json;
}

export function packageSnapshotToLegacyExam(
  snapshot: Json,
  sessionId?: string | null
): ExamData {
  if (!isRecord(snapshot)) {
    throw new Error("Exam session payload snapshot is invalid.");
  }

  const examPackage = snapshot as unknown as SupabaseExamPackage;
  if (
    typeof examPackage.id !== "string" ||
    typeof examPackage.title !== "string" ||
    !Array.isArray(examPackage.questions)
  ) {
    throw new Error("Exam session payload snapshot is incomplete.");
  }

  return toLegacyExamData({
    ...examPackage,
    sessionId: sessionId ?? examPackage.sessionId,
  });
}

export function packageSnapshotToSupabasePackage(
  snapshot: Json,
  sessionId?: string | null
): SupabaseExamPackage {
  if (!isRecord(snapshot)) {
    throw new Error("Exam session payload snapshot is invalid.");
  }

  const examPackage = snapshot as unknown as SupabaseExamPackage;
  if (
    typeof examPackage.id !== "string" ||
    typeof examPackage.title !== "string" ||
    !Array.isArray(examPackage.questions)
  ) {
    throw new Error("Exam session payload snapshot is incomplete.");
  }

  return {
    ...examPackage,
    sessionId: sessionId ?? examPackage.sessionId,
  };
}

export function storedScoreSnapshotToResult(input: {
  sessionId: string;
  completedAt: string | null;
  scoreBreakdown: Json | null;
  answersSnapshot: Json;
}): ExamSubmitResult | null {
  if (!isRecord(input.scoreBreakdown)) return null;

  const snapshot = input.scoreBreakdown;
  const answers = isRecord(input.answersSnapshot)
    ? (input.answersSnapshot as Record<string, number | null>)
    : {};

  if (
    typeof snapshot.totalQuestions !== "number" ||
    typeof snapshot.correctCount !== "number" ||
    typeof snapshot.totalScore !== "number" ||
    typeof snapshot.passingScore !== "number" ||
    typeof snapshot.failedSection !== "boolean" ||
    typeof snapshot.isPassed !== "boolean" ||
    !isRecord(snapshot.sectionBreakdown)
  ) {
    return null;
  }

  return {
    sessionId: input.sessionId,
    status: "completed",
    completedAt: input.completedAt ?? new Date().toISOString(),
    totalQuestions: snapshot.totalQuestions,
    correctCount: snapshot.correctCount,
    wrongCount:
      typeof snapshot.wrongCount === "number" ? snapshot.wrongCount : 0,
    unansweredCount:
      typeof snapshot.unansweredCount === "number"
        ? snapshot.unansweredCount
        : 0,
    totalScore: snapshot.totalScore,
    passingScore: snapshot.passingScore,
    failedSection: snapshot.failedSection,
    isPassed: snapshot.isPassed,
    sectionBreakdown:
      snapshot.sectionBreakdown as unknown as Record<
        SupabaseExamSection,
        JlptSectionScore
      >,
    answers,
    srsCandidates: Array.isArray(snapshot.srsCandidates)
      ? (snapshot.srsCandidates as unknown as JlptSrsCandidate[])
      : [],
  };
}
