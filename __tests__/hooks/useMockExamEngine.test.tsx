import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useMockExamEngine } from "@/components/features/exams/mock-engine/useMockExamEngine";
import { ExamData } from "@/components/features/exams/mock-engine/types";

// Mock window.scrollTo
vi.stubGlobal("scrollTo", vi.fn());

const mockExam: ExamData = {
  _id: "exam-1",
  title: "JLPT N5 Mock Test",
  timeLimit: 30, // 30 menit
  passingScore: 100,
  questions: [
    { _key: "q1", section: "vocabulary", questionText: "Apa arti 犬?", options: ["Kucing", "Anjing", "Burung", "Ikan"], correctAnswer: 1 },
    { _key: "q2", section: "grammar", questionText: "どこに行きますか?", options: ["Di mana pergi?", "Ke mana pergi?", "Kapan pergi?", "Siapa pergi?"], correctAnswer: 1 },
    { _key: "q3", section: "reading", questionText: "読解テスト", options: ["A", "B", "C", "D"], correctAnswer: 2 },
    { _key: "q4", section: "vocabulary", questionText: "Apa arti 猫?", options: ["Kucing", "Anjing", "Kuda", "Sapi"], correctAnswer: 0 },
  ],
};

describe("useMockExamEngine", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("memulai di state 'intro'", () => {
    const { result } = renderHook(() => useMockExamEngine(mockExam));
    expect(result.current.gameState).toBe("intro");
  });

  it("menginisialisasi timer berdasarkan timeLimit (dalam detik)", () => {
    const { result } = renderHook(() => useMockExamEngine(mockExam));
    expect(result.current.timeLeft).toBe(30 * 60); // 1800 detik
  });

  it("menampilkan soal pertama sebagai activeQuestion", () => {
    const { result } = renderHook(() => useMockExamEngine(mockExam));
    expect(result.current.activeQuestion._key).toBe("q1");
  });

  it("menyimpan jawaban saat handleAnswer dipanggil", () => {
    const { result } = renderHook(() => useMockExamEngine(mockExam));

    act(() => { result.current.handleAnswer(1); }); // pilih option index 1

    expect(result.current.answers["q1"]).toBe(1);
  });

  it("bisa mengganti jawaban di soal yang sama", () => {
    const { result } = renderHook(() => useMockExamEngine(mockExam));

    act(() => { result.current.handleAnswer(0); });
    act(() => { result.current.handleAnswer(2); });

    expect(result.current.answers["q1"]).toBe(2);
  });

  it("navigasi ke soal berikutnya", () => {
    const { result } = renderHook(() => useMockExamEngine(mockExam));

    act(() => { result.current.nextQuestion(); });

    expect(result.current.currentQuestionIndex).toBe(1);
    expect(result.current.activeQuestion._key).toBe("q2");
  });

  it("navigasi ke soal sebelumnya", () => {
    const { result } = renderHook(() => useMockExamEngine(mockExam));

    act(() => { result.current.nextQuestion(); }); // ke index 1
    act(() => { result.current.prevQuestion(); }); // kembali ke index 0

    expect(result.current.currentQuestionIndex).toBe(0);
  });

  it("tidak bisa mundur dari soal pertama", () => {
    const { result } = renderHook(() => useMockExamEngine(mockExam));

    act(() => { result.current.prevQuestion(); });

    expect(result.current.currentQuestionIndex).toBe(0);
  });

  it("tidak bisa maju melampaui soal terakhir", () => {
    const { result } = renderHook(() => useMockExamEngine(mockExam));

    // Maju ke soal terakhir
    act(() => { result.current.nextQuestion(); });
    act(() => { result.current.nextQuestion(); });
    act(() => { result.current.nextQuestion(); }); // sekarang index 3 (terakhir)
    act(() => { result.current.nextQuestion(); }); // coba maju lagi

    expect(result.current.currentQuestionIndex).toBe(3);
  });

  it("finishExam mengubah gameState ke 'result'", () => {
    const { result } = renderHook(() => useMockExamEngine(mockExam));

    act(() => { result.current.finishExam(); });

    expect(result.current.gameState).toBe("result");
  });

  // ========================================
  // calculateScore
  // ========================================
  describe("calculateScore", () => {
    it("menghitung skor sempurna (semua benar)", () => {
      const { result } = renderHook(() => useMockExamEngine(mockExam));

      // Jawab semua dengan benar
      act(() => { result.current.handleAnswer(1); }); // q1: correctAnswer=1 ✓
      act(() => { result.current.nextQuestion(); });
      act(() => { result.current.handleAnswer(1); }); // q2: correctAnswer=1 ✓
      act(() => { result.current.nextQuestion(); });
      act(() => { result.current.handleAnswer(2); }); // q3: correctAnswer=2 ✓
      act(() => { result.current.nextQuestion(); });
      act(() => { result.current.handleAnswer(0); }); // q4: correctAnswer=0 ✓

      const score = result.current.calculateScore();
      expect(score.correctCount).toBe(4);
      expect(score.finalScore).toBe(180); // 4/4 * 180 = 180
    });

    it("menghitung skor 0 saat semua salah", () => {
      const { result } = renderHook(() => useMockExamEngine(mockExam));

      // Jawab semua salah
      act(() => { result.current.handleAnswer(0); }); // q1: correctAnswer=1, pilih 0 ✗
      act(() => { result.current.nextQuestion(); });
      act(() => { result.current.handleAnswer(0); }); // q2: correctAnswer=1, pilih 0 ✗
      act(() => { result.current.nextQuestion(); });
      act(() => { result.current.handleAnswer(0); }); // q3: correctAnswer=2, pilih 0 ✗
      act(() => { result.current.nextQuestion(); });
      act(() => { result.current.handleAnswer(1); }); // q4: correctAnswer=0, pilih 1 ✗

      const score = result.current.calculateScore();
      expect(score.correctCount).toBe(0);
      expect(score.finalScore).toBe(0);
    });

    it("menghitung skor parsial dan breakdown per section", () => {
      const { result } = renderHook(() => useMockExamEngine(mockExam));

      act(() => { result.current.handleAnswer(1); }); // q1 vocab ✓
      act(() => { result.current.nextQuestion(); });
      act(() => { result.current.handleAnswer(0); }); // q2 grammar ✗
      act(() => { result.current.nextQuestion(); });
      act(() => { result.current.handleAnswer(2); }); // q3 reading ✓
      act(() => { result.current.nextQuestion(); });
      act(() => { result.current.handleAnswer(0); }); // q4 vocab ✓

      const score = result.current.calculateScore();
      expect(score.correctCount).toBe(3);
      expect(score.finalScore).toBe(Math.round((3 / 4) * 180)); // 135

      // Section breakdown
      expect(score.sectionBreakdown.vocabulary.correct).toBe(2);
      expect(score.sectionBreakdown.vocabulary.total).toBe(2);
      expect(score.sectionBreakdown.grammar.correct).toBe(0);
      expect(score.sectionBreakdown.grammar.total).toBe(1);
      expect(score.sectionBreakdown.reading.correct).toBe(1);
      expect(score.sectionBreakdown.reading.total).toBe(1);
    });

    it("menghitung skor 0 saat tidak ada jawaban", () => {
      const { result } = renderHook(() => useMockExamEngine(mockExam));
      const score = result.current.calculateScore();
      expect(score.correctCount).toBe(0);
      expect(score.finalScore).toBe(0);
    });
  });

  // ========================================
  // isTimeCritical
  // ========================================
  it("menandai isTimeCritical saat waktu < 5 menit", () => {
    const { result } = renderHook(() => useMockExamEngine({ ...mockExam, timeLimit: 4 }));
    // 4 menit = 240 detik, < 300 -> critical
    expect(result.current.isTimeCritical).toBe(true);
  });

  it("tidak menandai isTimeCritical saat waktu cukup", () => {
    const { result } = renderHook(() => useMockExamEngine(mockExam));
    // 30 menit = 1800 detik, > 300 -> not critical
    expect(result.current.isTimeCritical).toBe(false);
  });

  // ========================================
  // Timer countdown
  // ========================================
  it("menghitung mundur timer saat gameState = 'playing'", () => {
    const { result } = renderHook(() => useMockExamEngine(mockExam));

    act(() => { result.current.setGameState("playing"); });

    const initialTime = result.current.timeLeft;

    act(() => { vi.advanceTimersByTime(5000); }); // 5 detik

    expect(result.current.timeLeft).toBe(initialTime - 5);
  });

  it("tidak menghitung mundur saat gameState bukan 'playing'", () => {
    const { result } = renderHook(() => useMockExamEngine(mockExam));

    const initialTime = result.current.timeLeft;

    act(() => { vi.advanceTimersByTime(5000); });

    expect(result.current.timeLeft).toBe(initialTime);
  });
});
