export const JLPT_IMPORT_LEVELS = ["N5", "N4", "N3", "N2", "N1"] as const;
export const JLPT_IMPORT_SECTIONS = [
  "vocabulary",
  "grammar",
  "reading",
  "listening",
] as const;
export const JLPT_IMPORT_SOURCE_TYPES = [
  "vocab",
  "grammar",
  "kanji",
  "listening",
  "reading",
  "custom",
] as const;
export const JLPT_IMPORT_GENERATION_MODES = [
  "fixed",
  "random_by_quota",
] as const;

export type JlptImportLevel = (typeof JLPT_IMPORT_LEVELS)[number];
export type JlptImportSection = (typeof JLPT_IMPORT_SECTIONS)[number];
export type JlptImportSourceType = (typeof JLPT_IMPORT_SOURCE_TYPES)[number];
export type JlptImportGenerationMode =
  (typeof JLPT_IMPORT_GENERATION_MODES)[number];

export interface JlptImportChoice {
  type: "text" | "image";
  value: string;
  alt?: string | null;
}

export interface JlptImportTemplate {
  slug: string;
  title: string;
  description?: string | null;
  jlptLevel: JlptImportLevel;
  timeLimitMinutes: number;
  passingScore?: number;
  generationMode?: JlptImportGenerationMode;
  quotaConfig?: Record<string, { total?: number }>;
  categoryId?: string | null;
  legacySanityId?: string | null;
  isPublished?: boolean;
}

export interface JlptImportPassage {
  key: string;
  jlptLevel?: JlptImportLevel;
  sessionType: JlptImportSection;
  mondaiNumber?: number | null;
  title?: string | null;
  contentHtml?: string | null;
  transcriptHtml?: string | null;
  audioPath?: string | null;
  visualPath?: string | null;
  sourceLabel?: string | null;
  isPublished?: boolean;
}

export interface JlptImportQuestion {
  key: string;
  jlptLevel?: JlptImportLevel;
  sessionType: JlptImportSection;
  mondaiNumber: number;
  questionNumber?: number | null;
  passageKey?: string | null;
  promptHtml?: string | null;
  visualPath?: string | null;
  audioPath?: string | null;
  choices: JlptImportChoice[];
  correctChoiceIndex: number;
  explanationHtml?: string | null;
  difficulty?: number | null;
  sourceType?: JlptImportSourceType | null;
  sourceId?: string | null;
  sourceReference?: string | null;
  isPublished?: boolean;
}

export interface JlptImportTemplateQuestion {
  questionKey: string;
  position: number;
  sectionOrder?: number;
}

export interface JlptImportAsset {
  path: string;
  localPath?: string | null;
  mimeType?: string | null;
}

export interface JlptImportPackage {
  template: JlptImportTemplate;
  passages?: JlptImportPassage[];
  questions: JlptImportQuestion[];
  templateQuestions?: JlptImportTemplateQuestion[];
  assets?: Array<string | JlptImportAsset>;
}

export interface JlptImportValidationIssue {
  code: string;
  path: string;
  message: string;
}

export interface JlptImportAssetReference {
  path: string;
  sourcePath: string;
  usage: "passage_audio" | "passage_visual" | "question_audio" | "question_visual" | "choice_image";
}

export interface JlptImportValidationSummary {
  templateSlug: string | null;
  jlptLevel: JlptImportLevel | null;
  generationMode: JlptImportGenerationMode | null;
  totalPassages: number;
  totalQuestions: number;
  totalTemplateQuestions: number;
  sectionCounts: Record<JlptImportSection, number>;
  assetReferences: JlptImportAssetReference[];
  missingAssetReferences: JlptImportAssetReference[];
}

export interface JlptImportValidationReport {
  ok: boolean;
  errors: JlptImportValidationIssue[];
  warnings: JlptImportValidationIssue[];
  summary: JlptImportValidationSummary;
}

export interface ValidateJlptImportOptions {
  assetExists?: (assetPath: string) => boolean;
  requireDeclaredAssets?: boolean;
}

const LEVEL_SET = new Set<string>(JLPT_IMPORT_LEVELS);
const SECTION_SET = new Set<string>(JLPT_IMPORT_SECTIONS);
const SOURCE_TYPE_SET = new Set<string>(JLPT_IMPORT_SOURCE_TYPES);
const GENERATION_MODE_SET = new Set<string>(JLPT_IMPORT_GENERATION_MODES);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isPositiveInteger(value: unknown): value is number {
  return Number.isInteger(value) && Number(value) > 0;
}

