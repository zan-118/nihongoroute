/**
 * @file shadowing-helpers.ts
 * @description Pure domain helpers untuk Shadowing Recorder tool — text splitting,
 * chunk creation, Portable Text extraction, preset generation, dan level casting.
 * 100% bebas dari I/O sehingga teruji murni via Vitest.
 */

import type { ShadowingPreset } from "@/lib/shadowing-recorder";

// ======================================================
// CONSTANTS
// ======================================================

/** Valid JLPT levels for shadowing recorder. */
const SHADOWING_LEVELS = ["N5", "N4", "N3"] as const;

// ======================================================
// TYPES
// ======================================================

/** Raw data structure from database for library line sources. */
export interface LibraryLineSource {
  _id: string;
  title?: string;
  slug?: string;
  jlpt_level?: string;
  difficulty?: string;
  body?: unknown;
  translation?: unknown;
}

// ======================================================
// LEVEL CASTER
// ======================================================

/**
 * Cast string to Shadowing level. Fallback to N3.
 *
 * @param value - Raw level string
 * @returns Valid shadowing level
 */
export function asShadowingLevel(value: string | null | undefined): "N5" | "N4" | "N3" {
  const upper = String(value || "").toUpperCase();
  return SHADOWING_LEVELS.includes(upper as "N5" | "N4" | "N3")
    ? (upper as "N5" | "N4" | "N3")
    : "N3";
}

// ======================================================
// TEXT EXTRACTION
// ======================================================

/**
 * Extract plain text from Rich Text / Portable Text structure.
 * Handles strings, arrays of blocks with children spans, and single text objects.
 *
 * @param value - Portable Text value (string, array, or object)
 * @returns Plain text string
 */
export function textFromPortable(value: unknown): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
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

// ======================================================
// TEXT SPLITTING
// ======================================================

/**
 * Split Japanese text into clean sentences. Filters lines that contain
 * Japanese characters and are at least 6 chars. Max 24 lines.
 *
 * @param text - Raw Japanese text
 * @returns Array of clean Japanese sentence strings
 */
export function splitJapaneseLines(text: string): string[] {
  return text
    .split(/\r?\n|(?<=[。！？!?])/)
    .map((line) => line.replace(/^[^:：]{1,16}[:：]\s*/, "").trim())
    .filter((line) => /[\u3040-\u30ff\u3400-\u9fff]/.test(line))
    .filter((line) => line.length >= 6)
    .slice(0, 24);
}

/**
 * Split translation text into clean sentences.
 *
 * @param text - Raw translation text
 * @returns Array of clean translation strings
 */
export function splitTranslationLines(text: string | undefined): string[] {
  return String(text || "")
    .split(/\r?\n|(?<=[.!?。！？])/)
    .map((line) => line.replace(/^[^:：]{1,24}[:：]\s*/, "").trim())
    .filter(Boolean);
}

/**
 * Split sentence into smaller chunks for shadowing display.
 * First tries splitting by commas, then falls back to half-split.
 *
 * @param text - Japanese sentence
 * @returns Array of sentence chunks (max 4)
 */
export function createShadowingChunks(text: string): string[] {
  const chunks = text
    .replace(/[。！？!?]$/g, "")
    .split(/[、,]/)
    .map((chunk) => chunk.trim())
    .filter(Boolean);

  if (chunks.length > 1) return chunks.slice(0, 4);

  const midpoint = Math.ceil(text.length / 2);
  return [text.slice(0, midpoint), text.slice(midpoint)].map((chunk) => chunk.trim()).filter(Boolean);
}

// ======================================================
// DURATION ESTIMATION
// ======================================================

/**
 * Estimate target duration in seconds based on character length.
 * Clamped between 3 and 14 seconds.
 *
 * @param text - Text to estimate duration for
 * @returns Estimated seconds (3-14)
 */
export function estimateTargetSeconds(text: string): number {
  return Math.max(3, Math.min(14, Math.round(text.length / 4)));
}

// ======================================================
// PRESET BUILDER
// ======================================================

/**
 * Parse library source item and push generated presets to array.
 * Transforms raw listening/reading data into structured ShadowingPreset objects.
 *
 * @param presets - Mutable array to push presets into
 * @param item - Library source item
 * @param sourceType - "reading" or "listening"
 * @param maxLines - Maximum lines to extract (default 2)
 */
export function pushShadowingPresetsFromSource(
  presets: ShadowingPreset[],
  item: LibraryLineSource,
  sourceType: "reading" | "listening",
  maxLines = 2
): void {
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
