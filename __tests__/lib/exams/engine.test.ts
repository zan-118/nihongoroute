import { describe, it, expect } from "vitest";
import {
  buildQuestionSections,
  shouldDisablePreviousButton,
  performScoreCalculation,
  getErrorMessage,
  ExamSessionAggregate,
} from "@/lib/exams/mock-exam-engine";
import type { ExamQuestion } from "@/components/features/exams/mock-engine/types";

const MOCK_QUESTIONS: ExamQuestion[] = [
  {
    _key: "q1",
    section: "vocabulary",
    title: "Vocab 1",
    options: ["A", "B"],
    correctAnswer: 0,
  },
  {
    _key: "q2",
    section: "vocabulary",
    title: "Vocab 2",
    options: ["C", "D"],
    correctAnswer: 1,
  },
  {
    _key: "q3",
    section: "listening",
    title: "Listening 1",
    options: ["E", "F"],
    correctAnswer: 0,
    audioUrl: "/audio/l1.mp3",
  },
];

describe("Mock Exam Engine Seam", () => {
  describe("buildQuestionSections", () => {
    it("harus mengelompokkan indeks soal berdasarkan section", () => {
      const sections = buildQuestionSections(MOCK_QUESTIONS);
      expect(sections.vocabulary).toEqual([0, 1]);
      expect(sections.listening).toEqual([2]);
    });
  });

  describe("shouldDisablePreviousButton", () => {
    it("harus menonaktifkan tombol Back pada soal pertama", () => {
      expect(shouldDisablePreviousButton(0, MOCK_QUESTIONS, false)).toBe(true);
    });

    it("harus mengizinkan Back pada section non-listening jika bukan Choukai global", () => {
      expect(shouldDisablePreviousButton(1, MOCK_QUESTIONS, false)).toBe(false);
    });

    it("harus menonaktifkan Back pada soal section listening", () => {
      expect(shouldDisablePreviousButton(2, MOCK_QUESTIONS, false)).toBe(true);
    });
  });

  describe("performScoreCalculation", () => {
    it("harus menghitung skor ujian dan status kelulusan dengan benar", () => {
      const answers = { q1: 0, q2: 1, q3: 0 };
      const res = performScoreCalculation(MOCK_QUESTIONS, answers, 90);
      expect(res.correctCount).toBe(3);
      expect(res.isPassed).toBe(true);
      expect(res.failedSection).toBe(false);
    });
  });

  describe("getErrorMessage", () => {
    it("harus mengekstrak pesan error bertipe Error", () => {
      expect(getErrorMessage(new Error("Timeout"), "Fallback")).toBe("Timeout");
      expect(getErrorMessage("String error", "Fallback")).toBe("Fallback");
    });
  });

  describe("ExamSessionAggregate", () => {
    it("harus menginisialisasi state aggregate dengan benar", () => {
      const aggregate = new ExamSessionAggregate({ questions: MOCK_QUESTIONS });
      expect(aggregate.getCurrentIndex()).toBe(0);
      expect(aggregate.getActiveQuestion()?._key).toBe("q1");
      expect(aggregate.isPreviousDisabled()).toBe(true);
    });

    it("harus mencatat jawaban dan menandai status dirty", () => {
      const aggregate = new ExamSessionAggregate({ questions: MOCK_QUESTIONS });
      expect(aggregate.isDirty()).toBe(false);

      const changed = aggregate.setAnswer("q1", 0);
      expect(changed).toBe(true);
      expect(aggregate.isDirty()).toBe(true);
      expect(aggregate.getAnswers()).toEqual({ q1: 0 });

      // Menyetel jawaban yang sama tidak boleh memicu status dirty ulang
      aggregate.clearDirtyFlag();
      const same = aggregate.setAnswer("q1", 0);
      expect(same).toBe(false);
      expect(aggregate.isDirty()).toBe(false);
    });

    it("harus mengelola penandaan (flag) soal", () => {
      const aggregate = new ExamSessionAggregate({ questions: MOCK_QUESTIONS });
      expect(aggregate.toggleFlag("q1")).toBe(true);
      expect(aggregate.getFlagged()).toEqual({ q1: true });
      expect(aggregate.toggleFlag("q1")).toBe(false);
      expect(aggregate.getFlagged()).toEqual({ q1: false });
    });

    it("harus mengevaluasi navigasi dan aturan seksi listening", () => {
      const aggregate = new ExamSessionAggregate({ questions: MOCK_QUESTIONS });
      aggregate.setCurrentIndex(1);
      expect(aggregate.isPreviousDisabled()).toBe(false);

      aggregate.setCurrentIndex(2); // Seksi listening
      expect(aggregate.isPreviousDisabled()).toBe(true);
    });

    it("harus menghitung hasil ujian akhir melalui aggregate", () => {
      const aggregate = new ExamSessionAggregate({
        questions: MOCK_QUESTIONS,
        answers: { q1: 0, q2: 1, q3: 0 },
        passingScore: 90,
      });

      const res = aggregate.calculateResult();
      expect(res.correctCount).toBe(3);
      expect(res.isPassed).toBe(true);
    });
  });
});

