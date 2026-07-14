/**
 * @file weak-points.ts
 * @description Helpers for ranking fragile SRS cards for targeted practice sessions.
 */

import type { SRSState } from "@/lib/srs";

/**
 * Candidate card for weak point practice.
 */
export interface WeakPointCandidate {
  id: string;
  easeFactor: number;
  interval: number;
  repetition: number;
  nextReview: number;
  weaknessScore: number;
  reasons: Array<"critical" | "fragile" | "due" | "overdue" | "learning">;
}

/**
 * Options to filter and limit weak point candidates.
 */
interface SelectWeakPointOptions {
  limit?: number;
  now?: number;
  easeThreshold?: number;
}

/**
 * Milliseconds in one day.
 */
const DAY = 24 * 60 * 60 * 1000;

/**
 * Restrict value to range.
 */
function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

/**
 * Determine why card is weak.
 */
function getWeaknessReasons(
  state: SRSState,
  now: number,
  easeThreshold: number
): WeakPointCandidate["reasons"] {
  const reasons: WeakPointCandidate["reasons"] = [];

  // Low ease factor indicates struggle
  if (state.easeFactor < 1.7) reasons.push("critical");
  else if (state.easeFactor < easeThreshold) reasons.push("fragile");

  // Check review schedule status
  if (state.nextReview <= now - DAY) reasons.push("overdue");
  else if (state.nextReview <= now) reasons.push("due");

  // Early stage cards are volatile
  if (state.repetition <= 1 || state.interval <= 3) reasons.push("learning");

  return reasons;
}

/**
 * Calculate weakness score. Higher score means weaker card.
 */
export function getWeaknessScore(
  state: SRSState,
  now = Date.now(),
  easeThreshold = 2.2
) {
  // Low ease factor adds up to 55 points
  const easePressure = clamp(((easeThreshold - state.easeFactor) / 0.9) * 55, 0, 55);
  // Overdue days add up to 28 points
  const overdueDays = Math.max(0, Math.floor((now - state.nextReview) / DAY));
  const overduePressure = clamp(overdueDays * 8, 0, 28);
  // Due status adds 12 points
  const duePressure = state.nextReview <= now ? 12 : 0;
  // Early learning stage adds 10 points
  const learningPressure = state.repetition <= 1 || state.interval <= 3 ? 10 : 0;

  return Math.round(easePressure + overduePressure + duePressure + learningPressure);
}

/**
 * Find and rank worst performing cards.
 */
export function selectWeakPointCandidates(
  srs: Record<string, SRSState> | null | undefined,
  options: SelectWeakPointOptions = {}
) {
  const limit = options.limit ?? 12;
  const now = options.now ?? Date.now();
  const easeThreshold = options.easeThreshold ?? 2.2;
  const candidates: WeakPointCandidate[] = [];

  if (!srs || limit <= 0) return candidates;

  // Filter and score active cards
  for (const [id, state] of Object.entries(srs)) {
    if (state.isDeleted) continue;

    const reasons = getWeaknessReasons(state, now, easeThreshold);
    if (reasons.length === 0) continue;

    candidates.push({
      id,
      easeFactor: state.easeFactor,
      interval: state.interval,
      repetition: state.repetition,
      nextReview: state.nextReview,
      weaknessScore: getWeaknessScore(state, now, easeThreshold),
      reasons,
    });
  }

  // Sort by score descending, then ease factor ascending, then review date ascending
  return candidates
    .sort((a, b) => {
      if (b.weaknessScore !== a.weaknessScore) return b.weaknessScore - a.weaknessScore;
      if (a.easeFactor !== b.easeFactor) return a.easeFactor - b.easeFactor;
      return a.nextReview - b.nextReview;
    })
    .slice(0, limit);
}

/**
 * Count candidates by weakness category.
 */
export function getWeakPointSummary(candidates: WeakPointCandidate[]) {
  return candidates.reduce(
    (summary, item) => {
      if (item.reasons.includes("critical")) summary.critical += 1;
      if (item.reasons.includes("fragile")) summary.fragile += 1;
      if (item.reasons.includes("due") || item.reasons.includes("overdue")) summary.due += 1;
      if (item.reasons.includes("learning")) summary.learning += 1;
      return summary;
    },
    { critical: 0, fragile: 0, due: 0, learning: 0 }
  );
}