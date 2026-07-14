/**
 * @file srs-summary.ts
 * @description Single-pass SRS summary helpers for dashboard/review performance.
 */

import { SRSState } from "@/lib/srs";

/**
 * SRS memory metrics.
 */
export interface SrsMemorySummary {
  /** Count of active items. */
  active: number;
  /** Count of items due for review. */
  due: number;
  /** Count of mastered items (interval >= 30 days). */
  master: number;
  /** Count of intermediate items (interval >= 7 days). */
  intermediate: number;
  /** Count of learning items (repetition > 1, interval < 7). */
  learning: number;
  /** Count of new items (repetition <= 1). */
  new: number;
  /** Count of items with critical ease (< 1.7). */
  easeCritical: number;
  /** Count of items with fragile ease (< 2.2). */
  easeFragile: number;
  /** Count of items with stable ease (< 2.7). */
  easeStable: number;
  /** Count of items with master ease (>= 2.7). */
  easeMaster: number;
}

/**
 * Compute SRS metrics from state map.
 * @param srs SRS state map.
 * @param now Current timestamp.
 * @returns Metrics summary.
 */
export function summarizeSrs(
  srs: Record<string, SRSState> | null | undefined,
  now = Date.now()
): SrsMemorySummary {
  const summary: SrsMemorySummary = {
    active: 0,
    due: 0,
    master: 0,
    intermediate: 0,
    learning: 0,
    new: 0,
    easeCritical: 0,
    easeFragile: 0,
    easeStable: 0,
    easeMaster: 0,
  };

  // Return empty if no data.
  if (!srs) return summary;

  for (const id in srs) {
    const state = srs[id];
    // Skip deleted items.
    if (state.isDeleted) continue;

    summary.active += 1;
    // Increment due count if review time passed.
    if (state.nextReview <= now) summary.due += 1;

    // Group by interval and repetition count.
    if (state.interval >= 30) {
      summary.master += 1;
    } else if (state.repetition > 1 && state.interval >= 7) {
      summary.intermediate += 1;
    } else if (state.repetition > 1) {
      summary.learning += 1;
    } else {
      summary.new += 1;
    }

    // Group by ease factor thresholds.
    if (state.easeFactor < 1.7) {
      summary.easeCritical += 1;
    } else if (state.easeFactor < 2.2) {
      summary.easeFragile += 1;
    } else if (state.easeFactor < 2.7) {
      summary.easeStable += 1;
    } else {
      summary.easeMaster += 1;
    }
  }

  return summary;
}