function isNonNegativeInteger(value: unknown): value is number {
  return Number.isInteger(value) && Number(value) >= 0;
}

function addIssue(
  target: JlptImportValidationIssue[],
  code: string,
  path: string,
  message: string
) {
  target.push({ code, path, message });
}

function normalizeLevel(value: unknown): JlptImportLevel | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toUpperCase();
  return LEVEL_SET.has(normalized) ? (normalized as JlptImportLevel) : null;
}

function normalizeSection(value: unknown): JlptImportSection | null {
  if (typeof value !== "string") return null;
  return SECTION_SET.has(value) ? (value as JlptImportSection) : null;
}

function normalizeGenerationMode(
  value: unknown
): JlptImportGenerationMode | null {
  if (value === undefined || value === null) return "fixed";
  if (typeof value !== "string") return null;
  return GENERATION_MODE_SET.has(value)
    ? (value as JlptImportGenerationMode)
    : null;
}

function normalizeSourceType(value: unknown): JlptImportSourceType | null {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string") return null;
  return SOURCE_TYPE_SET.has(value) ? (value as JlptImportSourceType) : null;
}

function emptySectionCounts(): Record<JlptImportSection, number> {
  return {
    vocabulary: 0,
    grammar: 0,
    reading: 0,
    listening: 0,
  };
}

export function normalizeExamAssetPath(value?: string | null) {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/^(https?:|data:|blob:)/i.test(trimmed) || trimmed.startsWith("/")) {
    return null;
  }

  return trimmed.replace(/^\/+/, "").replace(/^exam-assets\//, "");
}

function collectAssetReference(
  references: Map<string, JlptImportAssetReference>,
  value: unknown,
  usage: JlptImportAssetReference["usage"],
  sourcePath: string
) {
  if (typeof value !== "string") return;
  const assetPath = normalizeExamAssetPath(value);
  if (!assetPath) return;

  const key = `${usage}:${assetPath}:${sourcePath}`;
  references.set(key, { path: assetPath, sourcePath, usage });
}

function declaredAssetPaths(value: unknown) {
  const paths = new Set<string>();
  if (!Array.isArray(value)) return paths;

  value.forEach((asset) => {
    if (typeof asset === "string") {
      const normalized = normalizeExamAssetPath(asset);
      if (normalized) paths.add(normalized);
      return;
    }

    if (isRecord(asset)) {
      const normalized = normalizeExamAssetPath(
        typeof asset.path === "string" ? asset.path : null
      );
      if (normalized) paths.add(normalized);
    }
  });

  return paths;
}

function questionOrderFromTemplate(input: {
  generationMode: JlptImportGenerationMode | null;
  rawTemplateQuestions: unknown;
  questionKeys: Set<string>;
  questionCount: number;
  errors: JlptImportValidationIssue[];
  warnings: JlptImportValidationIssue[];
}) {
  if (input.generationMode !== "fixed") return 0;

  if (input.rawTemplateQuestions === undefined) {
    return input.questionCount;
  }

  if (!Array.isArray(input.rawTemplateQuestions)) {
    addIssue(
      input.errors,
      "template_questions_type",
      "templateQuestions",
      "templateQuestions harus berupa array jika disediakan."
    );
    return 0;
  }

  const seenQuestionKeys = new Set<string>();
  const seenPositions = new Set<number>();

  input.rawTemplateQuestions.forEach((item, index) => {
    const path = `templateQuestions[${index}]`;
    if (!isRecord(item)) {
      addIssue(input.errors, "template_question_type", path, "Item harus berupa object.");
      return;
    }

    if (!isNonEmptyString(item.questionKey)) {
      addIssue(
        input.errors,
        "template_question_key_required",
        `${path}.questionKey`,
        "questionKey wajib diisi."
      );
    } else if (!input.questionKeys.has(item.questionKey.trim())) {
      addIssue(
        input.errors,
        "template_question_unknown",
        `${path}.questionKey`,
        `Question key "${item.questionKey}" tidak ditemukan.`
      );
    } else {
      seenQuestionKeys.add(item.questionKey.trim());
    }

    if (!isPositiveInteger(item.position)) {
      addIssue(
        input.errors,
        "template_question_position",
        `${path}.position`,
        "position harus integer positif."
      );
    } else if (seenPositions.has(item.position as number)) {
      addIssue(
        input.errors,
        "template_question_position_duplicate",
        `${path}.position`,
        `position ${item.position} duplikat.`
      );
    } else {
      seenPositions.add(item.position as number);
    }

    if (
      item.sectionOrder !== undefined &&
      !isNonNegativeInteger(item.sectionOrder)
    ) {
      addIssue(
        input.errors,
        "template_question_section_order",
        `${path}.sectionOrder`,
        "sectionOrder harus integer >= 0 jika diisi."
      );
    }
  });

  for (const questionKey of input.questionKeys) {
    if (!seenQuestionKeys.has(questionKey)) {
      addIssue(
        input.errors,
        "template_question_missing",
        "templateQuestions",
        `Question "${questionKey}" belum masuk template fixed.`
      );
    }
  }

  return input.rawTemplateQuestions.length;
}

