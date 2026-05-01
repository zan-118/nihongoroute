import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useQuizEngine } from "@/components/features/exams/quiz-engine/useQuizEngine";
import { useProgressStore } from "@/store/useProgressStore";
import { QuizQuestion } from "@/components/features/exams/quiz-engine/types";

// Mock audio
vi.mock("@/lib/audio", () => ({
  sounds: {
    playSuccess: vi.fn(),
    playError: vi.fn(),
    playPop: vi.fn(),
  },
}));

const mockQuestions: QuizQuestion[] = [
  { question: "Apa arti 'Neko'?", options: ["Anjing", "Kucing", "Burung", "Ikan"], answer: "Kucing" },
  { question: "Apa arti 'Inu'?", options: ["Anjing", "Kucing", "Kuda", "Kelinci"], answer: "Anjing" },
  { question: "Apa arti 'Sakana'?", options: ["Ikan", "Daging", "Sayur", "Buah"], answer: "Ikan" },
];

describe("useQuizEngine", () => {
  beforeEach(() => {
    useProgressStore.setState({
      progress: { xp: 100, level: 2, streak: 1, todayReviewCount: 0, lastStudyDate: null, studyDays: {}, srs: {} },
      loading: false,
      dirtySrs: new Set(),
      isAuthenticated: false,
      userFullName: null,
    });
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("memulai quiz dari index 0", () => {
    const { result } = renderHook(() => useQuizEngine(mockQuestions));
    expect(result.current.currentIndex).toBe(0);
    expect(result.current.score).toBe(0);
    expect(result.current.isFinished).toBe(false);
  });

  it("menandai jawaban yang dipilih", () => {
    const { result } = renderHook(() => useQuizEngine(mockQuestions));

    act(() => {
      result.current.handleSelect("Kucing");
    });

    expect(result.current.selectedOption).toBe("Kucing");
    expect(result.current.isAnswered).toBe(true);
  });

  it("menambah skor saat jawaban benar", () => {
    const { result } = renderHook(() => useQuizEngine(mockQuestions));

    act(() => {
      result.current.handleSelect("Kucing"); // benar
      vi.advanceTimersByTime(1600);
    });

    expect(result.current.score).toBe(1);
  });

  it("tidak menambah skor saat jawaban salah", () => {
    const { result } = renderHook(() => useQuizEngine(mockQuestions));

    act(() => {
      result.current.handleSelect("Anjing"); // salah (jawaban benar: Kucing)
      vi.advanceTimersByTime(1600);
    });

    expect(result.current.score).toBe(0);
  });

  it("pindah ke soal berikutnya setelah delay", () => {
    const { result } = renderHook(() => useQuizEngine(mockQuestions));

    act(() => {
      result.current.handleSelect("Kucing");
      vi.advanceTimersByTime(1600);
    });

    expect(result.current.currentIndex).toBe(1);
    expect(result.current.selectedOption).toBeNull();
    expect(result.current.isAnswered).toBe(false);
  });

  it("menyelesaikan quiz setelah soal terakhir", () => {
    const { result } = renderHook(() => useQuizEngine(mockQuestions));

    // Jawab semua soal dengan benar
    act(() => {
      result.current.handleSelect("Kucing"); // soal 1 benar
      vi.advanceTimersByTime(1600);
    });
    act(() => {
      result.current.handleSelect("Anjing"); // soal 2 benar
      vi.advanceTimersByTime(1600);
    });
    act(() => {
      result.current.handleSelect("Ikan"); // soal 3 benar -> finish
      vi.advanceTimersByTime(1600);
    });

    expect(result.current.isFinished).toBe(true);
    expect(result.current.score).toBe(3);
  });

  it("memberikan XP setelah quiz selesai (base + bonus perfect)", () => {
    const { result } = renderHook(() => useQuizEngine(mockQuestions));

    // Jawab semua benar
    act(() => { result.current.handleSelect("Kucing"); vi.advanceTimersByTime(1600); });
    act(() => { result.current.handleSelect("Anjing"); vi.advanceTimersByTime(1600); });
    act(() => { result.current.handleSelect("Ikan"); vi.advanceTimersByTime(1600); });

    // 3 * 25 (base) + 50 (bonus perfect) = 125 XP + 100 existing = 225
    expect(useProgressStore.getState().progress.xp).toBe(225);
    expect(result.current.xpGained).toBe(125);
  });

  it("tidak memberikan bonus perfect jika ada jawaban salah", () => {
    const { result } = renderHook(() => useQuizEngine(mockQuestions));

    act(() => { result.current.handleSelect("Kucing"); vi.advanceTimersByTime(1600); }); // benar
    act(() => { result.current.handleSelect("Kucing"); vi.advanceTimersByTime(1600); }); // salah
    act(() => { result.current.handleSelect("Ikan"); vi.advanceTimersByTime(1600); }); // benar -> finish

    // 2 * 25 (base) + 0 (no bonus) = 50 XP + 100 existing = 150
    expect(useProgressStore.getState().progress.xp).toBe(150);
    expect(result.current.xpGained).toBe(50);
  });

  it("tidak bisa menjawab dua kali di soal yang sama", () => {
    const { result } = renderHook(() => useQuizEngine(mockQuestions));

    act(() => {
      result.current.handleSelect("Kucing");
    });

    // Coba jawab lagi sebelum timeout
    act(() => {
      result.current.handleSelect("Anjing");
    });

    // Jawaban pertama tetap dipertahankan
    expect(result.current.selectedOption).toBe("Kucing");
  });

  it("resetQuiz mengembalikan semua state ke awal", () => {
    const { result } = renderHook(() => useQuizEngine(mockQuestions));

    // Jawab satu soal
    act(() => { result.current.handleSelect("Kucing"); vi.advanceTimersByTime(1600); });

    // Reset
    act(() => { result.current.resetQuiz(); });

    expect(result.current.currentIndex).toBe(0);
    expect(result.current.score).toBe(0);
    expect(result.current.isFinished).toBe(false);
    expect(result.current.selectedOption).toBeNull();
    expect(result.current.isAnswered).toBe(false);
  });
});
