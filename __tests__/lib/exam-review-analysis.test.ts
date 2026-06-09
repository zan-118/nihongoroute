import { describe, expect, it } from "vitest";
import { analyzeExamReview } from "@/lib/exam-review-analysis";
import type { ExamData } from "@/components/features/exams/mock-engine/types";

const exam: ExamData = {
  id: "exam-1",
  title: "JLPT N5 Mock",
  timeLimit: 90,
  passingScore: 90,
  questions: [
    {
      _key: "q1",
      section: "vocabulary",
      questionText: "A",
      options: ["a", "b", "c", "d"],
      correctAnswer: 1,
    },
    {
      _key: "q2",
      section: "grammar",
      questionText: "B",
      options: ["a", "b", "c", "d"],
      correctAnswer: 2,
    },
    {
      _key: "q3",
      section: "grammar",
      questionText: "C",
      options: ["a", "b", "c", "d"],
      correctAnswer: 3,
    },
    {
      _key: "q4",
      section: "listening",
      questionText: "D",
      options: ["a", "b", "c", "d"],
      correctAnswer: 0,
    },
  ],
};

describe("analyzeExamReview", () => {
  it("menghitung benar, salah, tidak dijawab, dan akurasi", () => {
    const analysis = analyzeExamReview(exam, {
      q1: 1,
      q2: 0,
      q4: 0,
    });

    expect(analysis.correctCount).toBe(2);
    expect(analysis.wrongCount).toBe(1);
    expect(analysis.unansweredCount).toBe(1);
    expect(analysis.accuracy).toBe(50);
    expect(analysis.mistakes.map((item) => item.question._key)).toEqual(["q2", "q3"]);
  });

  it("menentukan section terlemah dan rekomendasi utama", () => {
    const analysis = analyzeExamReview(exam, {
      q1: 1,
      q2: 0,
      q3: 1,
      q4: 0,
    });

    expect(analysis.weakestSection?.section).toBe("grammar");
    expect(analysis.weakestSection?.accuracy).toBe(0);
    expect(analysis.actions[0]).toMatchObject({
      id: "grammar",
      href: "/library/grammar",
    });
    expect(analysis.actions.some((action) => action.id === "weak-points")).toBe(true);
  });

  it("tetap memberi aksi flashcards saat semua jawaban benar", () => {
    const analysis = analyzeExamReview(exam, {
      q1: 1,
      q2: 2,
      q3: 3,
      q4: 0,
    });

    expect(analysis.mistakes).toHaveLength(0);
    expect(analysis.actions.some((action) => action.id === "flashcards")).toBe(true);
  });
});
