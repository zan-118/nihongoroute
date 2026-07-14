import type {
  JlptImportLevel,
  JlptImportPackage,
  JlptImportQuestion,
} from "@/lib/exams/import-pipeline";
import type { Tables } from "@/types/supabase.generated";

/** Vocab table row type from database schema. */
type VocabTableRow = Tables<"vocab">;

/** Official JLPT Moji-Goi question categories. */
export const MOJI_GOI_OFFICIAL_QUESTION_TYPES = [
  "kanji_reading",
  "orthography",
  "word_formation",
  "context",
  "paraphrase",
  "usage",
] as const;

/** Official question type union. */
export type MojiGoiOfficialQuestionType =
  (typeof MOJI_GOI_OFFICIAL_QUESTION_TYPES)[number];

/** Extended question type union including legacy types. */
export type MojiGoiQuestionType =
  | MojiGoiOfficialQuestionType
  | "reading"
  | "meaning";

/** Subset of vocab fields needed for question generation. */
export type MojiGoiVocabRow = Pick<VocabTableRow, "id" | "word"> &
  Partial<
    Pick<
      VocabTableRow,
      | "examples"
      | "furigana"
      | "hinshi"
      | "is_common"
      | "jlpt_level"
      | "meaning_id"
      | "romaji"
      | "slug"
      | "synonyms"
    >
  >;

/** Pre-generated or LLM-generated question structure. */
export interface MojiGoiEnhancedQuestion {
  type: MojiGoiQuestionType;
  sourceId: string;
  promptHtml: string;
  choices: readonly string[];
  correctChoiceIndex: number;
  explanationHtml?: string | null;
  sourceReference?: string | null;
}

/** Input parameters for building Moji-Goi package. */
export interface BuildMojiGoiImportPackageInput {
  vocabRows: readonly MojiGoiVocabRow[];
  jlptLevel: JlptImportLevel;
  templateSlug?: string;
  title?: string;
  description?: string | null;
  timeLimitMinutes?: number;
  passingScore?: number;
  questionTypes?: readonly MojiGoiQuestionType[];
  maxQuestions?: number;
  candidateIds?: readonly string[];
  seed?: string | number;
  enhancedQuestions?: readonly MojiGoiEnhancedQuestion[];
  isPublished?: boolean;
}

/** Statistics for generation run. */
export interface MojiGoiGenerationStats {
  inputRows: number;
  poolRows: number;
  candidateRows: number;
  generatedQuestions: number;
  generatedByType: Record<MojiGoiOfficialQuestionType, number>;
  skippedByReason: Record<string, number>;
}

/** Result of package generation. */
export interface BuildMojiGoiImportPackageResult {
  importPackage: JlptImportPackage;
  stats: MojiGoiGenerationStats;
}

/** Cleaned vocab row structure. */
interface NormalizedVocabRow {
  id: string;
  word: string;
  furigana: string | null;
  meaning: string | null;
  jlptLevel: JlptImportLevel | null;
  hinshiTags: string[];
  slug: string | null;
  isCommon: boolean | null;
}

/** Map JLPT level to numeric difficulty. */
const LEVEL_DIFFICULTY: Record<JlptImportLevel, number> = {
  N5: 1,
  N4: 2,
  N3: 3,
  N2: 4,
  N1: 5,
};

/** Map JLPT level to official Mondai section numbers. */
const MOJI_GOI_MONDAI_BY_LEVEL: Record<
  JlptImportLevel,
  Partial<Record<MojiGoiOfficialQuestionType, number>>
> = {
  N1: {
    kanji_reading: 1,
    context: 2,
    paraphrase: 3,
    usage: 4,
  },
  N2: {
    kanji_reading: 1,
    orthography: 2,
    word_formation: 3,
    context: 4,
    paraphrase: 5,
    usage: 6,
  },
  N3: {
    kanji_reading: 1,
    orthography: 2,
    context: 3,
    paraphrase: 4,
    usage: 5,
  },
  N4: {
    kanji_reading: 1,
    orthography: 2,
    context: 3,
    paraphrase: 4,
    usage: 5,
  },
  N5: {
    kanji_reading: 1,
    orthography: 2,
    context: 3,
    paraphrase: 4,
  },
};

/** Question types requiring LLM generation. */
const LLM_QUESTION_TYPES = new Set<MojiGoiOfficialQuestionType>([
  "context",
  "usage",
  "word_formation",
]);

