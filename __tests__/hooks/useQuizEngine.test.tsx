import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useQuizEngine } from "@/components/features/exams/quiz-engine/useQuizEngine";
import { useSRSStore } from "@/store/useSRSStore";
import { useUserStore } from "@/store/useUserStore";

// Mock audio
vi.mock("@/lib/audio", () => ({
  sounds: {
    playSuccess: vi.fn(),
    playError: vi.fn(),
    playPop: vi.fn(),
  },
}));

const mockQuestions = [
  { id: "q-1", text: "Apa arti dari 'neko'?", options: ["Kucing", "Anjing", "Burung", "Ikan"], answer: "Kucing" },
  { id: "q-2", text: "Apa arti dari 'inu'?", options: ["Kucing", "Anjing", "Burung", "Ikan"], answer: "Anjing" },
];

describe("useQuizEngine Hook", () => {
  beforeEach(() => {
    useSRSStore.getState().resetSRS();
    useUserStore.getState().resetUser();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("memiliki inisialisasi state kuis default yang benar", () => {
    const { result } = renderHook(() => useQuizEngine(mockQuestions, "lesson-abc"));
    
    expect(result.current.currentIndex).toBe(0);
    expect(result.current.score).toBe(0);
    expect(result.current.isAnswered).toBe(false);
    expect(result.current.isFinished).toBe(false);
  });

  it("handleSelect memproses jawaban benar dan salah dengan menambah skor", () => {
    const { result } = renderHook(() => useQuizEngine(mockQuestions, "lesson-abc"));

    // Pilih jawaban benar ("Kucing")
    act(() => {
      result.current.handleSelect("Kucing");
    });

    expect(result.current.isAnswered).toBe(true);
    expect(result.current.selectedOption).toBe("Kucing");
    expect(result.current.score).toBe(1);

    // Lanjut ke soal berikutnya
    act(() => {
      result.current.nextQuestion();
    });

    expect(result.current.currentIndex).toBe(1);
    expect(result.current.isAnswered).toBe(false);
    expect(result.current.selectedOption).toBe(null);

    // Pilih jawaban salah ("Kucing" untuk 'inu')
    act(() => {
      result.current.handleSelect("Kucing"); // salah (harus anjing)
    });

    expect(result.current.score).toBe(1); // tetap 1
  });

  it("handleFinish memicu penambahan XP dan menyelesaikan pelajaran (jika skor >= 70%)", () => {
    const { result } = renderHook(() => useQuizEngine(mockQuestions, "lesson-123"));

    // Jawab benar semua
    act(() => { result.current.handleSelect("Kucing"); });
    act(() => { result.current.nextQuestion(); });
    act(() => { result.current.handleSelect("Anjing"); });
    act(() => { result.current.nextQuestion(); });

    expect(result.current.isFinished).toBe(true);
    expect(result.current.score).toBe(2);

    // XP = 2 * 25 + 50 (bonus perfect) = 100 XP
    expect(result.current.xpGained).toBe(100);
    expect(useUserStore.getState().xp).toBe(100);

    // Skor 100% >= 70%, jadi completeLesson dipicu untuk "lesson-123"
    expect(useUserStore.getState().completedLessons["lesson-123"]).toBeDefined();
  });

  it("resetQuiz mengatur ulang semua state kuis ke default", () => {
    const { result } = renderHook(() => useQuizEngine(mockQuestions, "lesson-123"));

    act(() => { result.current.handleSelect("Kucing"); });
    act(() => { result.current.nextQuestion(); });

    expect(result.current.currentIndex).toBe(1);

    act(() => { result.current.resetQuiz(); });

    expect(result.current.currentIndex).toBe(0);
    expect(result.current.score).toBe(0);
    expect(result.current.isAnswered).toBe(false);
  });
});
