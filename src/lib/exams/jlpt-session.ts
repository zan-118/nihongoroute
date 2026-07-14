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

/**
 * Storage bucket name for exam assets.
 */
export const EXAM_ASSETS_BUCKET = "exam-assets";

/**
 * Supported JLPT levels.
 */
export const JLPT_LEVELS = ["N5", "N4", "N3", "N2", "N1"] as const;

/**
 * JLPT level type.
 */
export type JlptLevel = (typeof JLPT_LEVELS)[number];

/**
 * Resolves storage object path to public URL.
 */
export type AssetUrlResolver = (objectPath: string) => string;

/**
 * Database row for JLPT exam template with optional category.
 */
export type JlptExamTemplateRow = Tables<"jlpt_exam_templates"> & {
  category?: { slug: string | null } | { slug: string | null }[] | null;
};

/**
 * Database row for JLPT passage.
 */
export type JlptPassageRow = Tables<"jlpt_passages">;

/**
 * Database row for JLPT question with optional passage.
 */
export type JlptQuestionRow = Tables<"jlpt_questions"> & {
  passage?: JlptPassageRow | JlptPassageRow[] | null;
};

/**
 * Template question row with position and section order.
 */
export interface JlptTemplateQuestionRow {
  position: number;
  section_order: number;
  question: JlptQuestionRow | JlptQuestionRow[] | null;
}

/**
 * User answer record for a question.
 */
export interface JlptAnswerRow {
  questionId: string;
  selectedChoiceIndex: number | null;
  isCorrect: boolean;
}

/**
 * Score breakdown for a single exam section.
 */
export interface JlptSectionScore {
  total: number;
  correct: number;
  wrong: number;
  unanswered: number;
  passed: boolean;
}

/**
 * Candidate question for SRS system.
 */
export interface JlptSrsCandidate {
  questionId: string;
  sourceType: string;
  sourceId: string;
  sourceReference?: string | null;
}

/**
 * Database insert row for user SRS.
 */
export type JlptSrsUpsertRow = TablesInsert<"user_srs">;

/**
 * Score breakdown for exam submission.
 */
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

/**
 * Final exam submission result.
 */
export interface ExamSubmitResult
  extends Omit<JlptExamSubmissionScore, "answerRows"> {
  sessionId: string;
  status: "completed";
  completedAt: string;
}

/**
 * Ordered list of JLPT exam sections.
 */
export const JLPT_EXAM_SECTIONS: SupabaseExamSection[] = [
  "vocabulary",
  "grammar",
  "reading",
  "listening",
];

/**
 * Quota request for a section.
 */
export interface JlptQuotaRequest {
  section: SupabaseExamSection;
  total: number;
}

/**
 * Quota configuration map.
 */
export type JlptQuotaConfig = Partial<
  Record<SupabaseExamSection, { total?: unknown }>
>;

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

/**
 * Check if value is record object.
 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Get first item if array, else return value.
 */
function firstOrNull<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

/**
 * Check if string is valid exam section.
 */
function isExamSection(value: string): value is SupabaseExamSection {
  return JLPT_EXAM_SECTIONS.includes(value as SupabaseExamSection);
}

/**
 * Check if URL is absolute or local path.
 */
function isAbsoluteOrAppAssetUrl(value: string) {
  return /^(https?:|data:|blob:)/i.test(value) || value.startsWith("/");
}

/**
 * Normalize string to JLPT level.
 */
export function normalizeJlptLevel(value?: string | null): JlptLevel | null {
  if (!value) return null;
  const normalized = value.trim().toUpperCase();
  return JLPT_LEVELS.includes(normalized as JlptLevel)
    ? (normalized as JlptLevel)
    : null;
}

/**
 * Parse quota configuration from JSON.
 */
export function getJlptQuotaRequests(
  value: Json,
  templateSlug = "template"
): JlptQuotaRequest[] {
  if (!isRecord(value)) {
    throw new Error(`quota_config ${templateSlug} tidak valid.`);
  }

  const requests: JlptQuotaRequest[] = [];

  for (const [section, rawQuota] of Object.entries(value)) {
    if (!isExamSection(section)) {
      throw new Error(
        `quota_config ${templateSlug} memiliki section tidak dikenal: ${section}.`
      );
    }

    if (!isRecord(rawQuota) || !Number.isInteger(rawQuota.total)) {
      throw new Error(
        `quota_config ${templateSlug}.${section}.total harus integer positif.`
      );
    }

    const total = rawQuota.total as number;
    if (total <= 0) {
      throw new Error(
        `quota_config ${templateSlug}.${section}.total harus integer positif.`
      );
    }

    requests.push({ section, total });
  }

  if (requests.length === 0) {
    throw new Error(
      `quota_config ${templateSlug} belum memiliki total soal.`
    );
  }

  // Sort requests by standard section order
  return requests.sort(
    (a, b) =>
      JLPT_EXAM_SECTIONS.indexOf(a.section) -
      JLPT_EXAM_SECTIONS.indexOf(b.section)
  );
}

