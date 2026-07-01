/**
 * @file dictation.ts
 * @description Helpers for Japanese listening dictation normalization and scoring.
 */

import * as wanakana from "wanakana";

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

const JAPANESE_PUNCTUATION_PATTERN =
  /[\s。、，,.．・!！?？:：;；'"“”‘’`´「」『』（）()\[\]【】<>〈〉《》…ー~-]/g;

export function extractDictationText(value: unknown): string {
  if (typeof value === "string") return value;

  if (Array.isArray(value)) {
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

export function normalizeDictationText(value: string): string {
  return wanakana
    .toHiragana(value.normalize("NFKC").toLowerCase())
    .replace(JAPANESE_PUNCTUATION_PATTERN, "")
    .trim();
}

function getLevenshteinDistance(left: string, right: string): number {
  if (left === right) return 0;
  if (left.length === 0) return right.length;
  if (right.length === 0) return left.length;

  const previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  const current = new Array<number>(right.length + 1);

  for (let leftIndex = 1; leftIndex <= left.length; leftIndex++) {
    current[0] = leftIndex;

    for (let rightIndex = 1; rightIndex <= right.length; rightIndex++) {
      const substitutionCost = left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1;
      current[rightIndex] = Math.min(
        current[rightIndex - 1] + 1,
        previous[rightIndex] + 1,
        previous[rightIndex - 1] + substitutionCost
      );
    }

    for (let index = 0; index <= right.length; index++) {
      previous[index] = current[index];
    }
  }

  return previous[right.length];
}

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