/** Clean and trim string. Return null if empty. */
function compactString(value: unknown) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/** Parse and validate JLPT level. */
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

/** Extract part-of-speech tags from raw database field. */
function extractHinshiTags(value: unknown): string[] {
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return normalized ? [normalized] : [];
  }

  if (Array.isArray(value)) {
    return Array.from(
      new Set(value.flatMap((item) => extractHinshiTags(item)))
    ).sort();
  }

  if (typeof value === "object" && value !== null) {
    return Array.from(
      new Set(Object.values(value).flatMap((item) => extractHinshiTags(item)))
    ).sort();
  }

  return [];
}

/** Check if string contains kanji characters. */
function hasKanji(value: string) {
  return /[\u3400-\u9fff々]/u.test(value);
}

/** Escape HTML special characters. */
function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** FNV-1a 32-bit hash implementation. */
function hash32(value: string) {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/** Create seeded pseudo-random number generator (Mulberry32). */
function createRandom(seed: string | number) {
  let state = typeof seed === "number" ? seed >>> 0 : hash32(seed);
  return () => {
    state += 0x6d2b79f5;
    let mixed = state;
    mixed = Math.imul(mixed ^ (mixed >>> 15), mixed | 1);
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };
}

/** Shuffle array deterministically using seed. */
function stableShuffle<T>(items: readonly T[], seed: string | number) {
  const output = [...items];
  const random = createRandom(seed);

  for (let index = output.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [output[index], output[swapIndex]] = [output[swapIndex], output[index]];
  }

  return output;
}

/** Generate URL-safe slug token with hash suffix. */
function slugToken(value: string) {
  const normalized = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);

  const hash = hash32(value).toString(16);
  return normalized ? `${normalized}-${hash}` : hash;
}

/** Sort function for deterministic vocab ordering. */
function sortRow(a: NormalizedVocabRow, b: NormalizedVocabRow) {
  return (
    a.word.localeCompare(b.word, "ja") ||
    (a.furigana ?? "").localeCompare(b.furigana ?? "", "ja") ||
    a.id.localeCompare(b.id)
  );
}

/** Clean, filter, and sort raw vocab rows. */
function normalizeVocabRows(
  rows: readonly MojiGoiVocabRow[],
  jlptLevel: JlptImportLevel
) {
  const uniqueRows = new Map<string, NormalizedVocabRow>();

  for (const row of rows) {
    const id = compactString(row.id);
    const word = compactString(row.word);
    if (!id || !word || uniqueRows.has(id)) continue;

    const rowLevel = normalizeLevel(row.jlpt_level ?? null);
    if (rowLevel && rowLevel !== jlptLevel) continue;

    uniqueRows.set(id, {
      id,
      word,
      furigana: compactString(row.furigana),
      meaning: compactString(row.meaning_id),
      jlptLevel: rowLevel,
      hinshiTags: extractHinshiTags(row.hinshi),
      slug: compactString(row.slug),
      isCommon: typeof row.is_common === "boolean" ? row.is_common : null,
    });
  }

  return Array.from(uniqueRows.values()).sort(sortRow);
}

/** Increment skip reason counter. */
function incrementReason(
  skippedByReason: Record<string, number>,
  reason: string
) {
  skippedByReason[reason] = (skippedByReason[reason] ?? 0) + 1;
}

/** Initialize empty stats counter map. */
function emptyGeneratedByType(): Record<MojiGoiOfficialQuestionType, number> {
  return {
    kanji_reading: 0,
    orthography: 0,
    word_formation: 0,
    context: 0,
    paraphrase: 0,
    usage: 0,
  };
}

/** Initialize empty question lists grouped by type. */
function emptyQuestionGroups(): Record<
  MojiGoiOfficialQuestionType,
  JlptImportQuestion[]
> {
  return {
    kanji_reading: [],
    orthography: [],
    word_formation: [],
    context: [],
    paraphrase: [],
    usage: [],
  };
}

/** Build human-readable reference string for question source. */
function sourceReference(row: NormalizedVocabRow) {
  const parts = [row.word];
  if (row.furigana && row.furigana !== row.word) parts.push(row.furigana);
  if (row.meaning) parts.push(row.meaning);
  return parts.join(" / ");
}

