import type {
  JlptImportLevel,
  JlptImportPackage,
  JlptImportPassage,
  JlptImportQuestion,
} from "@/lib/exams/import-pipeline";
import type { Tables } from "@/types/supabase.generated";

/**
 * Database grammar table row type.
 */
type GrammarTableRow = Tables<"grammar">;

/**
 * Official JLPT grammar question types.
 */
export const BUNPOU_OFFICIAL_QUESTION_TYPES = [
  "sentential_grammar_1",
  "sentential_grammar_2",
  "text_grammar",
] as const;

/**
 * Union of official grammar question types.
 */
export type BunpouQuestionType =
  (typeof BUNPOU_OFFICIAL_QUESTION_TYPES)[number];

/**
 * Subset of grammar table row fields used for generation.
 */
export type BunpouGrammarRow = Pick<
  GrammarTableRow,
  "id" | "meaning" | "slug" | "title"
> &
  Partial<
    Pick<
      GrammarTableRow,
      | "examples"
      | "formation"
      | "formation_furigana"
      | "formation_romaji"
      | "jlpt_level"
      | "notes"
      | "order_number"
    >
  >;

/**
 * Question structure for externally generated or LLM-enhanced grammar questions.
 */
export interface BunpouEnhancedQuestion {
  type: BunpouQuestionType;
  sourceId: string;
  promptHtml?: string | null;
  passageKey?: string | null;
  passage?: {
    key: string;
    title?: string | null;
    contentHtml: string;
    sourceLabel?: string | null;
  };
  choices: readonly string[];
  correctChoiceIndex: number;
  explanationHtml?: string | null;
  sourceReference?: string | null;
}

/**
 * Input parameters for building a grammar import package.
 */
export interface BuildBunpouImportPackageInput {
  grammarRows: readonly BunpouGrammarRow[];
  jlptLevel: JlptImportLevel;
  templateSlug?: string;
  title?: string;
  description?: string | null;
  timeLimitMinutes?: number;
  passingScore?: number;
  questionTypes?: readonly BunpouQuestionType[];
  maxQuestions?: number;
  candidateIds?: readonly string[];
  seed?: string | number;
  enhancedQuestions?: readonly BunpouEnhancedQuestion[];
  isPublished?: boolean;
}

/**
 * Statistics tracked during the grammar package generation process.
 */
export interface BunpouGenerationStats {
  inputRows: number;
  poolRows: number;
  candidateRows: number;
  generatedQuestions: number;
  generatedByType: Record<BunpouQuestionType, number>;
  skippedByReason: Record<string, number>;
}

/**
 * Result of the grammar import package generation.
 */
export interface BuildBunpouImportPackageResult {
  importPackage: JlptImportPackage;
  stats: BunpouGenerationStats;
}

/**
 * Internal normalized representation of a grammar row.
 */
interface NormalizedGrammarRow {
  id: string;
  title: string;
  meaning: string;
  slug: string;
  formation: string | null;
  jlptLevel: JlptImportLevel | null;
  orderNumber: number | null;
}

/**
 * Map of JLPT levels to numeric difficulty values.
 */
const LEVEL_DIFFICULTY: Record<JlptImportLevel, number> = {
  N5: 1,
  N4: 2,
  N3: 3,
  N2: 4,
  N1: 5,
};

/**
 * Map of question types to official JLPT Mondai section numbers.
 */
const BUNPOU_MONDAI_BY_TYPE: Record<BunpouQuestionType, number> = {
  sentential_grammar_1: 1,
  sentential_grammar_2: 2,
  text_grammar: 3,
};

/**
 * Question types that require LLM generation and cannot be rule-based.
 */
const LLM_QUESTION_TYPES = new Set<BunpouQuestionType>([
  "sentential_grammar_2",
  "text_grammar",
]);

/**
 * Trims string and returns null if empty.
 */
function compactString(value: unknown) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/**
 * Validates and normalizes JLPT level string.
 */
