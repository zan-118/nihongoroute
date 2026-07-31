import { describe, it, expect } from "vitest";
import { ConsolidatedExamSessionEngine } from "@/lib/exams/exam-session-engine";
import type { ExamQuestion } from "@/features/exams/components/mock-engine/types";

const MOCK_QUIZ_QUESTIONS: ExamQuestion[] = [
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
];

describe("ConsolidatedExamSessionEngine Seam", () => {
  it("harus menginisialisasi sesi dan mengembalikan soal aktif", () => {
    const engine = new ConsolidatedExamSessionEngine({ questions: MOCK_QUIZ_QUESTIONS });
    expect(engine.getCurrentIndex()).toBe(0);
    expect(engine.getTotalQuestions()).toBe(2);
    expect(engine.getCurrentQuestion()?._key).toBe("q1");
    expect(engine.isAnsweredCurrent()).toBe(false);
  });

  it("harus memproses pemilihan jawaban dan navigasi ke soal berikutnya", () => {
    const engine = new ConsolidatedExamSessionEngine({ questions: MOCK_QUIZ_QUESTIONS });
    
    expect(engine.selectAnswer(0)).toBe(true);
    expect(engine.isAnsweredCurrent()).toBe(true);
    expect(engine.getSelectedOptionCurrent()).toBe(0);

    const hasNext = engine.next();
    expect(hasNext).toBe(true);
    expect(engine.getCurrentIndex()).toBe(1);
    expect(engine.getCurrentQuestion()?._key).toBe("q2");
  });

  it("harus menghitung skor dan kalkulasi XP kuis dengan benar", () => {
    const engine = new ConsolidatedExamSessionEngine({ questions: MOCK_QUIZ_QUESTIONS });
    engine.selectAnswer(0); // correct for q1
    engine.next();
    engine.selectAnswer(1); // correct for q2

    const scoreRes = engine.calculateScore();
    expect(scoreRes.correctCount).toBe(2);

    const xpRes = engine.calculateQuizXP(scoreRes.correctCount, engine.getTotalQuestions());
    // 2 * 25 = 50 + 50 (bonus perfect score) = 100
    expect(xpRes.baseXP).toBe(50);
    expect(xpRes.bonusXP).toBe(50);
    expect(xpRes.totalXP).toBe(100);
  });
});
