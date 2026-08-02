/**
 * Types of tracked learning activities.
 */
export type LearningEventType =
 | "reading_started"
 | "reading_completed"
 | "listening_started"
 | "listening_completed"
 | "jlpt_drill_answered"
 | "jlpt_drill_completed"
 | "counter_answered"
 | "counter_completed"
 | "shadowing_recorded"
 | "conjugation_checked"
 | "text_analyzed";

/**
 * Categories of content sources.
 */
export type LearningSourceType =
 | "reading"
 | "listening"
 | "vocab"
 | "kanji"
 | "grammar"
 | "sentence"
 | "tool";

/**
 * Metadata for content source.
 */
export interface LearningEventSource {
 type: LearningSourceType;
 id?: string;
 slug?: string;
 title?: string;
 href?: string;
 level?: string;
}

/**
 * Performance metrics for event.
 */
export interface LearningEventMetrics {
 correct?: number;
 total?: number;
 accuracy?: number;
 elapsedSeconds?: number;
 targetSeconds?: number;
}

/**
 * Complete learning event record.
 */
export interface LearningEvent {
 id: string;
 type: LearningEventType;
 source: LearningEventSource;
 createdAt: number;
 metrics?: LearningEventMetrics;
 details?: {
 kind?: "vocab" | "kanji" | "grammar" | "mixed" | "counter" | "shadowing" | "conjugation" | "sentence";
 prompt?: string;
 answer?: string;
 isCorrect?: boolean;
 focus?: string;
 text?: string;
 };
}

/**
 * Input payload for creating event. Excludes generated fields.
 */
export type LearningEventInput = Omit<LearningEvent, "id" | "createdAt"> & {
 id?: string;
 createdAt?: number;
};

/**
 * Create learning event. Generate ID and timestamp if missing.
 * @param input Event data.
 * @returns Complete event object.
 */
export function createLearningEvent(input: LearningEventInput): LearningEvent {
 const createdAt = input.createdAt || Date.now();
 return {
 ...input,
 id:
 input.id ||
 // Fallback ID format: type-sourceType-sourceIdentifier-timestamp
 `${input.type}-${input.source.type}-${input.source.id || input.source.slug || "source"}-${createdAt}`,
 createdAt,
 };
}