export function validateJlptImportPackage(
  rawPackage: unknown,
  options: ValidateJlptImportOptions = {}
): JlptImportValidationReport {
  const errors: JlptImportValidationIssue[] = [];
  const warnings: JlptImportValidationIssue[] = [];
  const sectionCounts = emptySectionCounts();
  const assetReferences = new Map<string, JlptImportAssetReference>();
  const missingAssetReferences: JlptImportAssetReference[] = [];

  if (!isRecord(rawPackage)) {
    addIssue(errors, "package_type", "$", "Import package harus berupa object.");
    return {
      ok: false,
      errors,
      warnings,
      summary: {
        templateSlug: null,
        jlptLevel: null,
        generationMode: null,
        totalPassages: 0,
        totalQuestions: 0,
        totalTemplateQuestions: 0,
        sectionCounts,
        assetReferences: [],
        missingAssetReferences,
      },
    };
  }

  const template = isRecord(rawPackage.template) ? rawPackage.template : null;
  const templateSlug = isNonEmptyString(template?.slug)
    ? template.slug.trim()
    : null;
  const templateLevel = normalizeLevel(template?.jlptLevel);
  const generationMode = normalizeGenerationMode(template?.generationMode);

  if (!template) {
    addIssue(errors, "template_required", "template", "template wajib berupa object.");
  } else {
    if (!templateSlug) {
      addIssue(errors, "template_slug_required", "template.slug", "slug wajib diisi.");
    }
    if (!isNonEmptyString(template.title)) {
      addIssue(errors, "template_title_required", "template.title", "title wajib diisi.");
    }
    if (!templateLevel) {
      addIssue(
        errors,
        "template_level_invalid",
        "template.jlptLevel",
        "jlptLevel harus salah satu N5, N4, N3, N2, N1."
      );
    }
    if (!isPositiveInteger(template.timeLimitMinutes)) {
      addIssue(
        errors,
        "template_time_limit_invalid",
        "template.timeLimitMinutes",
        "timeLimitMinutes harus integer positif."
      );
    }
    if (
      template.passingScore !== undefined &&
      !isNonNegativeInteger(template.passingScore)
    ) {
      addIssue(
        errors,
        "template_passing_score_invalid",
        "template.passingScore",
        "passingScore harus integer >= 0 jika diisi."
      );
    }
    if (!generationMode) {
      addIssue(
        errors,
        "template_generation_mode_invalid",
        "template.generationMode",
        "generationMode harus fixed atau random_by_quota."
      );
    }
  }

  const passages = Array.isArray(rawPackage.passages) ? rawPackage.passages : [];
  if (rawPackage.passages !== undefined && !Array.isArray(rawPackage.passages)) {
    addIssue(errors, "passages_type", "passages", "passages harus berupa array.");
  }

  const passageKeys = new Set<string>();
  passages.forEach((passage, index) => {
    const path = `passages[${index}]`;
    if (!isRecord(passage)) {
      addIssue(errors, "passage_type", path, "Passage harus berupa object.");
      return;
    }

    if (!isNonEmptyString(passage.key)) {
      addIssue(errors, "passage_key_required", `${path}.key`, "key wajib diisi.");
    } else {
      const key = passage.key.trim();
      if (passageKeys.has(key)) {
        addIssue(errors, "passage_key_duplicate", `${path}.key`, `key "${key}" duplikat.`);
      }
      passageKeys.add(key);
    }

    const passageLevel = normalizeLevel(passage.jlptLevel) ?? templateLevel;
    if (!passageLevel) {
      addIssue(errors, "passage_level_invalid", `${path}.jlptLevel`, "Passage butuh JLPT level valid.");
    }

    if (!normalizeSection(passage.sessionType)) {
      addIssue(
        errors,
        "passage_session_type_invalid",
        `${path}.sessionType`,
        "sessionType passage tidak valid."
      );
    }

    if (
      passage.mondaiNumber !== undefined &&
      passage.mondaiNumber !== null &&
      !isPositiveInteger(passage.mondaiNumber)
    ) {
      addIssue(
        errors,
        "passage_mondai_number_invalid",
        `${path}.mondaiNumber`,
        "mondaiNumber harus integer positif jika diisi."
      );
    }

    collectAssetReference(assetReferences, passage.audioPath, "passage_audio", `${path}.audioPath`);
    collectAssetReference(assetReferences, passage.visualPath, "passage_visual", `${path}.visualPath`);
  });

  const questions = Array.isArray(rawPackage.questions) ? rawPackage.questions : [];
  if (!Array.isArray(rawPackage.questions)) {
    addIssue(errors, "questions_type", "questions", "questions wajib berupa array.");
  }
  if (questions.length === 0) {
    addIssue(errors, "questions_empty", "questions", "questions wajib berisi minimal satu soal.");
  }

  const questionKeys = new Set<string>();
  questions.forEach((question, index) => {
    const path = `questions[${index}]`;
    if (!isRecord(question)) {
      addIssue(errors, "question_type", path, "Question harus berupa object.");
      return;
    }

    if (!isNonEmptyString(question.key)) {
      addIssue(errors, "question_key_required", `${path}.key`, "key wajib diisi.");
    } else {
      const key = question.key.trim();
      if (questionKeys.has(key)) {
        addIssue(errors, "question_key_duplicate", `${path}.key`, `key "${key}" duplikat.`);
      }
      questionKeys.add(key);
    }

    const level = normalizeLevel(question.jlptLevel) ?? templateLevel;
    if (!level) {
      addIssue(errors, "question_level_invalid", `${path}.jlptLevel`, "Question butuh JLPT level valid.");
    }

    const section = normalizeSection(question.sessionType);
    if (!section) {
      addIssue(errors, "question_session_type_invalid", `${path}.sessionType`, "sessionType tidak valid.");
    } else {
      sectionCounts[section] += 1;
    }

    if (!isPositiveInteger(question.mondaiNumber)) {
      addIssue(
        errors,
        "question_mondai_number_invalid",
        `${path}.mondaiNumber`,
        "mondaiNumber wajib integer positif."
      );
    }

    if (
      question.questionNumber !== undefined &&
      question.questionNumber !== null &&
      !isPositiveInteger(question.questionNumber)
    ) {
      addIssue(
        errors,
        "question_number_invalid",
        `${path}.questionNumber`,
        "questionNumber harus integer positif jika diisi."
      );
    }

    const choices = Array.isArray(question.choices) ? question.choices : [];
    if (!Array.isArray(question.choices) || choices.length < 2) {
      addIssue(errors, "question_choices_min", `${path}.choices`, "choices minimal 2 item.");
    }

    choices.forEach((choice, choiceIndex) => {
      const choicePath = `${path}.choices[${choiceIndex}]`;
      if (!isRecord(choice)) {
        addIssue(errors, "choice_type", choicePath, "Choice harus berupa object.");
        return;
      }

      if (choice.type !== "text" && choice.type !== "image") {
        addIssue(errors, "choice_kind_invalid", `${choicePath}.type`, "Choice type harus text atau image.");
      }
      if (!isNonEmptyString(choice.value)) {
        addIssue(errors, "choice_value_required", `${choicePath}.value`, "Choice value wajib diisi.");
      }
      if (choice.type === "image") {
        collectAssetReference(
          assetReferences,
          choice.value,
          "choice_image",
          `${choicePath}.value`
        );
      }
    });

    if (
      !isNonNegativeInteger(question.correctChoiceIndex) ||
      question.correctChoiceIndex >= choices.length
    ) {
      addIssue(
        errors,
        "question_correct_choice_index_invalid",
        `${path}.correctChoiceIndex`,
        "correctChoiceIndex harus 0-based dan berada dalam range choices."
      );
    }

    if (question.passageKey !== undefined && question.passageKey !== null) {
      if (!isNonEmptyString(question.passageKey)) {
        addIssue(errors, "question_passage_key_empty", `${path}.passageKey`, "passageKey tidak boleh kosong.");
      } else if (!passageKeys.has(question.passageKey.trim())) {
        addIssue(
          errors,
          "question_passage_missing",
          `${path}.passageKey`,
          `Passage "${question.passageKey}" tidak ditemukan.`
        );
      }
    }

    const sourceType = normalizeSourceType(question.sourceType);
    if (question.sourceType !== undefined && question.sourceType !== null && !sourceType) {
      addIssue(
        errors,
        "question_source_type_invalid",
        `${path}.sourceType`,
        "sourceType harus vocab, grammar, kanji, listening, reading, atau custom."
      );
    }
    if (sourceType && !isNonEmptyString(question.sourceId)) {
      addIssue(
        warnings,
        "question_source_id_missing",
        `${path}.sourceId`,
        "sourceType sudah diisi, tetapi sourceId kosong sehingga item tidak masuk SRS."
      );
    }

    const difficulty = question.difficulty;
    if (
      difficulty !== undefined &&
      difficulty !== null &&
      (!isPositiveInteger(difficulty) || difficulty > 5)
    ) {
      addIssue(
        errors,
        "question_difficulty_invalid",
        `${path}.difficulty`,
        "difficulty harus integer 1 sampai 5 jika diisi."
      );
    }

    if (!isNonEmptyString(question.promptHtml) && !question.passageKey) {
      addIssue(
        warnings,
        "question_prompt_empty",
        `${path}.promptHtml`,
        "Question tanpa promptHtml dan tanpa passageKey akan sulit direview."
      );
    }

    collectAssetReference(assetReferences, question.audioPath, "question_audio", `${path}.audioPath`);
    collectAssetReference(assetReferences, question.visualPath, "question_visual", `${path}.visualPath`);
  });

  if (generationMode === "random_by_quota") {
    const quotaConfig = isRecord(template?.quotaConfig) ? template.quotaConfig : null;
    if (!quotaConfig) {
      addIssue(
        errors,
        "quota_config_required",
        "template.quotaConfig",
        "random_by_quota membutuhkan quotaConfig object."
      );
    } else {
      for (const [section, value] of Object.entries(quotaConfig)) {
        if (!SECTION_SET.has(section)) {
          addIssue(errors, "quota_config_section_invalid", `template.quotaConfig.${section}`, "Section quota tidak valid.");
          continue;
        }
        if (!isRecord(value) || !isPositiveInteger(value.total)) {
          addIssue(errors, "quota_config_total_invalid", `template.quotaConfig.${section}.total`, "Quota total harus integer positif.");
          continue;
        }
        if (value.total > sectionCounts[section as JlptImportSection]) {
          addIssue(
            errors,
            "quota_config_insufficient_questions",
            `template.quotaConfig.${section}.total`,
            `Quota ${value.total} melebihi jumlah soal tersedia (${sectionCounts[section as JlptImportSection]}).`
          );
        }
      }
    }
  }

  const totalTemplateQuestions = questionOrderFromTemplate({
    generationMode,
    rawTemplateQuestions: rawPackage.templateQuestions,
    questionKeys,
    questionCount: questions.length,
    errors,
    warnings,
  });

  const declaredAssets = declaredAssetPaths(rawPackage.assets);
  const shouldRequireDeclaredAssets =
    options.requireDeclaredAssets ?? Array.isArray(rawPackage.assets);

  for (const reference of assetReferences.values()) {
    if (shouldRequireDeclaredAssets && !declaredAssets.has(reference.path)) {
      missingAssetReferences.push(reference);
      addIssue(
        errors,
        "asset_not_declared",
        reference.sourcePath,
        `Asset "${reference.path}" belum ada di assets manifest.`
      );
      continue;
    }

    if (options.assetExists && !options.assetExists(reference.path)) {
      missingAssetReferences.push(reference);
      addIssue(
        errors,
        "asset_missing",
        reference.sourcePath,
        `Asset "${reference.path}" tidak ditemukan.`
      );
    }
  }

  const summary: JlptImportValidationSummary = {
    templateSlug,
    jlptLevel: templateLevel,
    generationMode,
    totalPassages: passages.length,
    totalQuestions: questions.length,
    totalTemplateQuestions,
    sectionCounts,
    assetReferences: Array.from(assetReferences.values()),
    missingAssetReferences,
  };

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    summary,
  };
}
