import { describe, expect, it } from "vitest";
import type { SRSState } from "@/lib/srs";
import {
  getWeakPointSummary,
  getWeaknessScore,
  selectWeakPointCandidates,
} from "@/lib/weak-points";

const DAY = 24 * 60 * 60 * 1000;
const NOW = new Date("2026-06-09T12:00:00.000Z").getTime();

function card(overrides: Partial<SRSState>): SRSState {
  return {
    interval: 10,
    repetition: 3,
    easeFactor: 2.5,
    nextReview: NOW + DAY,
    updatedAt: NOW,
    ...overrides,
  };
}

describe("weak-points helpers", () => {
  it("memprioritaskan kartu critical dan overdue", () => {
    const candidates = selectWeakPointCandidates(
      {
        stable: card({ easeFactor: 2.7, nextReview: NOW + DAY * 3 }),
        dueOnly: card({ easeFactor: 2.4, nextReview: NOW - DAY }),
        fragile: card({ easeFactor: 2.05, nextReview: NOW + DAY }),
        criticalOverdue: card({ easeFactor: 1.45, nextReview: NOW - DAY * 4 }),
      },
      { now: NOW, limit: 3 }
    );

    expect(candidates.map((item) => item.id)).toEqual(["criticalOverdue", "dueOnly", "fragile"]);
    expect(candidates[0].reasons).toEqual(expect.arrayContaining(["critical", "overdue"]));
  });

  it("mengabaikan kartu yang dihapus dan menghormati limit", () => {
    const candidates = selectWeakPointCandidates(
      {
        deleted: card({ easeFactor: 1.3, isDeleted: true }),
        a: card({ easeFactor: 1.9 }),
        b: card({ nextReview: NOW }),
      },
      { now: NOW, limit: 1 }
    );

    expect(candidates).toHaveLength(1);
    expect(candidates[0].id).not.toBe("deleted");
  });

  it("menghasilkan ringkasan alasan kelemahan", () => {
    const candidates = selectWeakPointCandidates(
      {
        critical: card({ easeFactor: 1.4 }),
        fragile: card({ easeFactor: 2.0 }),
        dueLearning: card({ interval: 1, repetition: 0, nextReview: NOW }),
      },
      { now: NOW }
    );

    expect(getWeakPointSummary(candidates)).toEqual({
      critical: 1,
      fragile: 1,
      due: 1,
      learning: 1,
    });
  });

  it("memberi skor lebih besar pada kartu overdue daripada kartu due biasa", () => {
    expect(getWeaknessScore(card({ nextReview: NOW - DAY * 3 }), NOW)).toBeGreaterThan(
      getWeaknessScore(card({ nextReview: NOW }), NOW)
    );
  });
});
