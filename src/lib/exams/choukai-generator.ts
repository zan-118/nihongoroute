import type {
 JlptImportLevel,
 JlptImportPackage,
 JlptImportPassage,
 JlptImportQuestion,
} from "@/lib/exams/import-pipeline";

/**
 * Official JLPT Choukai (listening) question types.
 */
export const CHOUKAI_OFFICIAL_QUESTION_TYPES = [
 "task_comprehension",
 "point_comprehension",
 "summary_comprehension",
 "verbal_expressions",
 "quick_response",
] as const;

/**
 * Union type of official Choukai question types.
 */
export type ChoukaiQuestionType = (typeof CHOUKAI_OFFICIAL_QUESTION_TYPES)[number];

/**
 * Represents a single line of dialogue in a listening script.
 */
export interface ChoukaiDialoguePart {
 /** Speaker identifier (e.g., "narrator", "man", "woman") */
 speaker: string;
 /** Text spoken by the speaker */
 text: string;
}

/**
 * Enhanced question structure containing dialogue and audio metadata.
 */
export interface ChoukaiEnhancedQuestion {
 /** Type of listening question */
 type: ChoukaiQuestionType;
 /** Source category of the question */
 sourceType?: "vocab" | "grammar" | "kanji" | "listening" | "custom" | null;
 /** Reference ID of the source material */
 sourceId?: string | null;
 /** Written prompt HTML if applicable */
 promptHtml: string;
 /** Dialogue structure for TTS generation */
 dialogue: ChoukaiDialoguePart[];
 /** Relative path to the compiled audio file */
 audioPath: string;
 /** List of answer choices */
 choices: readonly string[];
 /** Index of the correct choice */
 correctChoiceIndex: number;
 /** Explanation HTML for the answer */
 explanationHtml?: string | null;
 /** Reference source text */
 sourceReference?: string | null;
}

/**
 * Input parameters for building a Choukai import package.
 */
export interface BuildChoukaiImportPackageInput {
 /** Target JLPT level */
 jlptLevel: JlptImportLevel;
 /** Unique slug for the exam template */
 templateSlug?: string;
 /** Title of the exam package */
 title?: string;
 /** Description of the exam package */
 description?: string | null;
 /** Time limit in minutes */
 timeLimitMinutes?: number;
 /** Passing score threshold */
 passingScore?: number;
 /** Seed for random generation */
 seed?: string | number;
 /** List of enhanced questions to process */
 enhancedQuestions: readonly ChoukaiEnhancedQuestion[];
 /** Publish status flag */
 isPublished?: boolean;
}

/**
 * Statistics for the Choukai package generation process.
 */
export interface ChoukaiGenerationStats {
 /** Total number of successfully generated questions */
 generatedQuestions: number;
 /** Count of generated questions grouped by type */
 generatedByType: Record<ChoukaiQuestionType, number>;
 /** Count of skipped questions grouped by reason */
 skippedByReason: Record<string, number>;
}

/**
 * Result of the Choukai package generation process.
 */
export interface BuildChoukaiImportPackageResult {
 /** Generated import package */
 importPackage: JlptImportPackage;
 /** Generation statistics */
 stats: ChoukaiGenerationStats;
}

/**
 * Mendapatkan mondai_number resmi untuk Choukai berdasarkan Level JLPT dan jenis soal.
 * Referensi sesuai spesifikasi ujian JLPT resmi.
 * 
 * @param level Tingkat JLPT (N5 - N1)
 * @param type Jenis soal Choukai
 * @returns Nomor Mondai (1 - 5)
 */