/**
 * Shuffle array using Fisher-Yates algorithm.
 */
function shuffleRows<T>(rows: T[]) {
  const copy = [...rows];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

/**
 * Build question rows randomly based on quota.
 */
export function buildRandomTemplateQuestionRows(input: {
  quotaRequests: JlptQuotaRequest[];
  questionsBySection: Partial<Record<SupabaseExamSection, JlptQuestionRow[]>>;
  templateSlug?: string;
  shuffleQuestions?: <T>(rows: T[]) => T[];
}): JlptTemplateQuestionRow[] {
  const templateSlug = input.templateSlug ?? "template";
  const shuffleQuestions = input.shuffleQuestions ?? shuffleRows;
  const selectedRows: JlptTemplateQuestionRow[] = [];

  for (const { section, total } of input.quotaRequests) {
    const sectionOrder = JLPT_EXAM_SECTIONS.indexOf(section);
    const candidates = input.questionsBySection[section] ?? [];

    if (candidates.length < total) {
      throw new Error(
        `Template ${templateSlug} membutuhkan ${total} soal ${section}, tetapi hanya ${candidates.length} soal published tersedia.`
      );
    }

    // Select random subset of questions
    shuffleQuestions(candidates)
      .slice(0, total)
      .forEach((question) => {
        selectedRows.push({
          position: selectedRows.length + 1,
          section_order: sectionOrder,
          question,
        });
      });
  }

  if (selectedRows.length === 0) {
    throw new Error(
      `quota_config ${templateSlug} belum memiliki total soal.`
    );
  }

  return selectedRows;
}

/**
 * Clean storage path by removing bucket prefix.
 */
export function normalizeStorageObjectPath(value?: string | null) {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed || isAbsoluteOrAppAssetUrl(trimmed)) return null;

  return trimmed
    .replace(/^\/+/, "")
    .replace(new RegExp(`^${EXAM_ASSETS_BUCKET}/`), "");
}

/**
 * Resolve asset path to full URL.
 */
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

/**
 * Extract string from choice object.
 */
function getChoiceString(
  choice: Record<string, unknown>,
  key: "value" | "alt"
) {
  const value = choice[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

/**
 * Parse choices from JSON format.
 */
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

/**
 * Build passage object from database row.
 */
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

/**
 * Build question object from template row.
 */
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

/**
 * Build full exam package from template and questions.
 */
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

/**
 * Initialize empty section scores.
 */
function createEmptySectionBreakdown() {
  return JLPT_EXAM_SECTIONS.reduce(
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

/**
 * Validate selected choice index.
 */
function normalizeSelectedChoice(
  value: number | null | undefined,
  choices: SupabaseExamChoice[]
) {
  if (value === null || value === undefined) return null;
  if (!Number.isInteger(value)) return null;
  if (value < 0 || value >= choices.length) return null;
  return value;
}

/**
 * Calculate score and breakdown for submission.
 */
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

    // Collect incorrect questions for SRS review
    if (!isCorrect && question.sourceType && question.sourceId) {
      srsCandidates.push({
        questionId: question.id,
        sourceType: question.sourceType,
        sourceId: question.sourceId,
        sourceReference: question.sourceReference,
      });
    }
  }

  // Check section passing thresholds
  let failedSection = false;
  for (const section of JLPT_EXAM_SECTIONS) {
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

/**
 * Generate SRS word ID from candidate.
 */
export function toJlptSrsWordId(
  candidate: Pick<JlptSrsCandidate, "sourceType" | "sourceId">
) {
  const sourceType = candidate.sourceType.trim().toLowerCase();
  const sourceId = candidate.sourceId.trim();

  if (!sourceType || !sourceId) return null;
  if (sourceType === "vocab") return sourceId;

  // Prefix non-vocab source types
  if (PREFIXED_SRS_SOURCE_TYPES.has(sourceType)) {
    const prefix = `${sourceType}:`;
    return sourceId.startsWith(prefix) ? sourceId : `${prefix}${sourceId}`;
  }

  return null;
}

/**
 * Build SRS rows for database insert.
 */
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

/**
 * Format submission score to result.
 */
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

/**
 * Format score to JSON snapshot.
 */
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

/**
 * Convert snapshot to legacy exam format.
 */
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

/**
 * Convert snapshot to package format.
 */
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

/**
 * Convert stored snapshot to result.
 */
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