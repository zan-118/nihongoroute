
import { createStaticClient } from "@/lib/supabase/server";
import {
 MINI_DRILL_BANK,
 type DrillKind,
 type MiniDrillQuestion,
} from "@/lib/jlpt-mini-drill";
import {
 COUNTER_QUESTIONS,
 type CounterQuestion,
} from "@/lib/counter-trainer";
import {
 SHADOWING_PRESETS,
 type ShadowingPreset,
} from "@/lib/shadowing-recorder";

// Domain helpers — extracted for testability
import {
 compactText,
 uniqueValues,
 uniqueRowsById,
 asDrillLevel,
 getDrillLevelFilter,
 getDrillKindFilter,
 getToolsSource,
 buildOptions,
 sortMiniDrillByContext,
 sourceHrefMatches,
 type VocabToolRow,
 type KanjiToolRow,
 type GrammarToolRow,
} from "@/lib/services/tools/mini-drill-helpers";
import { asCounterLevel, detectCounter } from "@/lib/services/tools/counter-helpers";
import {
 asShadowingLevel,
 textFromPortable,
 splitJapaneseLines,
 pushShadowingPresetsFromSource,
 type LibraryLineSource,
} from "@/lib/services/tools/shadowing-helpers";

// Re-export types and interface for external consumers
export type {
 ToolsIntegrationContext,
 ToolsSource,
} from "@/lib/services/tools/mini-drill-helpers";

/**
 * Text content extracted from library sources.
 */
export interface ToolSourceText {
 title?: string;
 text: string;
 sourceHref?: string;
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

// ======================================================
// QUERY BUILDERS
// ======================================================

/**
 * Fetch and build mini drill questions from database.
 * Queries vocab, kanji, grammar, and sentence tables in parallel,
 * then builds multiple-choice questions with adaptive distractors.
 *
 * @param context - Optional filtering context (level, kind, source, slug)
 * @returns Array of mini drill questions sorted by context relevance
 */
export async function getIntegratedMiniDrillQuestions(
 context: import("@/lib/services/tools/mini-drill-helpers").ToolsIntegrationContext = {}
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
 kind: "sentence" as DrillKind,
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
 * Detects counter categories from kanji patterns in words.
 *
 * @param context - Optional filtering context
 * @returns Array of counter questions
 */
export async function getIntegratedCounterQuestions(
 context: import("@/lib/services/tools/mini-drill-helpers").ToolsIntegrationContext = {}
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
 * Extracts Japanese sentences from listening and reading content.
 *
 * @param context - Optional filtering context
 * @returns Array of shadowing presets
 */
export async function getIntegratedShadowingPresets(
 context: import("@/lib/services/tools/mini-drill-helpers").ToolsIntegrationContext = {}
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
 *
 * @param context - Filtering context with source and slug
 * @returns Extracted text content or null
 */
export async function getLibraryTextForTool(
 context: import("@/lib/services/tools/mini-drill-helpers").ToolsIntegrationContext = {}
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
 *
 * @returns Combined integration data with stats
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