export function getChoukaiMondaiNumber(
 level: JlptImportLevel,
 type: ChoukaiQuestionType
): number {
 switch (level) {
 case "N5":
 case "N4":
 if (type === "task_comprehension") return 1;
 if (type === "point_comprehension") return 2;
 if (type === "verbal_expressions") return 3;
 if (type === "quick_response") return 4;
 return 1;
 case "N3":
 if (type === "task_comprehension") return 1;
 if (type === "point_comprehension") return 2;
 if (type === "summary_comprehension") return 3;
 if (type === "verbal_expressions") return 4;
 if (type === "quick_response") return 5;
 return 1;
 case "N2":
 case "N1":
 if (type === "task_comprehension") return 1;
 if (type === "point_comprehension") return 2;
 if (type === "summary_comprehension") return 3;
 if (type === "quick_response") return 4;
 // Di level N2/N1, mondai 5 adalah Sogo/Integrated Comprehension (listening)
 if (type === "verbal_expressions") return 4; // Map ke Sokuji jika salah tipe
 return 1;
 default:
 return 1;
 }
}

/**
 * Trims string and returns null if empty.
 * 
 * @param value Value to check
 */
function compactString(value: unknown): string | null {
 if (typeof value !== "string") return null;
 const trimmed = value.trim();
 return trimmed.length > 0 ? trimmed : null;
}

/**
 * Generates a slug token with an appended FNV-1a hash.
 * 
 * @param value Input string
 */
function slugToken(value: string): string {
 // Normalize string for slug
 const normalized = value
 .toLowerCase()
 .replace(/[^a-z0-9]+/g, "-")
 .replace(/^-+|-+$/g, "")
 .slice(0, 50);

 // FNV-1a 32-bit hash algorithm
 let hash = 0x811c9dc5;
 for (let index = 0; index < value.length; index += 1) {
 hash ^= value.charCodeAt(index);
 hash = Math.imul(hash, 0x01000193);
 }
 const hex = (hash >>> 0).toString(16);
 return normalized ? `${normalized}-${hex}` : hex;
}

/**
 * Returns a zeroed counter record for all Choukai question types.
 */
function emptyGeneratedByType(): Record<ChoukaiQuestionType, number> {
 return {
 task_comprehension: 0,
 point_comprehension: 0,
 summary_comprehension: 0,
 verbal_expressions: 0,
 quick_response: 0,
 };
}

/**
 * Membangun paket impor JLPT Choukai dari kumpulan soal yang dihasilkan oleh LLM dan TTS.
 * 
 * @param input Objek parameter input pembangun paket impor Choukai.
 * @returns Hasil paket impor beserta statistik generasinya.
 */