function normalizeLevel(value: unknown): JlptImportLevel | null {
  const normalized = compactString(value)?.toUpperCase();
  if (
    normalized === "N5" ||
    normalized === "N4" ||
    normalized === "N3" ||
    normalized === "N2" ||
    normalized === "N1"
  ) {
    return normalized;
  }

  return null;
}

/**
 * Escapes HTML special characters.
 */
function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * FNV-1a 32-bit hash implementation.
 */
function hash32(value: string) {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/**
 * Creates a seeded pseudo-random number generator.
 */
function createRandom(seed: string | number) {
  let state = typeof seed === "number" ? seed >>> 0 : hash32(seed);
  return () => {
    // Mulberry32 generator algorithm
    state += 0x6d2b79f5;
    let mixed = state;
    mixed = Math.imul(mixed ^ (mixed >>> 15), mixed | 1);
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Shuffles array deterministically using a seed.
 */
function stableShuffle<T>(items: readonly T[], seed: string | number) {
  const output = [...items];
  const random = createRandom(seed);

  for (let index = output.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [output[index], output[swapIndex]] = [output[swapIndex], output[index]];
  }

  return output;
}

/**
 * Generates a URL-safe slug appended with a hash of the original value.
 */
function slugToken(value: string) {
  const normalized = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);

  const hash = hash32(value).toString(16);
  return normalized ? `${normalized}-${hash}` : hash;
}

/**
 * Sort comparator for grammar rows. Sorts by order number, then title, then ID.
 */
function sortRow(a: NormalizedGrammarRow, b: NormalizedGrammarRow) {
  return (
    (a.orderNumber ?? Number.MAX_SAFE_INTEGER) -
      (b.orderNumber ?? Number.MAX_SAFE_INTEGER) ||
    a.title.localeCompare(b.title, "ja") ||
    a.id.localeCompare(b.id)
  );
}

/**
 * Filters, normalizes, and sorts raw grammar rows.
 */
function normalizeGrammarRows(
  rows: readonly BunpouGrammarRow[],
  jlptLevel: JlptImportLevel
) {
  const uniqueRows = new Map<string, NormalizedGrammarRow>();

  for (const row of rows) {
    const id = compactString(row.id);
    const title = compactString(row.title);
    const meaning = compactString(row.meaning);
    const slug = compactString(row.slug);
    if (!id || !title || !meaning || !slug || uniqueRows.has(id)) continue;

    const rowLevel = normalizeLevel(row.jlpt_level ?? null);
    if (rowLevel && rowLevel !== jlptLevel) continue;

    uniqueRows.set(id, {
      id,
      title,
      meaning,
      slug,
      formation: compactString(row.formation),
      jlptLevel: rowLevel,
      orderNumber:
        typeof row.order_number === "number" ? row.order_number : null,
    });
  }

  return Array.from(uniqueRows.values()).sort(sortRow);
}

/**
 * Increments the counter for a specific skip reason.
 */
function incrementReason(
  skippedByReason: Record<string, number>,
  reason: string
) {
  skippedByReason[reason] = (skippedByReason[reason] ?? 0) + 1;
}

/**
 * Returns a zeroed stats record for all question types.
 */
function emptyGeneratedByType(): Record<BunpouQuestionType, number> {
  return {
    sentential_grammar_1: 0,
    sentential_grammar_2: 0,
    text_grammar: 0,
  };
}

/**
 * Returns an empty array group for each question type.
 */
function emptyQuestionGroups(): Record<BunpouQuestionType, JlptImportQuestion[]> {
  return {
    sentential_grammar_1: [],
    sentential_grammar_2: [],
    text_grammar: [],
  };
}

/**
 * Gets all supported grammar question types.
 */
export function getBunpouQuestionTypesForLevel() {
  return [...BUNPOU_OFFICIAL_QUESTION_TYPES];
}

/**
 * Normalizes and filters requested question types.
 */
export function normalizeBunpouQuestionTypes(
  questionTypes?: readonly BunpouQuestionType[]
) {
  const requested = questionTypes?.length
    ? questionTypes
    : BUNPOU_OFFICIAL_QUESTION_TYPES;

  return BUNPOU_OFFICIAL_QUESTION_TYPES.filter((type) =>
    requested.includes(type)
  );
}

/**
 * Checks if a question type requires LLM generation.
 */
export function requiresBunpouLlm(type: BunpouQuestionType) {
  return LLM_QUESTION_TYPES.has(type);
}

/**
 * Formats a source reference string for a grammar row.
 */
function sourceReference(row: NormalizedGrammarRow) {
  return `${row.title} / ${row.meaning}`;
}

/**
 * Selects distinct distractor values from candidate rows.
 */
function selectDistinctDistractors(input: {
  candidates: readonly NormalizedGrammarRow[];
  correctValue: string;
  targetId: string;
  getValue: (row: NormalizedGrammarRow) => string | null;
  count: number;
  seed: string | number;
}) {
  const choices: string[] = [];
  const seen = new Set([input.correctValue]);

  for (const row of stableShuffle(input.candidates, input.seed)) {
    if (row.id === input.targetId) continue;
    const value = input.getValue(row);
    if (!value || seen.has(value)) continue;

    choices.push(value);
    seen.add(value);
    if (choices.length >= input.count) break;
  }

  return choices;
}

/**
 * Shuffles correct answer and distractors, returning choices and correct index.
 */
function buildChoices(correctValue: string, distractors: string[], seed: string) {
  const values = stableShuffle([correctValue, ...distractors], seed);
  return {
    choices: values.map((value) => ({ type: "text" as const, value })),
    correctChoiceIndex: values.indexOf(correctValue),
  };
}

/**
 * Factory function to build a base JlptImportQuestion object.
 */
function baseQuestion(input: {
  row: NormalizedGrammarRow;
  jlptLevel: JlptImportLevel;
  type: BunpouQuestionType;
  promptHtml?: string | null;
  passageKey?: string | null;
  choices: Array<{ type: "text"; value: string }>;
  correctChoiceIndex: number;
  explanationHtml?: string | null;
  sourceReference?: string | null;
  keySuffix?: string;
}) {
  const keySuffix = input.keySuffix
    ? `-${slugToken(input.keySuffix)}`
    : "";

  return {
    key: `q-${input.jlptLevel.toLowerCase()}-bunpou-${input.type}-${slugToken(input.row.id)}${keySuffix}`,
    jlptLevel: input.jlptLevel,
    sessionType: "grammar" as const,
    mondaiNumber: BUNPOU_MONDAI_BY_TYPE[input.type],
    promptHtml: input.promptHtml ?? null,
    passageKey: input.passageKey ?? null,
    choices: input.choices,
    correctChoiceIndex: input.correctChoiceIndex,
    explanationHtml: input.explanationHtml ?? null,
    difficulty: LEVEL_DIFFICULTY[input.jlptLevel],
    sourceType: "grammar" as const,
    sourceId: input.row.id,
    sourceReference: input.sourceReference ?? sourceReference(input.row),
    isPublished: false,
  } satisfies JlptImportQuestion;
}

/**
 * Generates a rule-based sentential_grammar_1 question.
 */
function buildSententialGrammar1Question(input: {
  row: NormalizedGrammarRow;
  poolRows: readonly NormalizedGrammarRow[];
  jlptLevel: JlptImportLevel;
  seed: string | number;
  skippedByReason: Record<string, number>;
}) {
  const correctValue = input.row.title;
  const distractors = selectDistinctDistractors({
    candidates: input.poolRows,
    correctValue,
    targetId: input.row.id,
    getValue: (row) => row.title,
    count: 3,
    seed: `${input.seed}:sentential_grammar_1:distractors:${input.row.id}`,
  });

  if (distractors.length < 3) {
    incrementReason(
      input.skippedByReason,
      "sentential_grammar_1_insufficient_distractors"
    );
    return null;
  }

  const choiceData = buildChoices(
    correctValue,
    distractors,
    `${input.seed}:sentential_grammar_1:choices:${input.row.id}`
  );
  const formation = input.row.formation
    ? `<p><small>${escapeHtml(input.row.formation)}</small></p>`
    : "";

  return baseQuestion({
    row: input.row,
    jlptLevel: input.jlptLevel,
    type: "sentential_grammar_1",
    promptHtml: [
      "<p>文の意味に合う文法を一つ選びなさい。</p>",
      `<p>${escapeHtml(input.row.meaning)}</p>`,
      formation,
    ].join(""),
    choices: choiceData.choices,
    correctChoiceIndex: choiceData.correctChoiceIndex,
    explanationHtml: `<p>${escapeHtml(input.row.title)} = ${escapeHtml(input.row.meaning)}</p>`,
  });
}

/**
 * Dispatches rule-based question generation based on type.
 */
function buildRuleBasedQuestion(input: {
  type: BunpouQuestionType;
  row: NormalizedGrammarRow;
  poolRows: readonly NormalizedGrammarRow[];
  jlptLevel: JlptImportLevel;
  seed: string | number;
  skippedByReason: Record<string, number>;
}) {
  if (input.type === "sentential_grammar_1") {
    return buildSententialGrammar1Question(input);
  }

  incrementReason(input.skippedByReason, `${input.type}_requires_llm`);
  return null;
}

/**
 * Normalizes passage data from an enhanced question.
 */
function normalizePassage(
  enhancedQuestion: BunpouEnhancedQuestion,
  jlptLevel: JlptImportLevel
): JlptImportPassage | null {
  if (!enhancedQuestion.passage) return null;

  const key = compactString(enhancedQuestion.passage.key);
  const contentHtml = compactString(enhancedQuestion.passage.contentHtml);
  if (!key || !contentHtml) return null;

  return {
    key,
    jlptLevel,
    sessionType: "grammar",
    mondaiNumber: BUNPOU_MONDAI_BY_TYPE.text_grammar,
    title: compactString(enhancedQuestion.passage.title),
    contentHtml,
    sourceLabel: compactString(enhancedQuestion.passage.sourceLabel),
    isPublished: false,
  };
}

/**
 * Validates and builds a question from enhanced input data.
 */
function buildEnhancedQuestion(input: {
  enhancedQuestion: BunpouEnhancedQuestion;
  rowById: Map<string, NormalizedGrammarRow>;
  jlptLevel: JlptImportLevel;
  passageKeys: Set<string>;
  skippedByReason: Record<string, number>;
}) {
  const row = input.rowById.get(input.enhancedQuestion.sourceId);
  if (!row) {
    incrementReason(input.skippedByReason, "enhanced_source_missing");
    return null;
  }

  const promptHtml = compactString(input.enhancedQuestion.promptHtml);
  const passageKey =
    compactString(input.enhancedQuestion.passageKey) ??
    compactString(input.enhancedQuestion.passage?.key);

  if (!promptHtml && !passageKey) {
    incrementReason(input.skippedByReason, "enhanced_prompt_missing");
    return null;
  }
  if (passageKey && !input.passageKeys.has(passageKey)) {
    incrementReason(input.skippedByReason, "enhanced_passage_missing");
    return null;
  }

  const choices = input.enhancedQuestion.choices
    .map(compactString)
    .filter((choice): choice is string => Boolean(choice));
  if (choices.length < 4 || new Set(choices).size !== choices.length) {
    incrementReason(input.skippedByReason, "enhanced_choices_invalid");
    return null;
  }
  if (
    !Number.isInteger(input.enhancedQuestion.correctChoiceIndex) ||
    input.enhancedQuestion.correctChoiceIndex < 0 ||
    input.enhancedQuestion.correctChoiceIndex >= choices.length
  ) {
    incrementReason(input.skippedByReason, "enhanced_correct_index_invalid");
    return null;
  }

  return baseQuestion({
    row,
    jlptLevel: input.jlptLevel,
    type: input.enhancedQuestion.type,
    promptHtml,
    passageKey,
    choices: choices.map((value) => ({ type: "text", value })),
    correctChoiceIndex: input.enhancedQuestion.correctChoiceIndex,
    explanationHtml: input.enhancedQuestion.explanationHtml ?? null,
    sourceReference: input.enhancedQuestion.sourceReference ?? sourceReference(row),
    keySuffix: [
      input.enhancedQuestion.type,
      promptHtml ?? "",
      passageKey ?? "",
      choices[input.enhancedQuestion.correctChoiceIndex] ?? "",
    ].join(":"),
  });
}

/**
 * Selects questions up to maxQuestions, balancing distribution across types.
 */
function selectQuestionsByLimit(
  questionGroups: Record<BunpouQuestionType, JlptImportQuestion[]>,
  questionTypes: readonly BunpouQuestionType[],
  maxQuestions?: number
) {
  const allQuestions = questionTypes.flatMap((type) => questionGroups[type]);
  if (!maxQuestions || maxQuestions <= 0 || allQuestions.length <= maxQuestions) {
    return allQuestions;
  }

  const selectedGroups = emptyQuestionGroups();
  const baseQuota = Math.floor(maxQuestions / questionTypes.length);
  let remainder = maxQuestions % questionTypes.length;

  // Distribute base quota to each type
  for (const type of questionTypes) {
    const quota = baseQuota + (remainder > 0 ? 1 : 0);
    remainder = Math.max(0, remainder - 1);
    selectedGroups[type] = questionGroups[type].slice(0, quota);
  }

  let selectedCount = questionTypes.reduce(
    (total, type) => total + selectedGroups[type].length,
    0
  );

  // Fill remaining slots from available pools
  for (const type of questionTypes) {
    if (selectedCount >= maxQuestions) break;
    const alreadySelected = selectedGroups[type].length;
    const remaining = questionGroups[type].slice(alreadySelected);
    const canTake = Math.min(maxQuestions - selectedCount, remaining.length);
    selectedGroups[type].push(...remaining.slice(0, canTake));
    selectedCount += canTake;
  }

  return questionTypes.flatMap((type) => selectedGroups[type]);
}

/**
 * Assigns sequential question numbers within each Mondai section.
 */
function assignQuestionNumbers(questions: readonly JlptImportQuestion[]) {
  const counters = new Map<number, number>();

  return questions.map((question) => {
    const nextQuestionNumber = (counters.get(question.mondaiNumber) ?? 0) + 1;
    counters.set(question.mondaiNumber, nextQuestionNumber);
    return {
      ...question,
      questionNumber: nextQuestionNumber,
    };
  });
}

/**
 * Generates a unique signature string for deduplication.
 */
function questionSignature(question: JlptImportQuestion) {
  const correctChoice = question.choices[question.correctChoiceIndex]?.value ?? "";
  return [
    question.sessionType,
    question.mondaiNumber,
    question.passageKey ?? "",
    question.promptHtml ?? "",
    correctChoice,
  ].join("|");
}

/**
 * Main entry point to build a grammar import package from grammar rows and enhanced questions.
 */
export function buildBunpouImportPackage(
  input: BuildBunpouImportPackageInput
): BuildBunpouImportPackageResult {
  const seed = input.seed ?? `${input.jlptLevel}:bunpou`;
  const poolRows = normalizeGrammarRows(input.grammarRows, input.jlptLevel);
  const rowById = new Map(poolRows.map((row) => [row.id, row]));
  const candidateIds = input.candidateIds?.length
    ? new Set(input.candidateIds.map((id) => id.trim()).filter(Boolean))
    : null;
  const candidateRows = poolRows.filter((row) =>
    candidateIds ? candidateIds.has(row.id) : true
  );
  const questionTypes = normalizeBunpouQuestionTypes(input.questionTypes);
  const skippedByReason: Record<string, number> = {};
  const questionGroups = emptyQuestionGroups();
  const seenQuestionSignatures = new Set<string>();
  const passages = new Map<string, JlptImportPassage>();

  // Extract and normalize passages from enhanced questions
  for (const enhancedQuestion of input.enhancedQuestions ?? []) {
    const passage = normalizePassage(enhancedQuestion, input.jlptLevel);
    if (passage) passages.set(passage.key, passage);
  }

  const addQuestion = (question: JlptImportQuestion | null) => {
    if (!question) return;

    const type = questionTypes.find(
      (candidate) =>
        BUNPOU_MONDAI_BY_TYPE[candidate] === question.mondaiNumber
    );
    if (!type) return;

    const signature = questionSignature(question);
    if (seenQuestionSignatures.has(signature)) {
      incrementReason(skippedByReason, "duplicate_question_signature");
      return;
    }

    seenQuestionSignatures.add(signature);
    questionGroups[type].push(question);
  };

  // Process enhanced questions first
  for (const enhancedQuestion of input.enhancedQuestions ?? []) {
    addQuestion(
      buildEnhancedQuestion({
        enhancedQuestion,
        rowById,
        jlptLevel: input.jlptLevel,
        passageKeys: new Set(passages.keys()),
        skippedByReason,
      })
    );
  }

  const hasEnhanced = (rowId: string, qType: string) => {
    return (input.enhancedQuestions ?? []).some(
      (eq) => eq.sourceId === rowId && eq.type === qType
    );
  };

  // Process rule-based questions for types that do not require LLM
  for (const type of questionTypes) {
    if (requiresBunpouLlm(type)) continue;

    const orderedCandidateRows = stableShuffle(
      candidateRows,
      `${seed}:candidate-order:${type}`
    );

    for (const row of orderedCandidateRows) {
      if (hasEnhanced(row.id, type)) {
        continue;
      }

      addQuestion(
        buildRuleBasedQuestion({
          type,
          row,
          poolRows,
          jlptLevel: input.jlptLevel,
          seed,
          skippedByReason,
        })
      );
    }
  }

  // Track skipped types that require LLM but had no enhanced questions
  for (const type of questionTypes) {
    if (requiresBunpouLlm(type) && questionGroups[type].length === 0) {
      incrementReason(skippedByReason, `${type}_requires_llm`);
    }
  }

  const questions = assignQuestionNumbers(
    selectQuestionsByLimit(questionGroups, questionTypes, input.maxQuestions)
  ).map((question) => ({
    ...question,
    isPublished: input.isPublished ?? false,
  }));
  const usedPassageKeys = new Set(
    questions
      .map((question) => question.passageKey)
      .filter((key): key is string => Boolean(key))
  );
  const generatedByType = emptyGeneratedByType();
  for (const question of questions) {
    const type = BUNPOU_OFFICIAL_QUESTION_TYPES.find(
      (candidate) => BUNPOU_MONDAI_BY_TYPE[candidate] === question.mondaiNumber
    );
    if (type) generatedByType[type] += 1;
  }

  const templateSlug =
    input.templateSlug ?? `jlpt-${input.jlptLevel.toLowerCase()}-bunpou-draft`;
  const timeLimitMinutes =
    input.timeLimitMinutes ?? Math.max(15, Math.ceil(questions.length * 1.2));
  const isPublished = input.isPublished ?? false;

  const importPackage: JlptImportPackage = {
    template: {
      slug: templateSlug,
      title: input.title ?? `JLPT ${input.jlptLevel} Bunpou Draft`,
      description:
        input.description ??
        `Latihan soal JLPT ${input.jlptLevel} Bunpou (Tata Bahasa) untuk menguji struktur kalimat dan tata bahasa Jepang.`,
      jlptLevel: input.jlptLevel,
      timeLimitMinutes,
      passingScore: input.passingScore ?? 60,
      generationMode: "fixed",
      isPublished,
    },
    passages: Array.from(passages.values()).filter((passage) =>
      usedPassageKeys.has(passage.key)
    ),
    questions,
    templateQuestions: questions.map((question, index) => ({
      questionKey: question.key,
      position: index + 1,
      sectionOrder: 1,
    })),
    assets: [],
  };

  return {
    importPackage,
    stats: {
      inputRows: input.grammarRows.length,
      poolRows: poolRows.length,
      candidateRows: candidateRows.length,
      generatedQuestions: questions.length,
      generatedByType,
      skippedByReason,
    },
  };
}