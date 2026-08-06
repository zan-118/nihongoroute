/**
 * @file lesson-hydration-engine.ts
 * @description Deep module encapsulating full lesson hydration logic: parsing markdown blocks into ContentBlocks, normalizing camelCase fields, and performing parallel relational hydrations.
 * @module lib/services
 */

import type { LibraryItem } from "@/types/library";
import type { ContentBlock } from "@/types/database";
import type { RawQuizItem } from "@/lib/utils/lesson-utils";
import { transformLessonBlocks } from "@/lib/learning/lesson-block-transformer";

// ======================================================
// TYPES
// ======================================================

/**
 * Blok konten dinamis hasil parsing markdown atau dari database.
 */
export type HydrationContentBlock = {
 _type?: string;
 type?: string;
 children?: unknown[];
 id?: string;
 order?: number;
 listType?: string;
 items?: string[];
 headers?: string[];
 rows?: string[][];
 style?: string;
 calloutType?: string;
 title?: string;
 content?: string;
 romaji?: string;
 translation?: string;
 level?: number;
 [key: string]: unknown;
};

/**
 * Row kosakata minimal yang dikembalikan oleh fetcher.
 */
export interface HydrationVocabRow {
 id: string;
 word: string;
 furigana: string | null;
 romaji: string | null;
 meaning_id: string;
 hinshi: string | null;
 pitch_accent: string | null;
 usage_notes: string | null;
 mnemonic: string | null;
 slug: string | null;
 audio_url?: string | null;
}

/**
 * Row kanji minimal yang dikembalikan oleh fetcher.
 */
export interface HydrationKanjiRow {
 id: string;
 character: string;
 meaning: string;
 onyomi: string | null;
 kunyomi: string | null;
 jlpt_level: string | null;
 stroke_order_svg?: string | null;
 slug: string | null;
}

/**
 * Row grammar minimal yang dikembalikan oleh fetcher.
 */
export interface HydrationGrammarRow {
 id: string;
 title: string;
 meaning: string;
 formation: string | null;
 formation_furigana: string | null;
 slug: string;
 jlpt_level: string | null;
 examples: unknown;
 notes: string | null;
}

/**
 * Kontrak fetcher untuk mengambil data relasi dari sumber data eksternal.
 * Implementasi konkret (Supabase-backed) hidup di lesson.service.ts.
 */
export interface LessonRelationFetcher {
 fetchVocabByIds(ids: string[]): Promise<HydrationVocabRow[]>;
 fetchVocabByWordsOrSlugs(terms: string[]): Promise<HydrationVocabRow[]>;
 fetchKanjiByIds(ids: string[]): Promise<HydrationKanjiRow[]>;
 fetchKanjiByCharacters(chars: string[]): Promise<HydrationKanjiRow[]>;
 fetchGrammarByIds(ids: string[]): Promise<HydrationGrammarRow[]>;
 fetchGrammarByTitlesOrSlugs(terms: string[]): Promise<HydrationGrammarRow[]>;
 fetchListeningBySlugs(slugs: string[]): Promise<Record<string, unknown>[]>;
 fetchReadingBySlugs(slugs: string[]): Promise<Record<string, unknown>[]>;
}

/**
 * Raw lesson row dari Supabase, sebelum hidrasi.
 */
export interface RawLessonRow {
 id: string;
 title: string;
 slug: string;
 summary?: string | null;
 order_number?: number | null;
 estimated_minutes?: number | null;
 content?: string | null;
 dialogue?: unknown;
 vocab_list?: unknown;
 kanji_list?: unknown;
 grammar_list?: unknown;
 listening_list?: unknown;
 reading_list?: unknown;
 quizzes?: unknown;
 seo?: Record<string, unknown> | null;
 category_id?: string | null;
 generation_context?: Record<string, unknown> | null;
 image_url?: string | null;
 category?: { title?: string; type?: string } | null;
 /** Sumber tabel: "lessons" atau "articles" */
 _sourceTable: "lessons" | "articles";
}

// ======================================================
// HELPERS (internal)
// ======================================================

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUUID(s: string): boolean {
 return UUID_RE.test(s);
}

/**
 * Memastikan nilai berupa array. Tangani kemungkinan JSON string.
 */
export function parseArray(val: unknown): unknown[] {
 if (!val) return [];
 if (Array.isArray(val)) return val;
 try {
 return typeof val === "string" ? JSON.parse(val) : [];
 } catch {
 return [];
 }
}

