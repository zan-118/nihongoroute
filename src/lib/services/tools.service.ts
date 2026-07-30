
import { createStaticClient } from "@/lib/supabase/server";
import {
  MINI_DRILL_BANK,
  type DrillKind,
  type DrillLevel,
  type MiniDrillQuestion,
} from "@/lib/jlpt-mini-drill";
import {
  COUNTER_QUESTIONS,
  type CounterQuestion,
  type CounterWord,
} from "@/lib/counter-trainer";
import {
  SHADOWING_PRESETS,
  type ShadowingPreset,
} from "@/lib/shadowing-recorder";

/**
 * Valid JLPT levels for mini drills.
 */
const JLPT_LEVELS = ["N5", "N4", "N3", "N2", "N1"] as const;

/**
 * Valid JLPT levels for counter trainer.
 */
const COUNTER_LEVELS = ["N5", "N4"] as const;

/**
 * Valid JLPT levels for shadowing recorder.
 */
const SHADOWING_LEVELS = ["N5", "N4", "N3"] as const;

/**
 * Database row structure for vocabulary.
 */
interface VocabToolRow {
  id: string;
  word: string | null;
  furigana: string | null;
  meaning_id: string | null;
  jlpt_level: string | null;
  slug: string | null;
  hinshi?: string[] | string | null;
}

/**
 * Database row structure for kanji.
 */
interface KanjiToolRow {
  id: string;
  character: string | null;
  meaning: string | null;
  onyomi: string | null;
  kunyomi: string | null;
  jlpt_level: string | null;
  slug: string | null;
}

/**
 * Database row structure for grammar.
 */
interface GrammarToolRow {
  id: string;
  title: string | null;
  meaning: string | null;
  formation: string | null;
  slug: string | null;
  jlpt_level: string | null;
}

/**
 * Source types for integration tools.
 */
type ToolsSource = "vocab" | "kanji" | "grammar" | "reading" | "listening";

/**
 * Context parameters for filtering integration data.
 */
export interface ToolsIntegrationContext {
  level?: string;
  kind?: DrillKind | "mixed" | string;
  source?: ToolsSource | string;
  slug?: string;
}

/**
 * Text content extracted from library sources.
 */
export interface ToolSourceText {
  title?: string;
  text: string;
  sourceHref?: string;
}

/**
 * Raw data structure from database.
 */
interface LibraryLineSource {
  _id: string;
  title?: string;
  slug?: string;
  jlpt_level?: string;
  difficulty?: string;
  body?: unknown;
  translation?: unknown;
}

/**
 * Combined integration data payload.
 */
export interface ToolsIntegrationData {
  miniDrillQuestions: MiniDrillQuestion[];
  counterQuestions: CounterQuestion[];
  shadowingPresets: ShadowingPreset[];
  stats: {
    miniDrillDatabaseCount: number;
    counterDatabaseCount: number;
    shadowingLibraryCount: number;
  };
}

/**
 * Cast string to DrillLevel. Fallback to N5.
 */
function asDrillLevel(value: string | null | undefined): DrillLevel {
  const upper = String(value || "N5").toUpperCase();
  return JLPT_LEVELS.includes(upper as DrillLevel) ? (upper as DrillLevel) : "N5";
}

/**
 * Get DrillLevel filter if valid.
 */
function getDrillLevelFilter(value: string | null | undefined): DrillLevel | undefined {
  const upper = String(value || "").toUpperCase();
  return JLPT_LEVELS.includes(upper as DrillLevel) ? (upper as DrillLevel) : undefined;
}

/**
 * Get DrillKind filter if valid.
 */
function getDrillKindFilter(value: string | null | undefined): DrillKind | undefined {
  const normalized = String(value || "").toLowerCase();
  return ["vocab", "kanji", "grammar", "sentence"].includes(normalized)
    ? (normalized as DrillKind)
    : undefined;
}

/**
 * Get ToolsSource filter if valid.
 */
function getToolsSource(value: string | null | undefined): ToolsSource | undefined {
  const normalized = String(value || "").toLowerCase();
  return ["vocab", "kanji", "grammar", "reading", "listening"].includes(normalized)
    ? (normalized as ToolsSource)
    : undefined;
}

/**
 * Cast string to Counter level. Fallback to N4.
 */
