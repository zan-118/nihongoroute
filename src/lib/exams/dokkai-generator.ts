import type {
  JlptImportLevel,
  JlptImportPackage,
  JlptImportPassage,
  JlptImportQuestion,
} from "@/lib/exams/import-pipeline";

/**
 * Official JLPT reading question types.
 */
export const DOKKAI_OFFICIAL_QUESTION_TYPES = [
  "short_passage",
  "medium_passage",
  "long_passage",
  "integrated_comprehension",
  "information_retrieval",
] as const;

/**
 * Union type of official reading question types.
 */
export type DokkaiQuestionType = (typeof DOKKAI_OFFICIAL_QUESTION_TYPES)[number];

/**
 * Structure for enhanced reading question data.
 */
export interface DokkaiEnhancedQuestion {
  type: DokkaiQuestionType;
  sourceType?: "vocab" | "grammar" | "kanji" | "reading" | "custom" | null;
  sourceId?: string | null;
  promptHtml: string;
  passage: {
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
 * Input parameters for building reading import package.
 */
export interface BuildDokkaiImportPackageInput {
  jlptLevel: JlptImportLevel;
  templateSlug?: string;
  title?: string;
  description?: string | null;
  timeLimitMinutes?: number;
  passingScore?: number;
  seed?: string | number;
  enhancedQuestions: readonly DokkaiEnhancedQuestion[];
  isPublished?: boolean;
}

/**
 * Statistics for reading package generation.
 */
export interface DokkaiGenerationStats {
  generatedQuestions: number;
  generatedByType: Record<DokkaiQuestionType, number>;
  skippedByReason: Record<string, number>;
}

/**
 * Result of reading package generation.
 */
export interface BuildDokkaiImportPackageResult {
  importPackage: JlptImportPackage;
  stats: DokkaiGenerationStats;
}

/**
 * Get official JLPT mondai number based on level and question type.
 * 
 * @param level JLPT level.
 * @param type Question type.
 * @returns Official mondai number.
 */
export function getDokkaiMondaiNumber(
  level: JlptImportLevel,
  type: DokkaiQuestionType
): number {
  // Map level and type to official JLPT section number
  switch (level) {
    case "N5":
      if (type === "short_passage") return 4;
      if (type === "medium_passage" || type === "long_passage") return 5;
      if (type === "information_retrieval") return 6;
      return 4;
    case "N4":
      if (type === "short_passage") return 4;
      if (type === "medium_passage" || type === "long_passage") return 5;
      if (type === "information_retrieval") return 6;
      return 4;
    case "N3":
      if (type === "short_passage") return 4;
      if (type === "medium_passage") return 5;
      if (type === "long_passage") return 6;
      if (type === "information_retrieval") return 7;
      return 4;
    case "N2":
      if (type === "short_passage") return 7;
      if (type === "medium_passage") return 8;
      if (type === "integrated_comprehension") return 9;
      if (type === "long_passage") return 10;
      if (type === "information_retrieval") return 11;
      return 7;
    case "N1":
      if (type === "short_passage") return 8;
      if (type === "medium_passage") return 9;
      if (type === "integrated_comprehension") return 10;
      if (type === "long_passage") return 11;
      if (type === "information_retrieval") return 13;
      return 8;
    default:
      return 4;
  }
}

/**
 * Trim string. Return null if empty.
 * 
 * @param value Input value.
 * @returns Cleaned string or null.
 */
function compactString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/**
 * Generate unique slug hash from string.
 * 
 * @param value Input string.
 * @returns Slug with hash suffix.
 */
function slugToken(value: string): string {
  const normalized = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);

  // FNV-1a hash implementation for unique slug suffix
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  const hex = (hash >>> 0).toString(16);
  return normalized ? `${normalized}-${hex}` : hex;
}

/**
 * Initialize zeroed counters for each question type.
 * 
 * @returns Record with zeroed counters.
 */
function emptyGeneratedByType(): Record<DokkaiQuestionType, number> {
  return {
    short_passage: 0,
    medium_passage: 0,
    long_passage: 0,
    integrated_comprehension: 0,
    information_retrieval: 0,
  };
}

/**
 * Build JLPT reading import package from enhanced questions.
 * 
 * @param input Package build parameters.
 * @returns Import package and generation stats.
 */
export function buildDokkaiImportPackage(
  input: BuildDokkaiImportPackageInput
): BuildDokkaiImportPackageResult {
  const skippedByReason: Record<string, number> = {};
  const generatedByType = emptyGeneratedByType();
  const passages = new Map<string, JlptImportPassage>();
  const questions: JlptImportQuestion[] = [];
  const seenSignatures = new Set<string>();

  const isPublished = input.isPublished ?? false;

  let qIndex = 0;
  for (const eq of input.enhancedQuestions) {
    qIndex += 1;
    const type = eq.type;
    const promptHtml = compactString(eq.promptHtml);
    const pKey = compactString(eq.passage.key);
    const pContent = compactString(eq.passage.contentHtml);

    // Validate prompt
    if (!promptHtml) {
      skippedByReason["missing_prompt"] = (skippedByReason["missing_prompt"] ?? 0) + 1;
      continue;
    }
    // Validate passage
    if (!pKey || !pContent) {
      skippedByReason["missing_passage_content"] = (skippedByReason["missing_passage_content"] ?? 0) + 1;
      continue;
    }

    // Filter and validate choices
    const choices = eq.choices.map(compactString).filter((choice): choice is string => Boolean(choice));
    if (choices.length < 2) {
      skippedByReason["insufficient_choices"] = (skippedByReason["insufficient_choices"] ?? 0) + 1;
      continue;
    }

    // Validate correct choice index
    if (
      !Number.isInteger(eq.correctChoiceIndex) ||
      eq.correctChoiceIndex < 0 ||
      eq.correctChoiceIndex >= choices.length
    ) {
      skippedByReason["invalid_correct_index"] = (skippedByReason["invalid_correct_index"] ?? 0) + 1;
      continue;
    }

    // Prevent duplicate questions using signature hash
    const signature = `${eq.passage.key}|${promptHtml}|${choices[eq.correctChoiceIndex]}`;
    if (seenSignatures.has(signature)) {
      skippedByReason["duplicate_question"] = (skippedByReason["duplicate_question"] ?? 0) + 1;
      continue;
    }
    seenSignatures.add(signature);

    const mondaiNumber = getDokkaiMondaiNumber(input.jlptLevel, type);

    // Register unique passage
    if (!passages.has(pKey)) {
      passages.set(pKey, {
        key: pKey,
        jlptLevel: input.jlptLevel,
        sessionType: "reading",
        mondaiNumber,
        title: compactString(eq.passage.title),
        contentHtml: pContent,
        sourceLabel: compactString(eq.passage.sourceLabel) ?? "AI Generated",
        isPublished,
      });
    }

    // Generate unique question key
    const questionKey = `q-${input.jlptLevel.toLowerCase()}-reading-${type}-${slugToken(promptHtml.slice(0, 30))}-${qIndex}`;
    
    questions.push({
      key: questionKey,
      jlptLevel: input.jlptLevel,
      sessionType: "reading",
      mondaiNumber,
      passageKey: pKey,
      promptHtml,
      choices: choices.map((c) => ({ type: "text", value: c })),
      correctChoiceIndex: eq.correctChoiceIndex,
      explanationHtml: compactString(eq.explanationHtml),
      difficulty: input.jlptLevel === "N5" ? 1 : input.jlptLevel === "N4" ? 2 : input.jlptLevel === "N3" ? 3 : input.jlptLevel === "N2" ? 4 : 5,
      sourceType: eq.sourceType ?? "reading",
      sourceId: eq.sourceId ?? pKey,
      sourceReference: compactString(eq.sourceReference) ?? eq.passage.title ?? "Reading Comprehension",
      isPublished,
    });

    generatedByType[type] += 1;
  }

  // Assign sequential question numbers per mondaiNumber
  const mondaiCounters = new Map<number, number>();
  const numberedQuestions = questions.map((q) => {
    const nextNum = (mondaiCounters.get(q.mondaiNumber) ?? 0) + 1;
    mondaiCounters.set(q.mondaiNumber, nextNum);
    return {
      ...q,
      questionNumber: nextNum,
    };
  });

  const templateSlug = input.templateSlug ?? `jlpt-${input.jlptLevel.toLowerCase()}-reading-draft`;
  // Calculate fallback time limit based on question count
  const timeLimitMinutes = input.timeLimitMinutes ?? Math.max(20, Math.ceil(numberedQuestions.length * 2.5));

  // Construct final import package structure
  const importPackage: JlptImportPackage = {
    template: {
      slug: templateSlug,
      title: input.title ?? `JLPT ${input.jlptLevel} Reading Draft`,
      description: input.description ?? `Latihan soal JLPT ${input.jlptLevel} Reading (Dokkai) untuk menguji pemahaman teks bahasa Jepang.`,
      jlptLevel: input.jlptLevel,
      timeLimitMinutes,
      passingScore: input.passingScore ?? 60,
      generationMode: "fixed",
      isPublished,
    },
    passages: Array.from(passages.values()),
    questions: numberedQuestions,
    templateQuestions: numberedQuestions.map((q, idx) => ({
      questionKey: q.key,
      position: idx + 1,
      sectionOrder: 2, // MojiGoi=0, Bunpou=1, Reading/Dokkai=2, Listening/Choukai=3
    })),
    assets: [],
  };

  return {
    importPackage,
    stats: {
      generatedQuestions: numberedQuestions.length,
      generatedByType,
      skippedByReason,
    },
  };
}