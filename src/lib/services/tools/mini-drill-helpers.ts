/**
 * @file mini-drill-helpers.ts
 * @description Pure domain helpers untuk Mini Drill tool — level/kind casting,
 * deterministic shuffle, distractor option builder, context sorting, dan shared utilities.
 * 100% bebas dari I/O (Supabase) sehingga teruji murni via Vitest.
 */

import { generateAdaptiveDistractors } from "@/lib/services/practice-session-engine";
import type { DrillKind, DrillLevel, MiniDrillQuestion } from "@/lib/jlpt-mini-drill";

// CONSTANTS

/** Valid JLPT levels for mini drills. */
export const JLPT_LEVELS = ["N5", "N4", "N3", "N2", "N1"] as const;

// TYPES (dipindahkan dari tools.service.ts)

/** Database row structure for vocabulary. */
export interface VocabToolRow {
 id: string;
 word: string | null;
 furigana: string | null;
 meaning_id: string | null;
 jlpt_level: string | null;
 slug: string | null;
 hinshi?: string[] | string | null;
}

/** Database row structure for kanji. */
export interface KanjiToolRow {
 id: string;
 character: string | null;
 meaning: string | null;
 onyomi: string | null;
 kunyomi: string | null;
 jlpt_level: string | null;
 slug: string | null;
}

/** Database row structure for grammar. */
export interface GrammarToolRow {
 id: string;
 title: string | null;
 meaning: string | null;
 formation: string | null;
 slug: string | null;
 jlpt_level: string | null;
}

/** Source types for integration tools. */
export type ToolsSource = "vocab" | "kanji" | "grammar" | "reading" | "listening";

// SHARED UTILITIES

/**
 * Normalize whitespace and trim string.
 *
 * @param value - Value to compact
 * @returns Trimmed single-space string
 */
export function compactText(value: unknown): string {
 return String(value || "")
 .replace(/\s+/g, " ")
 .trim();
}

/**
 * Filter unique non-empty trimmed strings.
 *
 * @param values - Array of strings to deduplicate
 * @returns Unique non-empty compacted values
 */
export function uniqueValues(values: string[]): string[] {
 return Array.from(new Set(values.map((value) => compactText(value)).filter(Boolean)));
}

/**
 * Deduplicate rows by id property.
 *
 * @param rows - Array of objects with id field
 * @returns Deduplicated array preserving first occurrence
 */
export function uniqueRowsById<T extends { id: string }>(rows: T[]): T[] {
 const seen = new Set<string>();
 return rows.filter((row) => {
 if (seen.has(row.id)) return false;
 seen.add(row.id);
 return true;
 });
}

/**
 * Safely decode URI component. Fallback to raw string on error.
 *
 * @param value - URI-encoded string
 * @returns Decoded string or original on failure
 */
export function safeDecodeHref(value: string | undefined): string {
 if (!value) return "";
 try {
 return decodeURIComponent(value);
 } catch {
 return value;
 }
}

// LEVEL / KIND / SOURCE CASTERS

/**
 * Cast string to DrillLevel. Fallback to N5.
 *
 * @param value - Raw level string
 * @returns Valid DrillLevel
 */
export function asDrillLevel(value: string | null | undefined): DrillLevel {
 const upper = String(value || "N5").toUpperCase();
 return JLPT_LEVELS.includes(upper as DrillLevel) ? (upper as DrillLevel) : "N5";
}

/**
 * Get DrillLevel filter if valid.
 *
 * @param value - Raw level string
 * @returns DrillLevel or undefined
 */
export function getDrillLevelFilter(value: string | null | undefined): DrillLevel | undefined {
 const upper = String(value || "").toUpperCase();
 return JLPT_LEVELS.includes(upper as DrillLevel) ? (upper as DrillLevel) : undefined;
}

/**
 * Get DrillKind filter if valid.
 *
 * @param value - Raw kind string
 * @returns DrillKind or undefined
 */
export function getDrillKindFilter(value: string | null | undefined): DrillKind | undefined {
 const normalized = String(value || "").toLowerCase();
 return ["vocab", "kanji", "grammar", "sentence"].includes(normalized)
 ? (normalized as DrillKind)
 : undefined;
}

/**
 * Get ToolsSource filter if valid.
 *
 * @param value - Raw source string
 * @returns ToolsSource or undefined
 */
export function getToolsSource(value: string | null | undefined): ToolsSource | undefined {
 const normalized = String(value || "").toLowerCase();
 return ["vocab", "kanji", "grammar", "reading", "listening"].includes(normalized)
 ? (normalized as ToolsSource)
 : undefined;
}

// DETERMINISTIC SHUFFLE

/**
 * Shuffle array deterministically using string seed (LCG algorithm).
 *
 * @param items - Array to shuffle
 * @param seed - Deterministic seed string
 * @returns New shuffled array
 */
export function shuffleBySeed<T>(items: T[], seed: string): T[] {
 const next = [...items];
 let state = Array.from(seed).reduce((total, char) => total + char.charCodeAt(0), 0) || 1;

 for (let index = next.length - 1; index > 0; index--) {
 state = (state * 9301 + 49297) % 233280;
 const swapIndex = state % (index + 1);
 [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
 }

 return next;
}

// OPTION BUILDER

/**
 * Build multiple choice options with distractors using PracticeSessionEngine.
 *
 * @param answer - Correct answer string
 * @param candidates - Pool of candidate distractors
 * @param seed - Deterministic shuffle seed
 * @returns Shuffled array of options including correct answer
 */
export function buildOptions(answer: string, candidates: string[], seed: string): string[] {
 const selected = generateAdaptiveDistractors<string>({
 target: answer,
 candidatePool: uniqueValues(candidates),
 getKey: (item) => item,
 count: 3,
 });
 return shuffleBySeed(uniqueValues([answer, ...selected]), `${seed}-options`);
}

// CONTEXT SORTING

/** Context parameters for filtering integration data. */
export interface ToolsIntegrationContext {
 level?: string;
 kind?: DrillKind | "mixed" | string;
 source?: ToolsSource | string;
 slug?: string;
}

/**
 * Check if source URL matches target slug.
 *
 * @param sourceHref - Source URL path
 * @param slug - Target slug to match
 * @returns True if href ends with /slug
 */
export function sourceHrefMatches(sourceHref: string | undefined, slug: string | undefined): boolean {
 const target = compactText(slug);
 if (!sourceHref || !target) return false;
 return safeDecodeHref(sourceHref).endsWith(`/${target}`);
}

/**
 * Sort questions prioritizing matches with context slug, kind, and level.
 *
 * @param questions - Array of drill questions
 * @param context - Integration context for ranking
 * @returns Sorted copy of questions array
 */
export function sortMiniDrillByContext(
 questions: MiniDrillQuestion[],
 context: ToolsIntegrationContext
): MiniDrillQuestion[] {
 const levelFilter = getDrillLevelFilter(context.level);
 const kindFilter = getDrillKindFilter(context.kind);
 const slug = compactText(context.slug);

 return [...questions].sort((a, b) => {
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
