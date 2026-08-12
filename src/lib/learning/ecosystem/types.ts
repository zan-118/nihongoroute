/**
 * @file types.ts
 * @description Tipe data domain ekosistem belajar (rekomendasi, weak points, daily route).
 */

/**
 * Recommendation item for user dashboard.
 */
export interface EcosystemRecommendation {
 id: string;
 title: string;
 description: string;
 href: string;
 category: "review" | "library" | "tool" | "continue";
 priority: number;
}

/**
 * Reading progress state for specific source.
 */
export interface EcosystemReadingProgress {
 sourceId: string;
 sourceTitle?: string;
 lastParagraphIndex: number;
 totalParagraphs: number;
 elapsedSeconds: number;
 completedAt?: number;
 updatedAt: number;
}

/**
 * Vocabulary entry tracked from reading.
 */
export interface EcosystemVocabEntry {
 word: string;
 slug?: string;
 jlpt?: string;
 sourceTitle?: string;
 sourceHref?: string;
 hitCount: number;
}

/**
 * Categories of weak points.
 */
export type WeakPointCategory =
 | "reading"
 | "listening"
 | "vocab"
 | "kanji"
 | "grammar"
 | "counter"
 | "conjugation"
 | "sentence"
 | "mixed";

/**
 * Insight data for user weak points.
 */
export interface WeakPointInsight {
 id: string;
 category: WeakPointCategory;
 label: string;
 description: string;
 href: string;
 mistakes: number;
 attempts: number;
 score: number;
 lastSeenAt: number;
 sourceTitle?: string;
}

/**
 * Categories for daily route steps.
 */
export type DailyRouteCategory = EcosystemRecommendation["category"] | "warmup";

/**
 * Step in daily learning route.
 */
export interface DailyRouteStep {
 id: string;
 order: number;
 title: string;
 description: string;
 href: string;
 category: DailyRouteCategory;
 reason: string;
 priority: number;
}

export interface EcosystemLessonItem {
 id?: string;
 _id?: string;
 title: string;
 slug: string;
 description?: string;
 summary?: string;
}

export interface EcosystemCourseMetadataItem {
 id?: string;
 _id?: string;
 title: string;
 slug: string;
 lessons: EcosystemLessonItem[];
}

