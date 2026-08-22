/**
 * @file daily-route.ts
 * @description Penyusun daily learning route dari rekomendasi, weak points, dan antrean SRS.
 */

import type { LearningEvent } from "@/lib/learning-events";
import type {
  DailyRouteStep,
  EcosystemCourseMetadataItem,
  EcosystemReadingProgress,
  EcosystemVocabEntry,
} from "./types";
import { buildEcosystemRecommendations } from "./recommendations";
import { buildWeakPointInsights } from "./weak-points";

/**
 * Add route step if unique or higher priority.
 */
function pushRouteStep(steps: DailyRouteStep[], step: Omit<DailyRouteStep, "order">) {
 const existingIndex = steps.findIndex((item) => item.href === step.href || item.id === step.id);
 if (existingIndex >= 0) {
 if (step.priority > steps[existingIndex].priority) {
 steps[existingIndex] = { ...step, order: steps[existingIndex].order };
 }
 return;
 }
 steps.push({ ...step, order: steps.length + 1 });
}

/**
 * Build daily learning route steps.
 */
export function buildDailyRoute({
 events,
 readingProgressMap,
 readingVocabularyBank,
 completedLessons,
 courseMetadata,
 dueCount = 0,
 limit = 5,
}: {
 events: LearningEvent[];
 readingProgressMap?: Record<string, EcosystemReadingProgress>;
 readingVocabularyBank?: Record<string, EcosystemVocabEntry>;
 completedLessons?: Record<string, { completedAt: number; updatedAt: number }>;
 courseMetadata?: EcosystemCourseMetadataItem[];
 dueCount?: number;
 limit?: number;
}): DailyRouteStep[] {
 const steps: DailyRouteStep[] = [];
 const recommendations = buildEcosystemRecommendations({
 events,
 readingProgressMap,
 readingVocabularyBank,
 completedLessons,
 courseMetadata,
 limit: 8,
 });
 const weakPoints = buildWeakPointInsights({ events, limit: 3 });
 const unfinishedReading = Object.values(readingProgressMap || {})
 .filter((entry) => !entry.completedAt && entry.totalParagraphs > 0)
 .sort((a, b) => b.updatedAt - a.updatedAt)[0];

 // Tambahkan sesi latihan ingatan jika ada kartu SRS jatuh tempo (Prioritas teratas)
 if (dueCount > 0) {
 pushRouteStep(steps, {
 id: "daily-srs-review",
 title: "Asah Ingatan: Tinjau Kosakata",
 description: `Ada ${dueCount} kata yang menumpuk di antrean SRS kamu.`,
 href: "/review",
 category: "review",
 reason: "Sistem Spaced Repetition mendeteksi kartu perlu diulas hari ini.",
 priority: 250,
 });
 }

 // Add recommendation steps.
 recommendations.forEach((recommendation, index) => {
 pushRouteStep(steps, {
 id: `daily-${recommendation.id}`,
 title: recommendation.title,
 description: recommendation.description,
 href: recommendation.href,
 category: recommendation.category,
 reason: "Direkomendasikan berdasarkan rencana belajar aktif kamu.",
 priority: recommendation.priority - index,
 });
 });

 return steps
 .sort((a, b) => b.priority - a.priority)
 .slice(0, limit)
 .map((step, index) => ({ ...step, order: index + 1 }));
}
