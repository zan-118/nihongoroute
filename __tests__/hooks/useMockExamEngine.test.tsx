import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useMockExamEngine } from "@/components/features/exams/mock-engine/useMockExamEngine";
import { useUserStore } from "@/store/useUserStore";

// Mock sonner
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockExamData = {
  title: "JLPT N5 Mock Exam",
  timeLimit: 50, // 50 menit
  passingScore: 90,
  questions: [
    { _key: "q1", question: "Q1", options: ["A", "B", "C", "D"], correctAnswer: 1, section: "vocabulary" },
    { _key: "q2", question: "Q2", options: ["A", "B", "C", "D"], correctAnswer: 2, section: "vocabulary" },
    { _key: "q3", question: "Q3", options: ["A", "B", "C", "D"], correctAnswer: 0, section: "grammar" },
  ],
};

describe("useMockExamEngine Hook", () => {
  beforeEach(() => {
    useUserStore.getState().resetUser();
    vi.useFakeTimers();
    // Mock scroll to prevent errors
    window.scrollTo = vi.fn();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("memiliki inisialisasi state awal ujian yang benar", () => {
    const { result } = renderHook(() => useMockExamEngine(mockExamData));

    expect(result.current.gameState).toBe("intro");
    expect(result.current.timeLeft).toBe(50 * 60); // dalam detik
    expect(result.current.answers).toEqual({});
    expect(result.current.currentQuestionIndex).toBe(0);
  });

  it("handleAnswer menyimpan indeks opsi pilihan dengan benar", () => {
    const { result } = renderHook(() => useMockExamEngine(mockExamData));

    act(() => {
      result.current.setGameState("playing");
    });

    act(() => {
      result.current.handleAnswer(1);
    });

    expect(result.current.answers["q1"]).toBe(1);
  });

  it("nextQuestion berpindah ke soal berikutnya dalam seksi yang sama", () => {
    const { result } = renderHook(() => useMockExamEngine(mockExamData));

    act(() => {
      result.current.setGameState("playing");
    });

    act(() => {
      result.current.handleAnswer(1);
    });

    act(() => {
      result.current.nextQuestion();
    });

    // Soal kedua "q2" masih di seksi "vocabulary"
    expect(result.current.currentQuestionIndex).toBe(1);
    expect(result.current.pendingConfirm).toBeNull();
  });

  it("nextQuestion memicu konfirmasi Dialog (pendingConfirm) saat berpindah seksi", () => {
    const { result } = renderHook(() => useMockExamEngine(mockExamData));

    act(() => {
      result.current.setGameState("playing");
    });

    // Mulai dari soal index 1 ("q2") yang merupakan akhir seksi "vocabulary"
    act(() => {
      result.current.goToQuestion(1);
    });

    act(() => {
      result.current.nextQuestion();
    });

    // Pemicuan pendingConfirm = "section" untuk konfirmasi perpindahan seksi ke "grammar"
    expect(result.current.pendingConfirm).toBe("section");
    expect(result.current.currentQuestionIndex).toBe(1); // tetap di index 1 sebelum konfirmasi

    // Lakukan konfirmasi pending action
    act(() => {
      result.current.confirmPendingAction();
    });

    // Setelah konfirmasi, berpindah ke soal pertama di seksi "grammar"
    expect(result.current.currentQuestionIndex).toBe(2);
    expect(result.current.pendingConfirm).toBeNull();
  });

  it("finishExam menghitung skor dan memberikan XP reward sesuai performa", () => {
    const { result } = renderHook(() => useMockExamEngine(mockExamData));

    act(() => {
      result.current.setGameState("playing");
    });

    // Jawab benar semua
    act(() => {
      result.current.handleAnswer(1); // Benar untuk Q1 (vocabulary)
    });

    // Go to Q2 (vocabulary)
    act(() => {
      result.current.nextQuestion();
    });
    act(() => {
      result.current.handleAnswer(2); // Benar untuk Q2 (vocabulary)
    });

    // Go to Q3 (grammar, across section)
    act(() => {
      result.current.nextQuestion();
    });
    // Menyetujui perpindahan seksi
    act(() => {
      result.current.confirmPendingAction();
    });
    act(() => {
      result.current.handleAnswer(0); // Benar untuk Q3 (grammar)
    });

    act(() => {
      result.current.finishExam();
    });

    expect(result.current.gameState).toBe("result");

    const scoreData = result.current.calculateScore();
    // 3/3 benar = 180 skor akhir
    expect(scoreData.finalScore).toBe(180);
    expect(scoreData.correctCount).toBe(3);

    // Verifikasi XP (3 * 10 XP + 50 bonus pass = 80 XP)
    expect(useUserStore.getState().xp).toBe(80);
  });
});