function asCounterLevel(value: string | null | undefined): "N5" | "N4" {
  const upper = String(value || "N5").toUpperCase();
  return COUNTER_LEVELS.includes(upper as "N5" | "N4") ? (upper as "N5" | "N4") : "N4";
}

/**
 * Cast string to Shadowing level. Fallback to N3.
 */
function asShadowingLevel(value: string | null | undefined): "N5" | "N4" | "N3" {
  const upper = String(value || "N5").toUpperCase();
  return SHADOWING_LEVELS.includes(upper as "N5" | "N4" | "N3")
    ? (upper as "N5" | "N4" | "N3")
    : "N3";
}

/**
 * Normalize whitespace and trim string.
 */
function compactText(value: unknown) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Extract plain text from Rich Text structure.
 */
function textFromPortable(value: unknown): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    // Parse blocks and children arrays from Portable Text JSON.
    return value
      .map((block) => {
        if (typeof block === "string") return block;
        if (!block || typeof block !== "object") return "";
        const record = block as { text?: unknown; children?: unknown[] };
        if (typeof record.text === "string") return record.text;
        if (!Array.isArray(record.children)) return "";
        return record.children
          .map((child) => {
            if (typeof child === "string") return child;
            if (!child || typeof child !== "object") return "";
            return typeof (child as { text?: unknown }).text === "string"
              ? String((child as { text?: unknown }).text)
              : "";
          })
          .join("");
      })
      .filter(Boolean)
      .join("\n");
  }

  if (typeof value === "object" && typeof (value as { text?: unknown }).text === "string") {
    return String((value as { text?: unknown }).text);
  }

  return "";
}

/**
 * Filter unique non-empty trimmed strings.
 */
function uniqueValues(values: string[]) {
  return Array.from(new Set(values.map((value) => compactText(value)).filter(Boolean)));
}

/**
 * Deduplicate rows by id property.
 */
function uniqueRowsById<T extends { id: string }>(rows: T[]) {
  return Array.from(new Map(rows.map((row) => [row.id, row])).values());
}

/**
 * Safely decode URI component. Fallback to raw string on error.
 */
