export * from "@/lib/learning-events";

/**
 * @file learning-ecosystem.ts
 * @description Barrel re-export modul ekosistem belajar.
 */

export type {
  DailyRouteCategory,
  DailyRouteStep,
  EcosystemCourseMetadataItem,
  EcosystemReadingProgress,
  EcosystemRecommendation,
  EcosystemVocabEntry,
  WeakPointCategory,
  WeakPointInsight,
} from "./ecosystem/types";
export { buildEcosystemRecommendations } from "./ecosystem/recommendations";
export { buildWeakPointInsights } from "./ecosystem/weak-points";
export { buildDailyRoute } from "./ecosystem/daily-route";
