import type { Json, TablesInsert } from "@/types/supabase.generated";

/** Valid JLPT levels. */
export const JLPT_IMPORT_LEVELS = ["N5", "N4", "N3", "N2", "N1"] as const;

/** Valid exam sections. */
export const JLPT_IMPORT_SECTIONS = [
 "vocabulary",
 "grammar",
 "reading",
 "listening",
] as const;

/** Valid question source types. */
export const JLPT_IMPORT_SOURCE_TYPES = [
 "vocab",
 "grammar",
 "kanji",
 "listening",
 "reading",
 "custom",
] as const;

/** Valid exam generation modes. */
export const JLPT_IMPORT_GENERATION_MODES = [
 "fixed",
 "random_by_quota",
] as const;

/** JLPT level type. */
export type JlptImportLevel = (typeof JLPT_IMPORT_LEVELS)[number];

/** Exam section type. */
export type JlptImportSection = (typeof JLPT_IMPORT_SECTIONS)[number];

/** Question source type. */
export type JlptImportSourceType = (typeof JLPT_IMPORT_SOURCE_TYPES)[number];

/** Exam generation mode type. */
export type JlptImportGenerationMode =
 (typeof JLPT_IMPORT_GENERATION_MODES)[number];

/** Choice structure for question. */
export interface JlptImportChoice {
 type: "text" | "image";
 value: string;
 alt?: string | null;
}

/** Exam template metadata. */
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

/** Reading/listening passage data. */
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

/** Exam question data. */
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

/** Link between template and question. */
export interface JlptImportTemplateQuestion {
 questionKey: string;
 position: number;
 sectionOrder?: number;
}

/** Asset file metadata. */
export interface JlptImportAsset {
 path: string;
 localPath?: string | null;
 mimeType?: string | null;
}

/** Full import payload. */
export interface JlptImportPackage {
 template: JlptImportTemplate;
 passages?: JlptImportPassage[];
 questions: JlptImportQuestion[];
 templateQuestions?: JlptImportTemplateQuestion[];
 assets?: Array<string | JlptImportAsset>;
}

/** Validation error or warning. */
export interface JlptImportValidationIssue {
 code: string;
 path: string;
 message: string;
}

/** Asset usage reference. */
export interface JlptImportAssetReference {
 path: string;
 sourcePath: string;
 usage: "passage_audio" | "passage_visual" | "question_audio" | "question_visual" | "choice_image";
}

/** Validation run summary. */
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

/** Validation result report. */
export interface JlptImportValidationReport {
 ok: boolean;
 errors: JlptImportValidationIssue[];
 warnings: JlptImportValidationIssue[];
 summary: JlptImportValidationSummary;
}

/** Asset planned for import. */
export interface JlptImportPlanAsset {
 path: string;
 localPath?: string | null;
 mimeType?: string | null;
 referenced: boolean;
 usages: JlptImportAssetReference["usage"][];
}

/** Database rows to insert. */
export interface JlptImportRows {
 template: TablesInsert<"jlpt_exam_templates">;
 passages: TablesInsert<"jlpt_passages">[];
 questions: TablesInsert<"jlpt_questions">[];
 templateQuestions: TablesInsert<"jlpt_exam_template_questions">[];
}

/** Execution plan for import. */
export interface JlptImportPlan {
 validation: JlptImportValidationReport;
 rows: JlptImportRows;
 assets: JlptImportPlanAsset[];
 keyMap: {
 templateId: string;
 passageIds: Record<string, string>;
 questionIds: Record<string, string>;
 };
}

/** Validation options. */
export interface ValidateJlptImportOptions {
 assetExists?: (assetPath: string) => boolean;
 requireDeclaredAssets?: boolean;
}

const LEVEL_SET = new Set<string>(JLPT_IMPORT_LEVELS);
const SECTION_SET = new Set<string>(JLPT_IMPORT_SECTIONS);
const SOURCE_TYPE_SET = new Set<string>(JLPT_IMPORT_SOURCE_TYPES);
const GENERATION_MODE_SET = new Set<string>(JLPT_IMPORT_GENERATION_MODES);
const SECTION_ORDER: Record<JlptImportSection, number> = {
 vocabulary: 0,
 grammar: 1,
 reading: 2,
 listening: 3,
};

