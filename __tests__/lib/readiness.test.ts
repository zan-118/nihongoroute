import { describe, expect, it } from "vitest";
import { calculateJlptReadiness, detectJlptLevel } from "@/lib/readiness";
import type { SRSState } from "@/lib/srs";

const DAY = 24 * 60 * 60 * 1000;

function makeCard(overrides: Partial<SRSState> = {}): SRSState {
  return {
    interval: 30,
    repetition: 4,
    easeFactor: 2.8,
    nextReview: Date.now() + DAY,
    updatedAt: Date.now(),
    ...overrides,
  };
}

function makeStudyDays(count: number, now: Date) {
  const days: Record<string, number> = {};

  for (let i = 0; i < count; i += 1) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);
    days[date.toISOString().split("T")[0]] = 1;
  }

  return days;
}

describe("readiness helpers", () => {
  it("mendeteksi level JLPT dari judul atau slug", () => {
    expect(detectJlptLevel("Kelas JLPT N5")).toBe("n5");
    expect(detectJlptLevel("n 2 advanced")).toBe("n2");
    expect(detectJlptLevel("JFT A2")).toBeNull();
  });

  it("memberi skor tinggi dan rekomendasi simulasi jika sinyal belajar kuat", () => {
    const now = new Date("2026-06-09T12:00:00.000Z");
    const lessons = Array.from({ length: 10 }, (_, index) => ({
      _id: `lesson-${index}`,
      title: `Lesson ${index}`,
      slug: `lesson-${index}`,
    }));
    const completedLessons = Object.fromEntries(
      lessons.map((lesson) => [
        lesson._id,
        { completedAt: now.getTime(), updatedAt: now.getTime(), isDeleted: false },
      ])
    );
    const srs = Object.fromEntries(
      Array.from({ length: 150 }, (_, index) => [`card-${index}`, makeCard()])
    );

    const readiness = calculateJlptReadiness({
      courseMetadata: [{ _id: "n5", title: "JLPT N5", slug: "n5", lessons }],
      completedLessons,
      srs,
      streak: 7,
      todayReviewCount: 20,
      studyDays: makeStudyDays(7, now),
      now,
    });

    expect(readiness.score).toBe(100);
    expect(readiness.statusLabel).toBe("Siap Simulasi");
    expect(readiness.confidenceLabel).toBe("Tinggi");
    expect(readiness.actions[0]).toMatchObject({ id: "exam", href: "/exams" });
  });

  it("memberi rekomendasi fondasi saat progres dan bank memori masih kosong", () => {
    const readiness = calculateJlptReadiness({
      courseMetadata: [{ _id: "n5", title: "JLPT N5", slug: "n5", lessonCount: 10 }],
      completedLessons: {},
      srs: {},
      streak: 0,
      todayReviewCount: 0,
      studyDays: {},
      now: new Date("2026-06-09T12:00:00.000Z"),
    });

    expect(readiness.score).toBe(0);
    expect(readiness.statusLabel).toBe("Mulai Fondasi");
    expect(readiness.actions.map((action) => action.id)).toEqual(["course", "library", "routine"]);
  });

  it("mengabaikan lesson tombstone ketika menghitung progres kurikulum", () => {
    const now = Date.now();

    const readiness = calculateJlptReadiness({
      courseMetadata: [
        {
          _id: "n5",
          title: "JLPT N5",
          slug: "n5",
          lessons: [
            { _id: "lesson-a", title: "A", slug: "a" },
            { _id: "lesson-b", title: "B", slug: "b" },
          ],
        },
      ],
      completedLessons: {
        "lesson-a": { completedAt: now, updatedAt: now, isDeleted: true },
        "lesson-b": { completedAt: now, updatedAt: now, isDeleted: false },
      },
      srs: {},
      streak: 0,
      todayReviewCount: 0,
      studyDays: {},
    });

    expect(readiness.metrics.find((metric) => metric.id === "curriculum")?.score).toBe(50);
  });
});
