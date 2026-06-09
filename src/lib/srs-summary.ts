/**
 * @file srs-summary.ts
 * @description Single-pass SRS summary helpers for dashboard/review performance.
 */

import { SRSState } from "@/lib/srs";

export interface SrsMemorySummary {
  active: number;
  due: number;
  master: number;
  intermediate: number;
  learning: number;
  new: number;
  easeCritical: number;
  easeFragile: number;
  easeStable: number;
  easeMaster: number;
}

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

  if (!srs) return summary;

  for (const id in srs) {
    const state = srs[id];
    if (state.isDeleted) continue;

    summary.active += 1;
    if (state.nextReview <= now) summary.due += 1;

    if (state.interval >= 30) {
      summary.master += 1;
    } else if (state.repetition > 1 && state.interval >= 7) {
      summary.intermediate += 1;
    } else if (state.repetition > 1) {
      summary.learning += 1;
    } else {
      summary.new += 1;
    }

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
