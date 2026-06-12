import type {
  JlptImportLevel,
  JlptImportPackage,
  JlptImportPassage,
  JlptImportQuestion,
} from "@/lib/exams/import-pipeline";

export const CHOUKAI_OFFICIAL_QUESTION_TYPES = [
  "task_comprehension",
  "point_comprehension",
  "summary_comprehension",
  "verbal_expressions",
  "quick_response",
] as const;

export type ChoukaiQuestionType = (typeof CHOUKAI_OFFICIAL_QUESTION_TYPES)[number];

export interface ChoukaiDialoguePart {
  speaker: string; // e.g., "narrator", "man", "woman"
  text: string;
}

export interface ChoukaiEnhancedQuestion {
  type: ChoukaiQuestionType;
  sourceType?: "vocab" | "grammar" | "kanji" | "listening" | "custom" | null;
  sourceId?: string | null;
  promptHtml: string; // Pertanyaan tertulis (jika ada, e.g., Kadai/Point Rikai) atau kosong
  dialogue: ChoukaiDialoguePart[]; // Struktur dialog untuk TTS
  audioPath: string; // Path relatif audio file hasil kompilasi
  choices: readonly string[]; // Pilihan jawaban (bisa teks pilihan, gambar, atau sekadar angka "1", "2", "3", "4")
  correctChoiceIndex: number;
  explanationHtml?: string | null;
  sourceReference?: string | null;
}

export interface BuildChoukaiImportPackageInput {
  jlptLevel: JlptImportLevel;
  templateSlug?: string;
  title?: string;
  description?: string | null;
  timeLimitMinutes?: number;
  passingScore?: number;
  seed?: string | number;
  enhancedQuestions: readonly ChoukaiEnhancedQuestion[];
  isPublished?: boolean;
}

export interface ChoukaiGenerationStats {
  generatedQuestions: number;
  generatedByType: Record<ChoukaiQuestionType, number>;
  skippedByReason: Record<string, number>;
}

export interface BuildChoukaiImportPackageResult {
  importPackage: JlptImportPackage;
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

function compactString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function slugToken(value: string): string {
  const normalized = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);

  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  const hex = (hash >>> 0).toString(16);
  return normalized ? `${normalized}-${hex}` : hex;
}

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

    if (!audioPath) {
      skippedByReason["missing_audio_path"] = (skippedByReason["missing_audio_path"] ?? 0) + 1;
      continue;
    }

    const choices = eq.choices.map(compactString).filter((choice): choice is string => Boolean(choice));
    if (choices.length < 2) {
      skippedByReason["insufficient_choices"] = (skippedByReason["insufficient_choices"] ?? 0) + 1;
      continue;
    }

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
