import { describe, expect, it } from "vitest";
import { buildLessonUpdates, buildSrsUpdates, getSrsStatus } from "@/lib/cloud-sync-payload";
import { SRSState } from "@/lib/srs";

const now = new Date("2026-06-09T01:00:00.000Z");

describe("cloud-sync-payload", () => {
  it("mengubah kartu SRS dirty menjadi payload RPC relasional", () => {
    const srs: Record<string, SRSState> = {
      "word-1": {
        repetition: 3,
        interval: 22,
        easeFactor: 2.75,
        nextReview: Date.parse("2026-06-12T00:00:00.000Z"),
        updatedAt: Date.parse("2026-06-09T00:30:00.000Z"),
        customMnemonic: "ingat sebagai contoh",
      },
    };

    expect(buildSrsUpdates(srs, new Set(["word-1"]), now)).toEqual([
      {
        word_id: "word-1",
        repetition: 3,
        interval: 22,
        ease_factor: 2.75,
        next_review: "2026-06-12T00:00:00.000Z",
        updated_at: "2026-06-09T00:30:00.000Z",
        status: "graduated",
        is_deleted: false,
        custom_mnemonic: "ingat sebagai contoh",
      },
    ]);
  });

  it("membangun payload delete jika dirty SRS tidak punya state lokal", () => {
    expect(buildSrsUpdates({}, new Set(["word-deleted"]), now)).toEqual([
      {
        word_id: "word-deleted",
        repetition: 0,
        interval: 1,
        ease_factor: 2.5,
        next_review: "2026-06-09T01:00:00.000Z",
        updated_at: "2026-06-09T01:00:00.000Z",
        status: "learning",
        is_deleted: true,
        custom_mnemonic: null,
      },
    ]);
  });

  it("mendeteksi status SRS dari interval kartu", () => {
    const baseState: SRSState = {
      repetition: 0,
      interval: 1,
      easeFactor: 2.5,
      nextReview: now.getTime(),
      updatedAt: now.getTime(),
    };

    expect(getSrsStatus({ ...baseState, interval: 1 })).toBe("learning");
    expect(getSrsStatus({ ...baseState, interval: 2 })).toBe("reviewing");
    expect(getSrsStatus({ ...baseState, interval: 22 })).toBe("graduated");
  });

  it("mengubah completedLessons dirty menjadi payload RPC relasional", () => {
    const completedAt = Date.parse("2026-06-08T10:00:00.000Z");
    const updatedAt = Date.parse("2026-06-09T00:00:00.000Z");

    expect(
      buildLessonUpdates(
        {
          "lesson-1": {
            completedAt,
            updatedAt,
            isDeleted: false,
          },
        },
        new Set(["lesson-1"]),
        now
      )
    ).toEqual([
      {
        lesson_id: "lesson-1",
        is_completed: true,
        completed_at: "2026-06-08T10:00:00.000Z",
        updated_at: "2026-06-09T00:00:00.000Z",
        is_deleted: false,
      },
    ]);
  });

  it("membangun payload delete jika dirty lesson tidak punya state lokal", () => {
    expect(buildLessonUpdates({}, new Set(["lesson-deleted"]), now)).toEqual([
      {
        lesson_id: "lesson-deleted",
        is_completed: false,
        completed_at: "2026-06-09T01:00:00.000Z",
        updated_at: "2026-06-09T01:00:00.000Z",
        is_deleted: true,
      },
    ]);
  });
});