export function buildChoukaiImportPackage(
 input: BuildChoukaiImportPackageInput
): BuildChoukaiImportPackageResult {
 const skippedByReason: Record<string, number> = {};
 const generatedByType = emptyGeneratedByType();
 const passages = new Map<string, JlptImportPassage>();
 const questions: JlptImportQuestion[] = [];
 const seenSignatures = new Set<string>();
 const assets: string[] = [];

 const isPublished = input.isPublished ?? false;

 let qIndex = 0;
 for (const eq of input.enhancedQuestions) {
 qIndex += 1;
 const type = eq.type;
 const promptHtml = compactString(eq.promptHtml) ?? ""; // Beberapa soal choukai tidak punya prompt tertulis
 const audioPath = compactString(eq.audioPath);

 // Skip if audio path is missing
 if (!audioPath) {
 skippedByReason["missing_audio_path"] = (skippedByReason["missing_audio_path"] ?? 0) + 1;
 continue;
 }

 // Skip if choices are insufficient
 const choices = eq.choices.map(compactString).filter((choice): choice is string => Boolean(choice));
 if (choices.length < 2) {
 skippedByReason["insufficient_choices"] = (skippedByReason["insufficient_choices"] ?? 0) + 1;
 continue;
 }

 // Skip if correct choice index is out of bounds
 if (
 !Number.isInteger(eq.correctChoiceIndex) ||
 eq.correctChoiceIndex < 0 ||
 eq.correctChoiceIndex >= choices.length
 ) {
 skippedByReason["invalid_correct_index"] = (skippedByReason["invalid_correct_index"] ?? 0) + 1;
 continue;
 }

 // Gabungan dialog teks untuk signature keunikan
 const fullDialogueText = eq.dialogue.map(d => d.text).join("|");
 const signature = `${type}|${fullDialogueText.slice(0, 100)}|${choices[eq.correctChoiceIndex]}`;
 if (seenSignatures.has(signature)) {
 skippedByReason["duplicate_question"] = (skippedByReason["duplicate_question"] ?? 0) + 1;
 continue;
 }
 seenSignatures.add(signature);

 const mondaiNumber = getChoukaiMondaiNumber(input.jlptLevel, type);
 const pKey = `p-${input.jlptLevel.toLowerCase()}-listening-${type}-${qIndex}`;

 // Buat transkrip HTML dari bagian dialog
 const transcriptHtml = eq.dialogue
 .map(
 (line) =>
 `<p><strong>${line.speaker.toUpperCase()}:</strong> ${line.text}</p>`
 )
 .join("\n");

 // Setiap soal menyimak memilik passage tersendiri sebagai penampung transkrip & audio
 if (!passages.has(pKey)) {
 passages.set(pKey, {
 key: pKey,
 jlptLevel: input.jlptLevel,
 sessionType: "listening",
 mondaiNumber,
 title: `Listening Passage ${qIndex}`,
 transcriptHtml,
 audioPath,
 isPublished,
 });
 }

 // Tambahkan ke assets package
 assets.push(audioPath);

 // Kunci pertanyaan deterministik
 const promptForToken = promptHtml || `listening-${type}-${qIndex}`;
 const questionKey = `q-${input.jlptLevel.toLowerCase()}-listening-${type}-${slugToken(promptForToken.slice(0, 30))}-${qIndex}`;

 questions.push({
 key: questionKey,
 jlptLevel: input.jlptLevel,
 sessionType: "listening",
 mondaiNumber,
 passageKey: pKey,
 promptHtml: promptHtml || "<p>聞いて答えてください。</p>",
 audioPath, // Sediakan audio di level soal juga untuk kemudahan render
 choices: choices.map((c) => ({ type: "text", value: c })),
 correctChoiceIndex: eq.correctChoiceIndex,
 explanationHtml: compactString(eq.explanationHtml),
 difficulty: input.jlptLevel === "N5" ? 1 : input.jlptLevel === "N4" ? 2 : input.jlptLevel === "N3" ? 3 : input.jlptLevel === "N2" ? 4 : 5,
 sourceType: eq.sourceType ?? "listening",
 sourceId: eq.sourceId ?? pKey,
 sourceReference: compactString(eq.sourceReference) ?? `Listening Comprehension ${type}`,
 isPublished,
 });

 generatedByType[type] += 1;
 }

 // Menugaskan nomor pertanyaan berurutan per mondaiNumber
 const mondaiCounters = new Map<number, number>();
 const numberedQuestions = questions.map((q) => {
 const nextNum = (mondaiCounters.get(q.mondaiNumber) ?? 0) + 1;
 mondaiCounters.set(q.mondaiNumber, nextNum);
 return {
 ...q,
 questionNumber: nextNum,
 };
 });

 const templateSlug = input.templateSlug ?? `jlpt-${input.jlptLevel.toLowerCase()}-listening-draft`;
 const timeLimitMinutes = input.timeLimitMinutes ?? Math.max(25, Math.ceil(numberedQuestions.length * 2.0));

 const importPackage: JlptImportPackage = {
 template: {
 slug: templateSlug,
 title: input.title ?? `JLPT ${input.jlptLevel} Listening Draft`,
 description: input.description ?? `Latihan soal JLPT ${input.jlptLevel} Listening (Choukai) untuk menguji kemampuan menyimak.`,
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
 sectionOrder: 3, // MojiGoi=0, Bunpou=1, Reading/Dokkai=2, Listening/Choukai=3
 })),
 assets: Array.from(new Set(assets)).map((path) => ({
 path,
 localPath: `assets/${path}`, // Folder assets lokal relatif terhadap output JSON
 })),
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