function safeDecodeHref(value: string | undefined) {
  if (!value) return "";
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

/**
 * Check if source URL matches target slug.
 */
function sourceHrefMatches(sourceHref: string | undefined, slug: string | undefined) {
  const target = compactText(slug);
  if (!sourceHref || !target) return false;
  return safeDecodeHref(sourceHref).endsWith(`/${target}`);
}

/**
 * Sort questions prioritizing matches with context slug, kind, and level.
 */
function sortMiniDrillByContext(
  questions: MiniDrillQuestion[],
  context: ToolsIntegrationContext
) {
  const levelFilter = getDrillLevelFilter(context.level);
  const kindFilter = getDrillKindFilter(context.kind);
  const slug = compactText(context.slug);

  return [...questions].sort((a, b) => {
    // Calculate rank score. Lower score means higher priority.
    const aRank =
      (sourceHrefMatches(a.sourceHref, slug) ? 0 : 8) +
      (kindFilter && a.kind === kindFilter ? 0 : 2) +
      (levelFilter && a.level === levelFilter ? 0 : 1);
    const bRank =
      (sourceHrefMatches(b.sourceHref, slug) ? 0 : 8) +
      (kindFilter && b.kind === kindFilter ? 0 : 2) +
      (levelFilter && b.level === levelFilter ? 0 : 1);
    return aRank - bRank;
  });
}

import { generateAdaptiveDistractors } from "@/lib/services/practice-session-engine";

/**
 * Build multiple choice options with distractors using PracticeSessionEngine.
 */
function buildOptions(answer: string, candidates: string[], seed: string) {
  const selected = generateAdaptiveDistractors<string>({
    target: answer,
    candidatePool: uniqueValues(candidates),
    getKey: (item) => item,
    count: 3,
  });
  return shuffleBySeed(uniqueValues([answer, ...selected]), `${seed}-options`);
}

/**
 * Shuffle array deterministically using string seed.
 */
function shuffleBySeed<T>(items: T[], seed: string) {
  const next = [...items];
  let state = Array.from(seed).reduce((total, char) => total + char.charCodeAt(0), 0) || 1;

  // Linear Congruential Generator for deterministic shuffle.
  for (let index = next.length - 1; index > 0; index--) {
    state = (state * 9301 + 49297) % 233280;
    const swapIndex = state % (index + 1);
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }

  return next;
}

/**
 * Split Japanese text into clean sentences.
 */
function splitJapaneseLines(text: string) {
  return text
    .split(/\r?\n|(?<=[。！？!?])/)
    .map((line) => line.replace(/^[^:：]{1,16}[:：]\s*/, "").trim())
    .filter((line) => /[\u3040-\u30ff\u3400-\u9fff]/.test(line))
    .filter((line) => line.length >= 6)
    .slice(0, 24);
}

/**
 * Split translation text into clean sentences.
 */
function splitTranslationLines(text: string | undefined) {
  return String(text || "")
    .split(/\r?\n|(?<=[.!?。！？])/)
    .map((line) => line.replace(/^[^:：]{1,24}[:：]\s*/, "").trim())
    .filter(Boolean);
}

/**
 * Split sentence into smaller chunks for shadowing display.
 */
function createShadowingChunks(text: string) {
  const chunks = text
    .replace(/[。！？!?]$/g, "")
    .split(/[、,]/)
    .map((chunk) => chunk.trim())
    .filter(Boolean);

  if (chunks.length > 1) return chunks.slice(0, 4);

  // Fallback to splitting in half if no punctuation found.
  const midpoint = Math.ceil(text.length / 2);
  return [text.slice(0, midpoint), text.slice(midpoint)].map((chunk) => chunk.trim()).filter(Boolean);
}

/**
 * Parse library source item and push generated presets to array.
 */
function pushShadowingPresetsFromSource(
  presets: ShadowingPreset[],
  item: LibraryLineSource,
  sourceType: "reading" | "listening",
  maxLines = 2
) {
  const lines = splitJapaneseLines(textFromPortable(item.body));
  const translations = splitTranslationLines(textFromPortable(item.translation));

  lines.slice(0, maxLines).forEach((line, index) => {
    presets.push({
      id: `library-${sourceType}-${item._id}-${index}`,
      level: asShadowingLevel(item.jlpt_level),
      title: item.title ? `${item.title} #${index + 1}` : `${sourceType} #${index + 1}`,
      text: line,
      translation: translations[index] || item.title || `Dari materi ${sourceType} library.`,
      focus: sourceType === "listening" ? "listening line" : "reading aloud",
      targetSeconds: estimateTargetSeconds(line),
      chunks: createShadowingChunks(line),
      sourceHref: item.slug ? `/library/${sourceType}/${item.slug}` : undefined,
      sourceTitle: item.title,
      sourceType,
    });
  });
}

/**
 * Estimate target duration in seconds based on character length.
 */
function estimateTargetSeconds(text: string) {
  return Math.max(3, Math.min(14, Math.round(text.length / 4)));
}

/**
 * Detect counter category and metadata based on kanji characters in word.
 */
function detectCounter(word: string): { answer: CounterWord; category: string; hint: string; explanation: string } | null {
  if (/[人者員生師友客母父兄姉弟妹子]/.test(word)) {
    return {
      answer: "人",
      category: "orang",
      hint: "Dipakai untuk menghitung orang.",
      explanation: "人 adalah counter utama untuk orang. Bacaan bisa berubah pada angka tertentu seperti 一人 dan 二人.",
    };
  }
  if (/[本書冊辞典雑誌]/.test(word)) {
    return {
      answer: "冊",
      category: "buku/jilid",
      hint: "Untuk buku atau benda berjilid.",
      explanation: "冊 dipakai untuk buku, majalah, manga, kamus, dan benda berjilid.",
    };
  }
  if (/[本瓶傘鉛筆線道木]/.test(word)) {
    return {
      answer: "本",
      category: "benda panjang",
      hint: "Untuk benda panjang atau silinder.",
      explanation: "本 menghitung benda panjang seperti botol, pensil, payung, batang, dan jalur.",
    };
  }
  if (/[紙券皿写真服枚]/.test(word)) {
    return {
      answer: "枚",
      category: "benda tipis",
      hint: "Untuk benda tipis dan datar.",
      explanation: "枚 cocok untuk kertas, tiket, foto, piring, dan pakaian yang dihitung sebagai lembaran.",
    };
  }
  if (/[猫犬魚鳥虫馬]/.test(word)) {
    return {
      answer: "匹",
      category: "hewan kecil",
      hint: "Untuk banyak hewan kecil.",
      explanation: "匹 umum untuk hewan kecil. Untuk burung besar atau hewan besar, counter bisa berbeda.",
    };
  }
  if (/[車機電脳カメラテレビ]/.test(word)) {
    return {
      answer: "台",
      category: "mesin/kendaraan",
      hint: "Untuk kendaraan dan mesin.",
      explanation: "台 menghitung kendaraan, komputer, kamera, mesin, dan perangkat elektronik besar.",
    };
  }
  if (/[茶水酒汁杯]/.test(word)) {
    return {
      answer: "杯",
      category: "minuman",
      hint: "Untuk isi gelas, cangkir, atau mangkuk.",
      explanation: "杯 menghitung minuman atau cairan dalam wadah, seperti teh, kopi, air, atau sup.",
    };
  }

  return null;
}

/**
 * Fetch and build mini drill questions from database.
 */
export async function getIntegratedMiniDrillQuestions(
  context: ToolsIntegrationContext = {}
): Promise<MiniDrillQuestion[]> {
  const supabase = createStaticClient();
  const levelFilter = getDrillLevelFilter(context.level);
  const kindFilter = getDrillKindFilter(context.kind);
  const source = getToolsSource(context.source);
  const slug = compactText(context.slug);

  try {
    const vocabQuery = supabase
      .from("vocab")
      .select("id, word, furigana, meaning_id, jlpt_level, slug, hinshi")
      .not("word", "is", null);
    const kanjiQuery = supabase
      .from("kanji")
      .select("id, character, meaning, onyomi, kunyomi, jlpt_level, slug")
      .not("character", "is", null);
    const grammarQuery = supabase
      .from("grammar")
      .select("id, title, meaning, formation, slug, jlpt_level")
      .not("title", "is", null);

    // Fetch general pool items.
    const [vocabResult, kanjiResult, grammarResult] = await Promise.allSettled([
      kindFilter && kindFilter !== "vocab"
        ? Promise.resolve({ data: [], error: null })
        : levelFilter
          ? vocabQuery.eq("jlpt_level", levelFilter).limit(60)
          : vocabQuery.limit(60),
      kindFilter && kindFilter !== "kanji"
        ? Promise.resolve({ data: [], error: null })
        : levelFilter
          ? kanjiQuery.eq("jlpt_level", levelFilter).limit(60)
          : kanjiQuery.limit(60),
      kindFilter && kindFilter !== "grammar"
        ? Promise.resolve({ data: [], error: null })
        : levelFilter
          ? grammarQuery.eq("jlpt_level", levelFilter).limit(60)
          : grammarQuery.limit(60),
    ]);

    // Fetch exact match item based on slug context.
    const [exactVocabResult, exactKanjiResult, exactGrammarResult] = await Promise.allSettled([
      source === "vocab" && slug
        ? supabase
            .from("vocab")
            .select("id, word, furigana, meaning_id, jlpt_level, slug, hinshi")
            .eq("slug", slug)
            .limit(1)
        : Promise.resolve({ data: [], error: null }),
      source === "kanji" && slug
        ? supabase
            .from("kanji")
            .select("id, character, meaning, onyomi, kunyomi, jlpt_level, slug")
            .eq("character", slug)
            .limit(1)
        : Promise.resolve({ data: [], error: null }),
      source === "grammar" && slug
        ? supabase
            .from("grammar")
            .select("id, title, meaning, formation, slug, jlpt_level")
            .eq("slug", slug)
            .limit(1)
        : Promise.resolve({ data: [], error: null }),
    ]);

    const vocabRows =
      vocabResult.status === "fulfilled" && !vocabResult.value.error
        ? ((vocabResult.value.data || []) as VocabToolRow[])
        : [];
    const kanjiRows =
      kanjiResult.status === "fulfilled" && !kanjiResult.value.error
        ? ((kanjiResult.value.data || []) as KanjiToolRow[])
        : [];
    const grammarRows =
      grammarResult.status === "fulfilled" && !grammarResult.value.error
        ? ((grammarResult.value.data || []) as GrammarToolRow[])
        : [];
    const exactVocabRows =
      exactVocabResult.status === "fulfilled" && !exactVocabResult.value.error
        ? ((exactVocabResult.value.data || []) as VocabToolRow[])
        : [];
    const exactKanjiRows =
      exactKanjiResult.status === "fulfilled" && !exactKanjiResult.value.error
        ? ((exactKanjiResult.value.data || []) as KanjiToolRow[])
        : [];
    const exactGrammarRows =
      exactGrammarResult.status === "fulfilled" && !exactGrammarResult.value.error
        ? ((exactGrammarResult.value.data || []) as GrammarToolRow[])
        : [];

    const mergedVocabRows = uniqueRowsById([...exactVocabRows, ...vocabRows]);
    const mergedKanjiRows = uniqueRowsById([...exactKanjiRows, ...kanjiRows]);
    const mergedGrammarRows = uniqueRowsById([...exactGrammarRows, ...grammarRows]);

    const vocabMeanings = mergedVocabRows.map((row) => compactText(row.meaning_id)).filter(Boolean);
    const kanjiMeanings = mergedKanjiRows.map((row) => compactText(row.meaning)).filter(Boolean);
    const grammarMeanings = mergedGrammarRows.map((row) => compactText(row.meaning)).filter(Boolean);

    const vocabQuestions: MiniDrillQuestion[] = mergedVocabRows
      .filter((row) => row.word && row.meaning_id)
      .map((row) => {
        const answer = compactText(row.meaning_id);
        return {
          id: `db-vocab-${row.id}`,
          level: asDrillLevel(row.jlpt_level),
          kind: "vocab",
          prompt: row.word || "",
          reading: row.furigana || undefined,
          answer,
          options: buildOptions(answer, vocabMeanings, `vocab-${row.id}`),
          explanation: `${row.word} berarti ${answer}.`,
          sourceHref: row.slug ? `/library/vocab/${row.slug}` : undefined,
          sourceTitle: row.word || undefined,
          sourceType: "database",
        };
      });

    const kanjiQuestions: MiniDrillQuestion[] = mergedKanjiRows
      .filter((row) => row.character && row.meaning)
      .map((row) => {
        const answer = compactText(row.meaning);
        const reading = uniqueValues([row.onyomi || "", row.kunyomi || ""]).join(" / ");
        return {
          id: `db-kanji-${row.id}`,
          level: asDrillLevel(row.jlpt_level),
          kind: "kanji",
          prompt: row.character || "",
          reading: reading || undefined,
          answer,
          options: buildOptions(answer, kanjiMeanings, `kanji-${row.id}`),
          explanation: `${row.character} berkaitan dengan arti ${answer}.`,
          sourceHref: row.slug ? `/library/kanji/${row.slug}` : row.character ? `/library/kanji/${encodeURIComponent(row.character)}` : undefined,
          sourceTitle: row.character || undefined,
          sourceType: "database",
        };
      });

    const grammarQuestions: MiniDrillQuestion[] = mergedGrammarRows
      .filter((row) => row.title && row.meaning)
      .map((row) => {
        const answer = compactText(row.meaning);
        return {
          id: `db-grammar-${row.id}`,
          level: asDrillLevel(row.jlpt_level),
          kind: "grammar",
          prompt: row.formation || row.title || "",
          reading: row.title || undefined,
          answer,
          options: buildOptions(answer, grammarMeanings, `grammar-${row.id}`),
          explanation: `${row.title} berarti ${answer}.`,
          sourceHref: row.slug ? `/library/grammar/${row.slug}` : undefined,
          sourceTitle: row.title || undefined,
          sourceType: "database",
        };
      });

    // --- Sentence-based questions ---
    let sentenceQuestions: MiniDrillQuestion[] = [];
    if (!kindFilter || kindFilter === "sentence") {
      try {
        let sentenceQuery = supabase
          .from("sentences")
          .select("id, japanese, english, indonesia, jlpt_level")
          .not("japanese", "is", null)
          .or("indonesia.neq.null,english.neq.null");

        if (levelFilter) {
          sentenceQuery = sentenceQuery.eq("jlpt_level", levelFilter);
        }

        const { data: sentenceRows, error: sentenceError } = await sentenceQuery.limit(40);

        if (!sentenceError && sentenceRows && sentenceRows.length > 0) {
          const sentenceTranslations = sentenceRows
            .map((row) => compactText((row.indonesia as string | null) || (row.english as string | null) || ""))
            .filter(Boolean);

          sentenceQuestions = sentenceRows
            .filter((row) => {
              const translation = compactText((row.indonesia as string | null) || (row.english as string | null) || "");
              return row.japanese && translation;
            })
            .map((row) => {
              const answer = compactText((row.indonesia as string | null) || (row.english as string | null) || "");
              return {
                id: `db-sentence-${row.id}`,
                level: asDrillLevel(row.jlpt_level as string | null),
                kind: "sentence" as const,
                prompt: row.japanese,
                answer,
                options: buildOptions(answer, sentenceTranslations, `sentence-${row.id}`),
                explanation: `Kalimat ini berarti: ${answer}.`,
                sourceType: "database" as const,
              };
            });
        }
      } catch (sentenceErr) {
        console.error("[tools integration] Gagal mengambil soal kalimat:", sentenceErr);
      }
    }

    return sortMiniDrillByContext(
      [...vocabQuestions, ...kanjiQuestions, ...grammarQuestions, ...sentenceQuestions].filter(
        (question) => question.options.length >= 2
      ),
      context
    );
  } catch (error) {
    console.error("[tools integration] Gagal mengambil bank mini drill:", error);
    return [];
  }
}

/**
 * Fetch and build counter questions from database vocabulary.
 */
export async function getIntegratedCounterQuestions(
  context: ToolsIntegrationContext = {}
): Promise<CounterQuestion[]> {
  const supabase = createStaticClient();
  const levelFilter = getDrillLevelFilter(context.level);
  const source = getToolsSource(context.source);
  const slug = compactText(context.slug);

  try {
    const query = supabase
      .from("vocab")
      .select("id, word, furigana, meaning_id, jlpt_level, slug")
      .not("word", "is", null);
    const { data, error } = levelFilter
      ? await query.eq("jlpt_level", levelFilter).limit(120)
      : await query.limit(120);

    if (error) throw error;

    const { data: exactData } =
      source === "vocab" && slug
        ? await supabase
            .from("vocab")
            .select("id, word, furigana, meaning_id, jlpt_level, slug")
            .eq("slug", slug)
            .limit(1)
        : { data: [] };

    const rows = uniqueRowsById([...(exactData || []), ...(data || [])] as VocabToolRow[]);
    const questions = rows
      .map((row, index): CounterQuestion | null => {
        const word = compactText(row.word);
        const counter = detectCounter(word);
        if (!word || !counter) return null;

        const number = (index % 9) + 1;
        const phrase = `${number}${counter.answer}の${word}`;

        return {
          id: `db-counter-${row.id}`,
          level: asCounterLevel(row.jlpt_level),
          number,
          noun: word,
          nounReading: row.furigana || word,
          category: counter.category,
          answer: counter.answer,
          phrase,
          reading: row.furigana ? `${number}${counter.answer}の${row.furigana}` : phrase,
          translation: compactText(row.meaning_id) || word,
          hint: counter.hint,
          explanation: counter.explanation,
          sourceHref: row.slug ? `/library/vocab/${row.slug}` : undefined,
          sourceTitle: word,
          sourceType: "database",
        };
      })
      .filter((question): question is CounterQuestion => Boolean(question))
      .slice(0, 30);
    return questions.sort((a, b) => {
      const aRank = sourceHrefMatches(a.sourceHref, slug) ? 0 : 1;
      const bRank = sourceHrefMatches(b.sourceHref, slug) ? 0 : 1;
      return aRank - bRank;
    });
  } catch (error) {
    console.error("[tools integration] Gagal mengambil soal counter:", error);
    return [];
  }
}

/**
 * Fetch and build shadowing presets from Supabase materials.
 */
export async function getIntegratedShadowingPresets(
  context: ToolsIntegrationContext = {}
): Promise<ShadowingPreset[]> {
  const source = getToolsSource(context.source);
  const slug = compactText(context.slug);
  const levelFilter = getDrillLevelFilter(context.level);
  const supabase = createStaticClient();

  try {
    let exactItem: LibraryLineSource | null = null;
    if ((source === "reading" || source === "listening") && slug) {
      const { data } = await supabase
        .from(source)
        .select("id, title, slug, jlpt_level, difficulty, body, translation")
        .eq("slug", slug)
        .maybeSingle();

      if (data) {
        exactItem = {
          _id: data.id,
          title: data.title,
          slug: data.slug,
          jlpt_level: data.jlpt_level,
          difficulty: data.difficulty,
          body: data.body,
          translation: data.translation
        };
      }
    }

    const [listeningsRes, readingsRes] = await Promise.all([
      supabase
        .from("listening")
        .select("id, title, slug, jlpt_level, difficulty, body, translation")
        .order("created_at", { ascending: false })
        .limit(8),
      supabase
        .from("reading")
        .select("id, title, slug, jlpt_level, difficulty, body, translation")
        .order("created_at", { ascending: false })
        .limit(8)
    ]);

    const listenings: LibraryLineSource[] = (listeningsRes.data || []).map((l) => ({
      _id: l.id,
      title: l.title,
      slug: l.slug,
      jlpt_level: l.jlpt_level,
      difficulty: l.difficulty,
      body: l.body,
      translation: l.translation
    }));

    const readings: LibraryLineSource[] = (readingsRes.data || []).map((r) => ({
      _id: r.id,
      title: r.title,
      slug: r.slug,
      jlpt_level: r.jlpt_level,
      difficulty: r.difficulty,
      body: r.body,
      translation: r.translation
    }));

    const presets: ShadowingPreset[] = [];

    if (exactItem && (source === "reading" || source === "listening")) {
      pushShadowingPresetsFromSource(presets, exactItem, source, 4);
    }

    for (const item of listenings) {
      if (source === "reading") continue;
      if (levelFilter && asShadowingLevel(item.jlpt_level) !== levelFilter) continue;
      pushShadowingPresetsFromSource(presets, item, "listening");
    }

    for (const item of readings) {
      if (source === "listening") continue;
      if (levelFilter && asShadowingLevel(item.jlpt_level) !== levelFilter) continue;
      pushShadowingPresetsFromSource(presets, item, "reading");
    }

    return Array.from(new Map(presets.map((preset) => [preset.id, preset])).values()).slice(0, 16);
  } catch (error) {
    console.error("[tools integration] Gagal mengambil preset shadowing dari Supabase:", error);
    return [];
  }
}

/**
 * Fetch raw text content for specific library material from Supabase.
 */
export async function getLibraryTextForTool(
  context: ToolsIntegrationContext = {}
): Promise<ToolSourceText | null> {
  const source = getToolsSource(context.source);
  const slug = compactText(context.slug);
  if (!slug || (source !== "reading" && source !== "listening")) return null;
  const supabase = createStaticClient();

  try {
    const { data: item } = await supabase
      .from(source)
      .select("id, title, slug, body, translation")
      .eq("slug", slug)
      .maybeSingle();

    if (!item) return null;

    const text = splitJapaneseLines(textFromPortable(item.body)).join("\n");
    return {
      title: item.title,
      text: text || textFromPortable(item.body),
      sourceHref: item.slug ? `/library/${source}/${item.slug}` : undefined,
    };
  } catch (error) {
    console.error("[tools integration] Gagal mengambil teks sumber dari Supabase:", error);
    return null;
  }
}

/**
 * Fetch combined tools integration data. Fallback to static presets if empty.
 */
export async function getToolsIntegrationData(): Promise<ToolsIntegrationData> {
  const [miniDrillQuestions, counterQuestions, shadowingPresets] = await Promise.all([
    getIntegratedMiniDrillQuestions(),
    getIntegratedCounterQuestions(),
    getIntegratedShadowingPresets(),
  ]);

  return {
    miniDrillQuestions: miniDrillQuestions.length > 0 ? miniDrillQuestions : MINI_DRILL_BANK,
    counterQuestions: counterQuestions.length > 0 ? counterQuestions : COUNTER_QUESTIONS,
    shadowingPresets: shadowingPresets.length > 0 ? shadowingPresets : SHADOWING_PRESETS,
    stats: {
      miniDrillDatabaseCount: miniDrillQuestions.length,
      counterDatabaseCount: counterQuestions.length,
      shadowingLibraryCount: shadowingPresets.length,
    },
  };
}