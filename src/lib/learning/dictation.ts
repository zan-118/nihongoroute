/**
 * @file dictation.ts
 * @description Helpers for Japanese listening dictation normalization and scoring.
 */

import { toHiragana } from "wanakana";

/**
 * Result of dictation evaluation.
 */
export interface DictationEvaluation {
 expected: string;
 attempt: string;
 normalizedExpected: string;
 normalizedAttempt: string;
 distance: number;
 accuracy: number;
 isExact: boolean;
 isPassed: boolean;
}

/**
 * Matches Japanese and standard punctuation, spaces, brackets, and symbols.
 */
const JAPANESE_PUNCTUATION_PATTERN =
 /[\s。、，,.．・!！?？:：;；'"“”‘’`´「」『』（）()\[\]【】<>〈〉《》…ー~-]/g;

/**
 * Extracts raw text from string or structured block array.
 * @param value - Input value to extract text from.
 * @returns Extracted plain text.
 */
export function extractDictationText(value: unknown): string {
 if (typeof value === "string") return value;

 if (Array.isArray(value)) {
 // Handle structured block nodes (e.g., rich text editor state)
 return value
 .map((block) => {
 if (!block || typeof block !== "object") return "";
 const node = block as { text?: unknown; children?: { text?: unknown }[] };
 if (typeof node.text === "string") return node.text;
 if (Array.isArray(node.children)) {
 return node.children
 .map((child) => (typeof child?.text === "string" ? child.text : ""))
 .join("");
 }
 return "";
 })
 .join(" ");
 }

 return String(value || "");
}

/**
 * Normalizes Japanese text for comparison.
 * Converts to NFKC, lowercase, hiragana, and strips punctuation.
 * @param value - Raw text.
 * @returns Normalized hiragana string.
 */
export function normalizeDictationText(value: string): string {
 return toHiragana(value.normalize("NFKC").toLowerCase())
 .replace(JAPANESE_PUNCTUATION_PATTERN, "")
 .trim();
}

/**
 * Calculates Levenshtein distance between two strings.
 * @param left - First string.
 * @param right - Second string.
 * @returns Number of single-character edits required.
 */
function getLevenshteinDistance(left: string, right: string): number {
 if (left === right) return 0;
 if (left.length === 0) return right.length;
 if (right.length === 0) return left.length;

 // Initialize DP table row
 const previous = Array.from({ length: right.length + 1 }, (_, index) => index);
 const current = new Array<number>(right.length + 1);

 for (let leftIndex = 1; leftIndex <= left.length; leftIndex++) {
 current[0] = leftIndex;

 for (let rightIndex = 1; rightIndex <= right.length; rightIndex++) {
 const substitutionCost = left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1;
 // Compute minimum edit operations (insert, delete, substitute)
 current[rightIndex] = Math.min(
 current[rightIndex - 1] + 1,
 previous[rightIndex] + 1,
 previous[rightIndex - 1] + substitutionCost
 );
 }

 // Copy current row to previous for next iteration
 for (let index = 0; index <= right.length; index++) {
 previous[index] = current[index];
 }
 }

 return previous[right.length];
}

/**
 * Evaluates user attempt against expected text.
 * @param expected - Correct answer.
 * @param attempt - User input.
 * @param passingAccuracy - Minimum accuracy percentage to pass.
 * @returns Evaluation metrics.
 */
export function evaluateDictation(
 expected: string,
 attempt: string,
 passingAccuracy = 90
): DictationEvaluation {
 const normalizedExpected = normalizeDictationText(expected);
 const normalizedAttempt = normalizeDictationText(attempt);
 const distance = getLevenshteinDistance(normalizedExpected, normalizedAttempt);
 const maxLength = Math.max(normalizedExpected.length, normalizedAttempt.length, 1);
 const accuracy = Math.max(0, Math.round(((maxLength - distance) / maxLength) * 100));
 const isExact = normalizedExpected.length > 0 && normalizedExpected === normalizedAttempt;

 return {
 expected,
 attempt,
 normalizedExpected,
 normalizedAttempt,
 distance,
 accuracy,
 isExact,
 isPassed: isExact || accuracy >= passingAccuracy,
 };
}