// ======================================================
// MARKDOWN PARSER
// ======================================================

/**
 * Mengubah konten Markdown biasa menjadi struktur HydrationContentBlock dinamis.
 *
 * @param markdown - String markdown mentah dari kolom `content` tabel lessons/articles
 * @returns Array blok konten terstruktur
 */
export function parseMarkdownToBlocks(markdown: string): HydrationContentBlock[] {
 if (!markdown) return [];

 const blocks: HydrationContentBlock[] = [];
 
 // Ekstrak code blocks untuk menghindari terpotong oleh split double-newline
 const codeBlocks: string[] = [];
 const markdownWithoutCode = markdown.replace(/```([\s\S]*?)```/g, (match) => {
   codeBlocks.push(match);
   return `__CODEBLOCK_${codeBlocks.length - 1}__`;
 });

 const sections = markdownWithoutCode.split(/\r?\n\s*\r?\n/);
 let globalIdx = 0;

 sections.forEach((section) => {
 const trimmed = section.trim();
 if (!trimmed) return;

 const id = `block-${globalIdx}`;

 // Code block
 if (trimmed.startsWith("__CODEBLOCK_") && trimmed.endsWith("__")) {
   const match = trimmed.match(/__CODEBLOCK_(\d+)__/);
   if (match) {
     const codeIdx = parseInt(match[1], 10);
     const rawCode = codeBlocks[codeIdx];
     // Ekstrak bahasa jika ada, misal ```javascript\n...
     const codeContentMatch = rawCode.match(/```(\w+)?\n([\s\S]*?)```/);
     if (codeContentMatch) {
       blocks.push({
         id,
         type: "code",
         language: codeContentMatch[1] || "text",
         content: codeContentMatch[2].trim(),
         order: globalIdx
       });
     } else {
       // Fallback
       blocks.push({
         id,
         type: "code",
         language: "text",
         content: rawCode.replace(/```/g, "").trim(),
         order: globalIdx
       });
     }
     globalIdx++;
     return;
   }
 }

 // Horizontal Rule
 if (/^(---|___|\*\*\*)$/.test(trimmed)) {
 blocks.push({ id, type: "hr", order: globalIdx });
 globalIdx++;
 return;
 }

 // Heading 3
 if (trimmed.startsWith("### ")) {
 blocks.push({ id, type: "heading", content: trimmed.slice(4).trim(), level: 3, order: globalIdx });
 globalIdx++;
 return;
 }
 // Heading 2
 if (trimmed.startsWith("## ")) {
 blocks.push({ id, type: "heading", content: trimmed.slice(3).trim(), level: 2, order: globalIdx });
 globalIdx++;
 return;
 }
 // Heading 1
 if (trimmed.startsWith("# ")) {
 blocks.push({ id, type: "heading", content: trimmed.slice(2).trim(), level: 1, order: globalIdx });
 globalIdx++;
 return;
 }

 // Callout / Blockquote
 if (trimmed.startsWith(">")) {
 const lines = trimmed.split(/\r?\n/).map(l => l.replace(/^>\s?/, "").trim());
 let title = "";
 let content = "";
 if (lines.length > 1 && (lines[0].startsWith("**") || /^[^\w\s]/.test(lines[0]))) {
 title = lines[0].replace(/^\*\*|\*\*$/g, "");
 content = lines.slice(1).join("\n");
 } else {
 content = lines.join("\n");
 }
 blocks.push({ id, type: "callout", title, content, calloutType: "info", order: globalIdx });
 globalIdx++;
 return;
 }

 // List block (bullet)
 if (trimmed.startsWith("- ") || trimmed.startsWith("* ") || trimmed.startsWith("• ")) {
 const items = trimmed.split(/\r?\n/).map(line => line.replace(/^[-*•]\s?/, "").trim());
 blocks.push({ id, type: "list", listType: "bullet", items, order: globalIdx });
 globalIdx++;
 return;
 }

 // List block (numbered)
 if (/^\d+\.\s/.test(trimmed)) {
 const items = trimmed.split(/\r?\n/).map(line => line.replace(/^\d+\.\s?/, "").trim());
 blocks.push({ id, type: "list", listType: "number", items, order: globalIdx });
 globalIdx++;
 return;
 }

 // Table block
 if (trimmed.startsWith("|")) {
 const lines = trimmed.split(/\r?\n/).map(line => line.trim());
 if (lines.length >= 2) {
 const headers = lines[0].split("|").slice(1, -1).map(c => c.trim());
 const rows = lines.slice(2).map(line => line.split("|").slice(1, -1).map(c => c.trim()));
 blocks.push({ id, type: "table", headers, rows, order: globalIdx });
 globalIdx++;
 return;
 }
 }

 // Image
 const imgMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/);
 if (imgMatch) {
 blocks.push({ id, type: "image", title: imgMatch[1], content: imgMatch[2], order: globalIdx });
 globalIdx++;
 return;
 }

 // Default: text block
 blocks.push({ id, type: "text", content: trimmed, order: globalIdx });
 globalIdx++;
 });

 return blocks;
}

// ======================================================
// RELATION HYDRATORS (internal)
// ======================================================

/**
 * Hidrasi daftar kosakata dari raw ID/word/slug list.
 */
async function hydrateVocab(
 rawList: string[],
 fetcher: LessonRelationFetcher
): Promise<Record<string, unknown>[]> {
 if (!rawList.length) return [];

 const cleanList = rawList.map(s => String(s).trim());
 const hasUUIDs = cleanList.some(isUUID);

 let vItems: HydrationVocabRow[];
 if (hasUUIDs) {
 vItems = await fetcher.fetchVocabByIds(cleanList);
 } else {
 const searchTerms = cleanList.flatMap(item => {
 if (item.includes("-") && !isUUID(item)) {
 return [item, item.split("-")[0]];
 }
 return [item];
 });
 vItems = await fetcher.fetchVocabByWordsOrSlugs(searchTerms);
 }

 return cleanList.map((item, idx) => {
 let wordPart = item;
 let furiganaPart = "";
 if (item.includes("-") && !isUUID(item)) {
 const parts = item.split("-");
 wordPart = parts[0];
 furiganaPart = parts[1];
 }

 const matched = vItems.find(v =>
 v.id === item ||
 v.word === item ||
 v.slug === item ||
 v.word === wordPart ||
 v.slug === `${wordPart}-${furiganaPart}`
 );

 if (matched) {
 return { ...matched, _id: matched.id, meaning: matched.meaning_id };
 }
 return {
 _id: `temp-${item}-${idx}`,
 word: wordPart,
 furigana: furiganaPart || undefined,
 meaning: "Detail pending...",
 };
 });
}

/**
 * Hidrasi daftar kanji dari raw ID/character list.
 */
async function hydrateKanji(
 rawList: string[],
 fetcher: LessonRelationFetcher
): Promise<Record<string, unknown>[]> {
 if (!rawList.length) return [];

 const cleanList = rawList.map(s => String(s).trim());
 const hasUUIDs = cleanList.some(isUUID);

 const kItems = hasUUIDs
 ? await fetcher.fetchKanjiByIds(cleanList)
 : await fetcher.fetchKanjiByCharacters(cleanList);

 return cleanList.map((item, idx) => {
 const matched = kItems.find(k => k.id === item || k.character === item);
 if (matched) {
 return { ...matched, _id: matched.id, jlptLevel: matched.jlpt_level, slug: matched.slug };
 }
 return { _id: `temp-${item}-${idx}`, character: item, meaning: "Detail pending..." };
 });
}

/**
 * Hidrasi daftar grammar dari raw ID/title/slug list.
 */
async function hydrateGrammar(
 rawList: string[],
 fetcher: LessonRelationFetcher
): Promise<Record<string, unknown>[]> {
 if (!rawList.length) return [];

 const cleanList = rawList.map(s => String(s).trim());
 const hasUUIDs = cleanList.some(isUUID);

 let gItems: HydrationGrammarRow[];
 if (hasUUIDs) {
 gItems = await fetcher.fetchGrammarByIds(cleanList);
 } else {
 gItems = await fetcher.fetchGrammarByTitlesOrSlugs(cleanList);
 }

 return cleanList.map((item, idx) => {
 const matched = gItems.find(g => g.id === item || g.title === item || g.slug === item);
 if (matched) {
 return {
 ...matched,
 _id: matched.id,
 jlptLevel: matched.jlpt_level,
 exampleSentences: (matched.examples as Array<Record<string, string>> || []).map(ex => ({
 jp: ex.japanese || ex.jp || "",
 id: ex.indonesian || ex.id || "",
 romaji: ex.romaji || "",
 furigana: ex.furigana || "",
 })),
 };
 }
 return { _id: `temp-${item}-${idx}`, title: item, meaning: "Detail pending..." };
 });
}

/**
 * Hidrasi daftar listening dari dialogue field atau slug list.
 */
async function hydrateListening(
 rawLesson: RawLessonRow,
 listeningListRaw: string[],
 fetcher: LessonRelationFetcher
): Promise<Record<string, unknown>[]> {
 // Prioritaskan dialogue field embedded di lesson
 if (rawLesson.dialogue && Array.isArray(rawLesson.dialogue) && rawLesson.dialogue.length > 0) {
 const dialogueList = rawLesson.dialogue as Record<string, unknown>[];
 return [{
 _id: `dialogue-${rawLesson.id}`,
 id: `dialogue-${rawLesson.id}`,
 title: "Skenario Percakapan",
 transcript: dialogueList.map((item, idx) => ({
 ...item,
 id: String(item.id || idx),
 text: String(item.text || item.jp || ""),
 jp: String(item.jp || item.text || ""),
 speaker: String(item.speaker || ""),
 speakerName: String(item.speakerName || ""),
 translation: String(item.translation || ""),
 furigana: item.furigana as string | undefined,
 })),
 }];
 }

 if (!listeningListRaw.length) return [];

 const cleanList = listeningListRaw.map(s => String(s).trim());
 const lItems = await fetcher.fetchListeningBySlugs(cleanList);
 if (!lItems.length) return [];

 return lItems.map(l => {
 let dialogue: Record<string, unknown>[] = [];
 if (typeof l.body === "string") {
 const lines = l.body.split("\n").filter((line: string) => line.trim());
 const translations = typeof l.translation === "string"
 ? l.translation.split("\n").filter((line: string) => line.trim()) : [];
 const readings = typeof l.hiragana === "string"
 ? l.hiragana.split("\n").filter((line: string) => line.trim()) : [];

 dialogue = lines.map((line: string, idx: number) => {
 const parts = line.split(/[：:]/);
 const speaker = parts.length > 1 ? parts[0].trim() : "???";
 const text = parts.length > 1 ? parts.slice(1).join("：").trim() : line.trim();

 let translation = translations[idx] || "";
 if (translation.includes("：") || translation.includes(":")) {
 translation = translation.split(/[：:]/).slice(1).join("：").trim();
 }

 let furigana = "";
 if (readings[idx]) {
 const rLine = readings[idx];
 if (rLine.includes("：") || rLine.includes(":")) {
 furigana = rLine.split(/[：:]/).slice(1).join("：").trim();
 } else {
 furigana = rLine.trim();
 }
 }

 return { speaker, text, jp: text, furigana, translation: translation || text, id: String(idx) };
 });
 } else if (Array.isArray(l.body)) {
 dialogue = l.body as Record<string, unknown>[];
 }

 return {
 ...l,
 _id: l._id || l.id,
 audioUrl: l.audio_url,
 imageUrl: l.image_url,
 videoUrl: l.video_url,
 transcript: dialogue,
 };
 });
}

/**
 * Hidrasi daftar reading dari slug list.
 */
async function hydrateReading(
 readingListRaw: string[],
 fetcher: LessonRelationFetcher
): Promise<Record<string, unknown>[]> {
 if (!readingListRaw.length) return [];

 const cleanList = readingListRaw.map(s => String(s).trim());
 const rItems = await fetcher.fetchReadingBySlugs(cleanList);
 if (!rItems.length) return [];

 return rItems.map(r => ({
 ...r,
 _id: r._id || r.id,
 audioUrl: r.audio_url,
 imageUrl: r.image_url,
 videoUrl: r.video_url,
 body: typeof r.body === "string"
 ? [{ _type: "block", children: [{ _type: "span", text: r.body }] }]
 : r.body,
 translation: typeof r.translation === "string"
 ? [{ _type: "block", children: [{ _type: "span", text: r.translation }] }]
 : r.translation,
 }));
}

// ======================================================
// MAIN HYDRATION FUNCTION
// ======================================================

/**
 * Menghidrasi raw lesson/article row menjadi LibraryItem yang sepenuhnya terformat.
 * Menjalankan parsing markdown, normalisasi field, dan hidrasi relasi secara paralel.
 *
 * @param rawLesson - Raw DB row dari tabel lessons atau articles
 * @param fetcher - Implementasi LessonRelationFetcher untuk mengambil data relasi
 * @returns LibraryItem yang siap render, atau null jika input tidak valid
 */
export async function hydrateLessonDetail(
 rawLesson: RawLessonRow,
 fetcher: LessonRelationFetcher
): Promise<LibraryItem> {
 const isFromArticles = rawLesson._sourceTable === "articles";
 const categoryType = rawLesson.category?.type || (isFromArticles ? "article" : "jlpt");
 const levelTitle = rawLesson.category?.title || (isFromArticles ? "Artikel" : "N5");

 // Parse content blocks
 const contentBlocks = parseMarkdownToBlocks(rawLesson.content || "");

 // Build initial data shape
 const data: LibraryItem = {
 id: rawLesson.id,
 _id: rawLesson.id,
 title: rawLesson.title,
 slug: rawLesson.slug,
 summary: rawLesson.summary,
 order_number: rawLesson.order_number,
 estimated_minutes: rawLesson.estimated_minutes || 15,
 content_blocks: contentBlocks,
 content: rawLesson.content,
 dialogue: rawLesson.dialogue,
 vocab_list: isFromArticles ? [] : parseArray(rawLesson.vocab_list),
 kanji_list: isFromArticles ? [] : parseArray(rawLesson.kanji_list),
 grammar_list: isFromArticles ? [] : parseArray(rawLesson.grammar_list),
 listening_list: isFromArticles ? [] : parseArray(rawLesson.listening_list),
 reading_list: isFromArticles ? [] : parseArray(rawLesson.reading_list),
 quizzes: parseArray(rawLesson.quizzes) as RawQuizItem[],
 seo: rawLesson.seo || {},
 category_id: rawLesson.category_id,
 levelTitle,
 categoryType,
 generation_context: rawLesson.generation_context,
 image_url: rawLesson.image_url,
 imageUrl: rawLesson.image_url,
 };

 // Extract raw relation lists
 const vocabListRaw = parseArray(data.vocab_list).map(s => String(s).trim());
 const kanjiListRaw = parseArray(data.kanji_list).map(s => String(s).trim());
 const grammarListRaw = parseArray(data.grammar_list).map(s => String(s).trim());
 const listeningListRaw = parseArray(data.listening_list).map(s => String(s).trim());
 const readingListRaw = parseArray(data.reading_list).map(s => String(s).trim());

 // Normalize content blocks (_type fallback)
 const articles = contentBlocks.map(block => {
 if (!block) return block;
 const normalized = { ...block };
 if (!normalized._type && normalized.type) {
 normalized._type = normalized.type;
 }
 if (!normalized._type) {
 normalized._type = "block";
 }
 return normalized;
 });

 // Build result with normalized quizzes
 const result: LibraryItem = {
 ...data,
 _id: data.id || data._id,
 articles,
 quizzes: (parseArray(data.quizzes) as RawQuizItem[]).map((q, idx) => ({
 ...q,
 _id: q.id || `q-${idx}`,
 correctAnswer: q.correct_answer ?? q.correctAnswer,
 })),
 vocabList: [],
 kanjiList: [],
 grammarList: [],
 listeningList: [],
 readingList: [],
 };

 // Hydrate all relations in parallel
 const [vocabList, kanjiList, grammarList, listeningList, readingList] = await Promise.all([
 hydrateVocab(vocabListRaw, fetcher),
 hydrateKanji(kanjiListRaw, fetcher),
 hydrateGrammar(grammarListRaw, fetcher),
 hydrateListening(rawLesson, listeningListRaw, fetcher),
 hydrateReading(readingListRaw, fetcher),
 ]);

 result.vocabList = vocabList;
 result.kanjiList = kanjiList;
 result.grammarList = grammarList;
 result.listeningList = listeningList;
 result.readingList = readingList;

 // Transform blocks for JLPT category type
 if (categoryType === "jlpt") {
 result.articles = transformLessonBlocks(result, contentBlocks as unknown as ContentBlock[], articles as unknown as ContentBlock[]);
 } else if (!result.articles || (result.articles as unknown[]).length === 0) {
 result.articles = articles.length > 0 ? articles : contentBlocks;
 }

 return result;
}
