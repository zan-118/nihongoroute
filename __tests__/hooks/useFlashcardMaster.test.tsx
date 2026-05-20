import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFlashcardMaster } from "@/components/features/flashcards/master/useFlashcardMaster";
import { useSRSStore } from "@/store/useSRSStore";
import { useUserStore } from "@/store/useUserStore";

// Mock router
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
}));

// Mock audio
vi.mock("@/lib/audio", () => ({
  sounds: {
    playSuccess: vi.fn(),
    playError: vi.fn(),
    playPop: vi.fn(),
  },
}));

// Mock confetti
vi.mock("canvas-confetti", () => ({
  default: vi.fn(),
}));

const mockMasterCards = [
  { id: "c-1", word: "猫", furigana: "ねこ", meaning: "Cat", note: "" },
  { id: "c-2", word: "犬", furigana: "いぬ", meaning: "Dog", note: "" },
];

describe("useFlashcardMaster Hook", () => {
  beforeEach(() => {
    useSRSStore.getState().resetSRS();
    useUserStore.getState().resetUser();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("memiliki state inisialisasi yang benar", () => {
    const { result } = renderHook(() => useFlashcardMaster({ cards: mockMasterCards }));
    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current.currentIndex).toBe(0);
    expect(result.current.isFlipped).toBe(false);
    expect(result.current.studyMode).toBe("latihan");
    expect(result.current.isFinished).toBe(false);
    expect(result.current.sessionStats.known).toBe(0);
  });

  it("handleNav beroperasi pada mode latihan", () => {
    const { result } = renderHook(() => useFlashcardMaster({ cards: mockMasterCards }));
    act(() => {
      vi.advanceTimersByTime(100);
    });

    // Navigasi ke kanan (+1)
    act(() => {
      result.current.handleNav(1);
    });
    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(result.current.currentIndex).toBe(1);

    // Navigasi ke kiri (-1)
    act(() => {
      result.current.handleNav(-1);
    });
    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(result.current.currentIndex).toBe(0);
  });

  it("handleAnswer memperbarui statistik dan berpindah kartu", () => {
    const { result } = renderHook(() => useFlashcardMaster({ cards: mockMasterCards, initialMode: "ujian" }));
    act(() => {
      vi.advanceTimersByTime(100);
    });

    // Grade 3 (Mudah, Benar)
    act(() => {
      result.current.handleAnswer(3);
    });

    expect(result.current.sessionStats.known).toBe(1);
    expect(result.current.sessionStats.xpGained).toBe(20); // grade 3 -> 20 XP
    expect(result.current.combo).toBe(1);

    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(result.current.currentIndex).toBe(1);
  });

  it("checkAnswer memproses input text pada mode tantangan", () => {
    const { result } = renderHook(() =>
      useFlashcardMaster({ cards: mockMasterCards, initialMode: "tantangan" })
    );
    act(() => {
      vi.advanceTimersByTime(100);
    });

    // Input salah
    act(() => {
      result.current.setUserInput("salah");
    });
    act(() => {
      result.current.checkAnswer();
    });
    expect(result.current.inputResult).toBe("wrong");
    expect(result.current.isAnswerChecked).toBe(true);
    expect(result.current.isFlipped).toBe(false);

    // Reset input dan input benar ("ねこ")
    act(() => {
      result.current.setIsAnswerChecked(false);
      result.current.setUserInput("ねこ");
    });
    act(() => {
      result.current.checkAnswer();
    });
    expect(result.current.inputResult).toBe("correct");

    act(() => {
      vi.advanceTimersByTime(600);
    });
    expect(result.current.isFlipped).toBe(true);
  });

  it("handleReviewMistakes me-reset ulang sesi hanya untuk kesalahan yang tercatat", () => {
    const { result } = renderHook(() =>
      useFlashcardMaster({ cards: mockMasterCards, initialMode: "ujian" })
    );
    act(() => {
      vi.advanceTimersByTime(100);
    });

    // Jawab salah pada kartu pertama (index 0)
    act(() => {
      result.current.handleAnswer(0); // Grade 0 -> salah
    });
    act(() => {
      vi.advanceTimersByTime(250);
    });

    // Jawab benar pada kartu kedua (index 1)
    act(() => {
      result.current.handleAnswer(3); // Grade 3 -> benar
    });
    act(() => {
      vi.advanceTimersByTime(250);
    });

    expect(result.current.isFinished).toBe(true);
    expect(result.current.mistakeIndices).toContain(0);

    // Jalankan review mistakes
    act(() => {
      result.current.handleReviewMistakes();
    });

    expect(result.current.isFinished).toBe(false);
    expect(result.current.currentCards.length).toBe(1);
    expect(result.current.currentCards[0].id).toBe("c-1");
  });
});