/** Check if two vocab items share part-of-speech tags. */
function hasSharedHinshi(
  target: NormalizedVocabRow,
  candidate: NormalizedVocabRow
) {
  if (target.hinshiTags.length === 0 || candidate.hinshiTags.length === 0) {
    return false;
  }

  return target.hinshiTags.some((tag) => candidate.hinshiTags.includes(tag));
}

/** Select unique distractor values from candidate pool. */
function selectDistinctDistractors(input: {
  candidates: readonly NormalizedVocabRow[];
  correctValue: string;
  targetId: string;
  getValue: (row: NormalizedVocabRow) => string | null;
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

/** Shuffle correct answer and distractors together. */
function buildChoices(correctValue: string, distractors: string[], seed: string) {
  const values = stableShuffle([correctValue, ...distractors], seed);
  return {
    choices: values.map((value) => ({ type: "text" as const, value })),
    correctChoiceIndex: values.indexOf(correctValue),
  };
}

/** Map legacy question types to official types. */
function canonicalQuestionType(
  type: MojiGoiQuestionType
): MojiGoiOfficialQuestionType {
  if (type === "reading") return "kanji_reading";
  if (type === "meaning") return "paraphrase";
  return type;
}

/** Get official question types supported by JLPT level. */
export function getMojiGoiQuestionTypesForLevel(level: JlptImportLevel) {
  return MOJI_GOI_OFFICIAL_QUESTION_TYPES.filter(
    (type) => MOJI_GOI_MONDAI_BY_LEVEL[level][type] !== undefined
  );
}

/** Filter and normalize requested question types for level. */
export function normalizeMojiGoiQuestionTypes(
  questionTypes: readonly MojiGoiQuestionType[] | undefined,
  level: JlptImportLevel
) {
  const allowed = new Set(getMojiGoiQuestionTypesForLevel(level));
  const requested = questionTypes?.length
    ? questionTypes.map(canonicalQuestionType)
    : getMojiGoiQuestionTypesForLevel(level);

  return MOJI_GOI_OFFICIAL_QUESTION_TYPES.filter(
    (type) => allowed.has(type) && requested.includes(type)
  );
}

/** Check if question type requires LLM generation. */
export function requiresMojiGoiLlm(type: MojiGoiQuestionType) {
  return LLM_QUESTION_TYPES.has(canonicalQuestionType(type));
}

/** Get Mondai section number for question type. */
function mondaiNumberForType(
  level: JlptImportLevel,
  type: MojiGoiOfficialQuestionType
) {
  return MOJI_GOI_MONDAI_BY_LEVEL[level][type] ?? null;
}

/** Build base question object with common fields. */
function baseQuestion(input: {
  row: NormalizedVocabRow;
  jlptLevel: JlptImportLevel;
  type: MojiGoiOfficialQuestionType;
  promptHtml: string;
  choices: Array<{ type: "text"; value: string }>;
  correctChoiceIndex: number;
  explanationHtml?: string | null;
  sourceReference?: string | null;
  keySuffix?: string;
}) {
  const mondaiNumber = mondaiNumberForType(input.jlptLevel, input.type);
  if (!mondaiNumber) return null;

  const keySuffix = input.keySuffix
    ? `-${slugToken(input.keySuffix)}`
    : "";

  return {
    key: `q-${input.jlptLevel.toLowerCase()}-moji-goi-${input.type}-${slugToken(input.row.id)}${keySuffix}`,
    jlptLevel: input.jlptLevel,
    sessionType: "vocabulary" as const,
    mondaiNumber,
    promptHtml: input.promptHtml,
    choices: input.choices,
    correctChoiceIndex: input.correctChoiceIndex,
    explanationHtml: input.explanationHtml ?? null,
    difficulty: LEVEL_DIFFICULTY[input.jlptLevel],
    sourceType: "vocab" as const,
    sourceId: input.row.id,
    sourceReference: input.sourceReference ?? sourceReference(input.row),
    isPublished: false,
  } satisfies JlptImportQuestion;
}

/** Build kanji reading question (Mondai 1). */
function buildKanjiReadingQuestion(input: {
  row: NormalizedVocabRow;
  poolRows: readonly NormalizedVocabRow[];
  jlptLevel: JlptImportLevel;
  seed: string | number;
  skippedByReason: Record<string, number>;
}) {
  const correctValue = input.row.furigana;
  if (!correctValue) {
    incrementReason(input.skippedByReason, "kanji_reading_missing_furigana");
    return null;
  }
  if (!hasKanji(input.row.word) || input.row.word === correctValue) {
    incrementReason(input.skippedByReason, "kanji_reading_not_kanji_word");
    return null;
  }

  const distractors = selectDistinctDistractors({
    candidates: input.poolRows,
    correctValue,
    targetId: input.row.id,
    getValue: (row) => row.furigana,
    count: 3,
    seed: `${input.seed}:kanji_reading:distractors:${input.row.id}`,
  });

  if (distractors.length < 3) {
    incrementReason(
      input.skippedByReason,
      "kanji_reading_insufficient_distractors"
    );
    return null;
  }

  const choiceData = buildChoices(
    correctValue,
    distractors,
    `${input.seed}:kanji_reading:choices:${input.row.id}`
  );

  return baseQuestion({
    row: input.row,
    jlptLevel: input.jlptLevel,
    type: "kanji_reading",
    promptHtml: [
      "<p>下線のことばの読み方として最もよいものを、一つ選びなさい。</p>",
      `<p><u>${escapeHtml(input.row.word)}</u></p>`,
    ].join(""),
    choices: choiceData.choices,
    correctChoiceIndex: choiceData.correctChoiceIndex,
    explanationHtml: input.row.meaning
      ? `<p>${escapeHtml(input.row.word)} = ${escapeHtml(input.row.meaning)}</p>`
      : null,
  });
}

/** Build orthography question (Mondai 2). */
function buildOrthographyQuestion(input: {
  row: NormalizedVocabRow;
  poolRows: readonly NormalizedVocabRow[];
  jlptLevel: JlptImportLevel;
  seed: string | number;
  skippedByReason: Record<string, number>;
}) {
  const promptValue = input.row.furigana;
  if (!promptValue) {
    incrementReason(input.skippedByReason, "orthography_missing_furigana");
    return null;
  }
  if (!hasKanji(input.row.word) || input.row.word === promptValue) {
    incrementReason(input.skippedByReason, "orthography_not_kanji_word");
    return null;
  }

  const distractors = selectDistinctDistractors({
    candidates: input.poolRows.filter((row) => hasKanji(row.word)),
    correctValue: input.row.word,
    targetId: input.row.id,
    getValue: (row) => row.word,
    count: 3,
    seed: `${input.seed}:orthography:distractors:${input.row.id}`,
  });

  if (distractors.length < 3) {
    incrementReason(
      input.skippedByReason,
      "orthography_insufficient_distractors"
    );
    return null;
  }

  const choiceData = buildChoices(
    input.row.word,
    distractors,
    `${input.seed}:orthography:choices:${input.row.id}`
  );

  return baseQuestion({
    row: input.row,
    jlptLevel: input.jlptLevel,
    type: "orthography",
    promptHtml: [
      "<p>下線のことばを漢字で書くとき、最もよいものを一つ選びなさい。</p>",
      `<p><u>${escapeHtml(promptValue)}</u></p>`,
    ].join(""),
    choices: choiceData.choices,
    correctChoiceIndex: choiceData.correctChoiceIndex,
    explanationHtml: input.row.meaning
      ? `<p>${escapeHtml(input.row.word)} (${escapeHtml(promptValue)}) = ${escapeHtml(input.row.meaning)}</p>`
      : null,
  });
}

/** Build paraphrase question (Mondai 4/5). */
function buildParaphraseQuestion(input: {
  row: NormalizedVocabRow;
  poolRows: readonly NormalizedVocabRow[];
  jlptLevel: JlptImportLevel;
  seed: string | number;
  skippedByReason: Record<string, number>;
}) {
  const correctValue = input.row.meaning;
  if (!correctValue) {
    incrementReason(input.skippedByReason, "paraphrase_missing_meaning");
    return null;
  }

  // Prioritize distractors sharing same part-of-speech tags.
  const sameHinshiRows = input.poolRows.filter((row) =>
    hasSharedHinshi(input.row, row)
  );
  const fallbackRows = input.poolRows.filter(
    (row) => !sameHinshiRows.some((sameHinshiRow) => sameHinshiRow.id === row.id)
  );
  const distractors = selectDistinctDistractors({
    candidates: [...sameHinshiRows, ...fallbackRows],
    correctValue,
    targetId: input.row.id,
    getValue: (row) => row.meaning,
    count: 3,
    seed: `${input.seed}:paraphrase:distractors:${input.row.id}`,
  });

  if (distractors.length < 3) {
    incrementReason(
      input.skippedByReason,
      "paraphrase_insufficient_distractors"
    );
    return null;
  }

  const choiceData = buildChoices(
    correctValue,
    distractors,
    `${input.seed}:paraphrase:choices:${input.row.id}`
  );
  const displayWord = input.row.word || input.row.furigana || correctValue;

  return baseQuestion({
    row: input.row,
    jlptLevel: input.jlptLevel,
    type: "paraphrase",
    promptHtml: [
      "<p>下線のことばと意味が最も近いものを、一つ選びなさい。</p>",
      `<p><u>${escapeHtml(displayWord)}</u></p>`,
    ].join(""),
    choices: choiceData.choices,
    correctChoiceIndex: choiceData.correctChoiceIndex,
    explanationHtml: input.row.furigana
      ? `<p>${escapeHtml(input.row.word)} (${escapeHtml(input.row.furigana)})</p>`
      : null,
  });
}

/** Route to correct rule-based generator function. */
function buildRuleBasedQuestion(input: {
  type: MojiGoiOfficialQuestionType;
  row: NormalizedVocabRow;
  poolRows: readonly NormalizedVocabRow[];
  jlptLevel: JlptImportLevel;
  seed: string | number;
  skippedByReason: Record<string, number>;
}) {
  if (input.type === "kanji_reading") return buildKanjiReadingQuestion(input);
  if (input.type === "orthography") return buildOrthographyQuestion(input);
  if (input.type === "paraphrase") return buildParaphraseQuestion(input);

  incrementReason(input.skippedByReason, `${input.type}_requires_llm`);
  return null;
}

/** Validate and build question from pre-generated input. */
function buildEnhancedQuestion(input: {
  enhancedQuestion: MojiGoiEnhancedQuestion;
  rowById: Map<string, NormalizedVocabRow>;
  jlptLevel: JlptImportLevel;
  skippedByReason: Record<string, number>;
}) {
  const type = canonicalQuestionType(input.enhancedQuestion.type);
  if (!mondaiNumberForType(input.jlptLevel, type)) {
    incrementReason(input.skippedByReason, `${type}_not_available_for_level`);
    return null;
  }

  const row = input.rowById.get(input.enhancedQuestion.sourceId);
  if (!row) {
    incrementReason(input.skippedByReason, "enhanced_source_missing");
    return null;
  }

  const promptHtml = compactString(input.enhancedQuestion.promptHtml);
  if (!promptHtml) {
    incrementReason(input.skippedByReason, "enhanced_prompt_missing");
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
    type,
    promptHtml,
    choices: choices.map((value) => ({ type: "text", value })),
    correctChoiceIndex: input.enhancedQuestion.correctChoiceIndex,
    explanationHtml: input.enhancedQuestion.explanationHtml ?? null,
    sourceReference: input.enhancedQuestion.sourceReference ?? sourceReference(row),
    keySuffix: `${type}:${promptHtml}`,
  });
}

/** Select questions up to limit, distributing evenly across types. */
function selectQuestionsByLimit(
  questionGroups: Record<MojiGoiOfficialQuestionType, JlptImportQuestion[]>,
  questionTypes: readonly MojiGoiOfficialQuestionType[],
  maxQuestions?: number
) {
  const allQuestions = questionTypes.flatMap((type) => questionGroups[type]);
  if (!maxQuestions || maxQuestions <= 0 || allQuestions.length <= maxQuestions) {
    return allQuestions;
  }

  const selectedGroups = emptyQuestionGroups();
  const baseQuota = Math.floor(maxQuestions / questionTypes.length);
  let remainder = maxQuestions % questionTypes.length;

  // Allocate base quota to each type.
  for (const type of questionTypes) {
    const quota = baseQuota + (remainder > 0 ? 1 : 0);
    remainder = Math.max(0, remainder - 1);
    selectedGroups[type] = questionGroups[type].slice(0, quota);
  }

  let selectedCount = questionTypes.reduce(
    (total, type) => total + selectedGroups[type].length,
    0
  );

  // Fill remaining slots from available pools.
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

/** Assign sequential question numbers within each Mondai section. */
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

/** Generate unique signature to identify duplicate questions. */
function questionSignature(question: JlptImportQuestion) {
  const correctChoice = question.choices[question.correctChoiceIndex]?.value ?? "";
  return [
    question.sessionType,
    question.mondaiNumber,
    question.promptHtml ?? "",
    correctChoice,
  ].join("|");
}

/** Build complete JLPT Moji-Goi import package from vocab rows. */
export function buildMojiGoiImportPackage(
  input: BuildMojiGoiImportPackageInput
): BuildMojiGoiImportPackageResult {
  const seed = input.seed ?? `${input.jlptLevel}:moji-goi`;
  const poolRows = normalizeVocabRows(input.vocabRows, input.jlptLevel);
  const rowById = new Map(poolRows.map((row) => [row.id, row]));
  const candidateIds = input.candidateIds?.length
    ? new Set(input.candidateIds.map((id) => id.trim()).filter(Boolean))
    : null;
  const candidateRows = poolRows.filter((row) =>
    candidateIds ? candidateIds.has(row.id) : true
  );
  const questionTypes = normalizeMojiGoiQuestionTypes(
    input.questionTypes,
    input.jlptLevel
  );
  const skippedByReason: Record<string, number> = {};
  const questionGroups = emptyQuestionGroups();
  const seenQuestionSignatures = new Set<string>();

  const addQuestion = (question: JlptImportQuestion | null) => {
    if (!question) return;

    const type = questionTypes.find(
      (candidate) =>
        mondaiNumberForType(input.jlptLevel, candidate) ===
        question.mondaiNumber
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

  const hasEnhanced = (rowId: string, qType: string) => {
    return (input.enhancedQuestions ?? []).some(
      (eq) => eq.sourceId === rowId && canonicalQuestionType(eq.type) === qType
    );
  };

  // Process pre-generated enhanced questions first.
  for (const enhancedQuestion of input.enhancedQuestions ?? []) {
    addQuestion(
      buildEnhancedQuestion({
        enhancedQuestion,
        rowById,
        jlptLevel: input.jlptLevel,
        skippedByReason,
      })
    );
  }

  // Generate rule-based questions.
  for (const type of questionTypes) {
    if (requiresMojiGoiLlm(type)) continue;

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

  // Log missing LLM questions.
  for (const type of questionTypes) {
    if (
      requiresMojiGoiLlm(type) &&
      questionGroups[type].length === 0
    ) {
      incrementReason(skippedByReason, `${type}_requires_llm`);
    }
  }

  const questions = assignQuestionNumbers(
    selectQuestionsByLimit(questionGroups, questionTypes, input.maxQuestions)
  ).map((question) => ({
    ...question,
    isPublished: input.isPublished ?? false,
  }));
  const generatedByType = emptyGeneratedByType();
  for (const question of questions) {
    const type = MOJI_GOI_OFFICIAL_QUESTION_TYPES.find(
      (candidate) =>
        mondaiNumberForType(input.jlptLevel, candidate) ===
        question.mondaiNumber
    );
    if (type) generatedByType[type] += 1;
  }

  const templateSlug =
    input.templateSlug ?? `jlpt-${input.jlptLevel.toLowerCase()}-moji-goi-draft`;
  const timeLimitMinutes =
    input.timeLimitMinutes ?? Math.max(15, Math.ceil(questions.length * 0.75));
  const isPublished = input.isPublished ?? false;

  const importPackage: JlptImportPackage = {
    template: {
      slug: templateSlug,
      title: input.title ?? `JLPT ${input.jlptLevel} Moji/Goi Draft`,
      description:
        input.description ??
        `Latihan soal JLPT ${input.jlptLevel} Moji/Goi (Kosakata & Kanji) untuk menguji pemahaman kosakata dan cara baca.`,
      jlptLevel: input.jlptLevel,
      timeLimitMinutes,
      passingScore: input.passingScore ?? 60,
      generationMode: "fixed",
      isPublished,
    },
    passages: [],
    questions,
    templateQuestions: questions.map((question, index) => ({
      questionKey: question.key,
      position: index + 1,
      sectionOrder: 0,
    })),
    assets: [],
  };

  return {
    importPackage,
    stats: {
      inputRows: input.vocabRows.length,
      poolRows: poolRows.length,
      candidateRows: candidateRows.length,
      generatedQuestions: questions.length,
      generatedByType,
      skippedByReason,
    },
  };
}