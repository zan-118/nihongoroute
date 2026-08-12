import { describe, it, expect } from "vitest";
import {
  getAccuracyTone,
  getQuestionBorderClass,
  getQuestionStatus,
  getSourceHref,
  getSrsStatusLabel,
  ACTION_ICONS,
} from "@/features/exams/components/mock-engine/review/review-utils";
import type { ExamReviewQuestionInsight } from "@/lib/learning/exam-review-analysis";

function makeInsight(overrides: Partial<ExamReviewQuestionInsight> = {}): ExamReviewQuestionInsight {
  return {
    question: {
      _key: "q1",
      section: "vocabulary",
      options: ["a", "b"],
      correctAnswer: 0,
    },
    index: 0,
    isAnswered: true,
    isCorrect: true,
    ...overrides,
  };
}

describe("getAccuracyTone", () => {
  it("mengembalikan tone sukses untuk akurasi >= 70", () => {
    expect(getAccuracyTone(85)).toContain("text-success");
  });

  it("mengembalikan tone warning untuk 45-69", () => {
    expect(getAccuracyTone(50)).toContain("text-warning");
  });

  it("mengembalikan tone destructive untuk < 45", () => {
    expect(getAccuracyTone(20)).toContain("text-destructive");
  });
});

describe("getQuestionBorderClass", () => {
  it("sukses → border-success", () => {
    expect(getQuestionBorderClass(makeInsight())).toBe("border-success/25");
  });

  it("tidak dijawab → border-warning", () => {
    expect(
      getQuestionBorderClass(makeInsight({ isAnswered: false, isCorrect: false }))
    ).toBe("border-warning/30");
  });

  it("salah → border-destructive", () => {
    expect(
      getQuestionBorderClass(makeInsight({ isCorrect: false }))
    ).toBe("border-destructive/25");
  });
});

describe("getQuestionStatus", () => {
  it("menandai benar", () => {
    const status = getQuestionStatus(makeInsight());
    expect(status.label).toBe("Benar");
    expect(status.className).toContain("text-success");
  });

  it("menandai kosong", () => {
    const status = getQuestionStatus(
      makeInsight({ isAnswered: false, isCorrect: false })
    );
    expect(status.label).toBe("Kosong");
    expect(status.className).toContain("text-warning");
  });

  it("menandai salah", () => {
    const status = getQuestionStatus(makeInsight({ isCorrect: false }));
    expect(status.label).toBe("Salah");
    expect(status.className).toContain("text-destructive");
  });
});

describe("getSourceHref", () => {
  it("membangun URL per tipe sumber", () => {
    expect(getSourceHref("vocab", "abc")).toBe("/library/vocab/abc");
    expect(getSourceHref("kanji", "k1")).toBe("/library/kanji/k1");
    expect(getSourceHref("reading", "r1")).toBe("/library/reading/r1");
    expect(getSourceHref("listening", "l1")).toBe("/library/listening/l1");
    expect(getSourceHref("grammar", "g1")).toBe("/library/grammar/g1");
  });

  it("meng-encode ID dengan karakter khusus", () => {
    expect(getSourceHref("vocab", "a b/c")).toBe("/library/vocab/a%20b%2Fc");
  });

  it("mengembalikan null tanpa sumber", () => {
    expect(getSourceHref()).toBeNull();
    expect(getSourceHref("vocab", null)).toBeNull();
    expect(getSourceHref(null, "abc")).toBeNull();
  });
});

describe("getSrsStatusLabel", () => {
  it("null bila jawaban benar", () => {
    expect(getSrsStatusLabel(makeInsight())).toBeNull();
  });

  it("null bila tidak ada sumber", () => {
    expect(
      getSrsStatusLabel(makeInsight({ isCorrect: false }))
    ).toBeNull();
  });

  it("label SRS otomatis untuk vocab salah", () => {
    const insight = makeInsight({
      isCorrect: false,
      question: {
        _key: "q1",
        section: "vocabulary",
        options: ["a", "b"],
        correctAnswer: 0,
        sourceType: "vocab",
        sourceId: "v1",
      },
    });
    expect(getSrsStatusLabel(insight)).toBe("Masuk SRS otomatis");
  });

  it("label weak point untuk sumber non-vocab", () => {
    const insight = makeInsight({
      isCorrect: false,
      question: {
        _key: "q1",
        section: "grammar",
        options: ["a", "b"],
        correctAnswer: 0,
        sourceType: "grammar",
        sourceId: "g1",
      },
    });
    expect(getSrsStatusLabel(insight)).toBe("Masuk weak point");
  });
});

describe("ACTION_ICONS", () => {
  it("memetakan semua action id", () => {
    for (const id of ["weak-points", "flashcards", "listening", "reading", "grammar", "vocab"]) {
      expect(ACTION_ICONS[id as keyof typeof ACTION_ICONS]).toBeDefined();
    }
  });
});