/** Check if value is non-null object. */
function isRecord(value: unknown): value is Record<string, unknown> {
 return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Check if value is non-empty string. */
function isNonEmptyString(value: unknown): value is string {
 return typeof value === "string" && value.trim().length > 0;
}

/** Check if value is integer > 0. */
function isPositiveInteger(value: unknown): value is number {
 return Number.isInteger(value) && Number(value) > 0;
}

/** Check if value is integer >= 0. */
function isNonNegativeInteger(value: unknown): value is number {
 return Number.isInteger(value) && Number(value) >= 0;
}

/** Add validation issue to list. */
function addIssue(
 target: JlptImportValidationIssue[],
 code: string,
 path: string,
 message: string
) {
 target.push({ code, path, message });
}

/** Generate 32-bit FNV-1a hash. */
function stableHash32(value: string, seed: number) {
 let hash = seed >>> 0;
 for (let index = 0; index < value.length; index += 1) {
 hash ^= value.charCodeAt(index);
 hash = Math.imul(hash, 16777619);
 }
 return (hash >>> 0).toString(16).padStart(8, "0");
}

/** Generate UUID v5 from scope and key. */
export function createDeterministicUuid(scope: string, key: string) {
 const input = `${scope}:${key}`;
 // FNV-1a hash blocks. Combine to 128-bit hex.
 const hex = [
 stableHash32(input, 0x811c9dc5),
 stableHash32(input, 0x9e3779b9),
 stableHash32(input, 0x85ebca6b),
 stableHash32(input, 0xc2b2ae35),
 ].join("");
 const chars = hex.split("");

 // Set UUID version 5.
 chars[12] = "5";
 // Set UUID variant RFC 4122.
 chars[16] = ((Number.parseInt(chars[16], 16) & 0x3) | 0x8).toString(16);

 // Format as 8-4-4-4-12 hex string.
 return [
 chars.slice(0, 8).join(""),
 chars.slice(8, 12).join(""),
 chars.slice(12, 16).join(""),
 chars.slice(16, 20).join(""),
 chars.slice(20, 32).join(""),
 ].join("-");
}

/** Normalize string to JLPT level. */
function normalizeLevel(value: unknown): JlptImportLevel | null {
 if (typeof value !== "string") return null;
 const normalized = value.trim().toUpperCase();
 return LEVEL_SET.has(normalized) ? (normalized as JlptImportLevel) : null;
}

/** Normalize string to exam section. */
function normalizeSection(value: unknown): JlptImportSection | null {
 if (typeof value !== "string") return null;
 return SECTION_SET.has(value) ? (value as JlptImportSection) : null;
}

/** Normalize string to generation mode. */
function normalizeGenerationMode(
 value: unknown
): JlptImportGenerationMode | null {
 if (value === undefined || value === null) return "fixed";
 if (typeof value !== "string") return null;
 return GENERATION_MODE_SET.has(value)
 ? (value as JlptImportGenerationMode)
 : null;
}

/** Normalize string to source type. */
function normalizeSourceType(value: unknown): JlptImportSourceType | null {
 if (value === undefined || value === null || value === "") return null;
 if (typeof value !== "string") return null;
 return SOURCE_TYPE_SET.has(value) ? (value as JlptImportSourceType) : null;
}

/** Get empty section count map. */
function emptySectionCounts(): Record<JlptImportSection, number> {
 return {
 vocabulary: 0,
 grammar: 0,
 reading: 0,
 listening: 0,
 };
}

/** Clean asset path. Remove protocol, leading slash, prefix. */
export function normalizeExamAssetPath(value?: string | null) {
 if (!value) return null;
 const trimmed = value.trim();
 if (!trimmed) return null;
 // Skip absolute URLs, data URIs, absolute paths.
 if (/^(https?:|data:|blob:)/i.test(trimmed) || trimmed.startsWith("/")) {
 return null;
 }

 // Strip leading slashes and exam-assets prefix.
 return trimmed.replace(/^\/+/, "").replace(/^exam-assets\//, "");
}

/** Extract and store asset reference. */
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

/** Get set of declared asset paths. */
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

/** Get map of declared asset records. */
function declaredAssetRecords(value: unknown) {
 const assets = new Map<string, Pick<JlptImportPlanAsset, "path" | "localPath" | "mimeType">>();
 if (!Array.isArray(value)) return assets;

 value.forEach((asset) => {
 if (typeof asset === "string") {
 const normalized = normalizeExamAssetPath(asset);
 if (normalized) assets.set(normalized, { path: normalized });
 return;
 }

 if (!isRecord(asset)) return;

 const normalized = normalizeExamAssetPath(
 typeof asset.path === "string" ? asset.path : null
 );
 if (!normalized) return;

 assets.set(normalized, {
 path: normalized,
 localPath: typeof asset.localPath === "string" ? asset.localPath : null,
 mimeType: typeof asset.mimeType === "string" ? asset.mimeType : null,
 });
 });

 return assets;
}

/** Validate and count template questions. */
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

/** Validate import package structure and values. */
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

 // Validate template metadata.
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

 // Validate passages.
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

 // Validate questions.
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

 // Validate choices.
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

 // Validate quota config for random mode.
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

 // Validate assets.
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

/** Trim string. Return null if empty. */
function compactNullableString(value: string | null | undefined) {
 if (typeof value !== "string") return null;
 const trimmed = value.trim();
 return trimmed.length > 0 ? trimmed : null;
}

/** Normalize asset path. Fallback to original. */
function assetPathOrOriginal(value: string | null | undefined) {
 return normalizeExamAssetPath(value) ?? compactNullableString(value);
}

/** Build template question rows. */
function buildTemplateQuestions(
 inputPackage: JlptImportPackage,
 templateId: string,
 questionIds: Record<string, string>
): TablesInsert<"jlpt_exam_template_questions">[] {
 if (inputPackage.template.generationMode === "random_by_quota") return [];

 if (inputPackage.templateQuestions?.length) {
 return inputPackage.templateQuestions.map((item) => ({
 template_id: templateId,
 question_id: questionIds[item.questionKey],
 position: item.position,
 section_order: item.sectionOrder ?? 0,
 }));
 }

 return inputPackage.questions.map((question, index) => ({
 template_id: templateId,
 question_id: questionIds[question.key],
 position: index + 1,
 section_order: SECTION_ORDER[question.sessionType],
 }));
}

/** Build plan asset list. */
function buildPlanAssets(
 inputPackage: JlptImportPackage,
 validation: JlptImportValidationReport
): JlptImportPlanAsset[] {
 const assets = declaredAssetRecords(inputPackage.assets);

 for (const reference of validation.summary.assetReferences) {
 const existing = assets.get(reference.path);
 if (existing) continue;

 assets.set(reference.path, {
 path: reference.path,
 localPath: null,
 mimeType: null,
 });
 }

 return Array.from(assets.values())
 .map((asset) => {
 const usages = Array.from(
 new Set(
 validation.summary.assetReferences
 .filter((reference) => reference.path === asset.path)
 .map((reference) => reference.usage)
 )
 );

 return {
 path: asset.path,
 localPath: asset.localPath ?? null,
 mimeType: asset.mimeType ?? null,
 referenced: usages.length > 0,
 usages,
 };
 })
 .sort((a, b) => a.path.localeCompare(b.path));
}

/** Build database rows and assets from package. */
export function buildJlptImportPlan(
 inputPackage: JlptImportPackage,
 options: ValidateJlptImportOptions = {}
): JlptImportPlan {
 const validation = validateJlptImportPackage(inputPackage, options);

 if (!validation.ok) {
 throw new Error(
 `JLPT import package is invalid: ${validation.errors
 .map((error) => `${error.path} ${error.message}`)
 .join("; ")}`
 );
 }

 // Generate deterministic IDs.
 const templateId = createDeterministicUuid(
 "jlpt-template",
 inputPackage.template.slug
 );
 const templateLevel = validation.summary.jlptLevel ?? inputPackage.template.jlptLevel;
 const generationMode =
 validation.summary.generationMode ??
 inputPackage.template.generationMode ??
 "fixed";
 const passageIds = Object.fromEntries(
 (inputPackage.passages ?? []).map((passage) => [
 passage.key,
 createDeterministicUuid(
 `jlpt-passage:${inputPackage.template.slug}`,
 passage.key
 ),
 ])
 );
 const questionIds = Object.fromEntries(
 inputPackage.questions.map((question) => [
 question.key,
 createDeterministicUuid(
 `jlpt-question:${inputPackage.template.slug}`,
 question.key
 ),
 ])
 );

 // Build template row.
 const template: TablesInsert<"jlpt_exam_templates"> = {
 id: templateId,
 slug: inputPackage.template.slug,
 title: inputPackage.template.title,
 description: inputPackage.template.description ?? null,
 jlpt_level: templateLevel,
 time_limit_minutes: inputPackage.template.timeLimitMinutes,
 passing_score: inputPackage.template.passingScore ?? 90,
 is_published: inputPackage.template.isPublished ?? false,
 generation_mode: generationMode,
 quota_config: (inputPackage.template.quotaConfig ?? {}) as Json,
 category_id: inputPackage.template.categoryId ?? null,
 legacy_sanity_id: inputPackage.template.legacySanityId ?? null,
 };

 // Build passage rows.
 const passages: TablesInsert<"jlpt_passages">[] = (inputPackage.passages ?? []).map(
 (passage) => ({
 id: passageIds[passage.key],
 jlpt_level: passage.jlptLevel ?? templateLevel,
 session_type: passage.sessionType,
 mondai_number: passage.mondaiNumber ?? null,
 title: passage.title ?? null,
 content_html: passage.contentHtml ?? null,
 transcript_html: passage.transcriptHtml ?? null,
 audio_path: assetPathOrOriginal(passage.audioPath),
 visual_path: assetPathOrOriginal(passage.visualPath),
 source_label: passage.sourceLabel ?? null,
 is_published: passage.isPublished ?? inputPackage.template.isPublished ?? false,
 })
 );

 // Build question rows.
 const questions: TablesInsert<"jlpt_questions">[] = inputPackage.questions.map(
 (question) => ({
 id: questionIds[question.key],
 jlpt_level: question.jlptLevel ?? templateLevel,
 session_type: question.sessionType,
 mondai_number: question.mondaiNumber,
 question_number: question.questionNumber ?? null,
 passage_id: question.passageKey ? passageIds[question.passageKey] : null,
 prompt_html: question.promptHtml ?? null,
 visual_path: assetPathOrOriginal(question.visualPath),
 audio_path: assetPathOrOriginal(question.audioPath),
 choices: question.choices.map((choice) => ({
 type: choice.type,
 value:
 choice.type === "image"
 ? (assetPathOrOriginal(choice.value) ?? choice.value)
 : choice.value,
 ...(choice.alt !== undefined ? { alt: choice.alt } : {}),
 })) as Json,
 correct_choice_index: question.correctChoiceIndex,
 explanation_html: question.explanationHtml ?? null,
 difficulty: question.difficulty ?? null,
 source_type: question.sourceType ?? null,
 source_id: question.sourceId ?? null,
 source_reference: question.sourceReference ?? null,
 is_published: question.isPublished ?? inputPackage.template.isPublished ?? false,
 })
 );

 return {
 validation,
 rows: {
 template,
 passages,
 questions,
 templateQuestions: buildTemplateQuestions(inputPackage, templateId, questionIds),
 },
 assets: buildPlanAssets(inputPackage, validation),
 keyMap: {
 templateId,
 passageIds,
 questionIds,
 },
 };
}