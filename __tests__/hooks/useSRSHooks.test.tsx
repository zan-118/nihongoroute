import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSRSReview } from "@/components/features/srs/review/useSRSReview";
import { useSRSStore } from "@/store/useSRSStore";
import { useUserStore } from "@/store/useUserStore";

// Mock next/navigation
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

const mockCards = [
  { id: "word-1", kanji: "猫", kana: "ねこ", english: "Cat", status: "vocabulary" as const },
  { id: "word-2", kanji: "犬", kana: "いぬ", english: "Dog", status: "vocabulary" as const },
];

describe("useSRSReview Hook (useSRSHooks)", () => {
  beforeEach(() => {
    useSRSStore.getState().resetSRS();
    useUserStore.getState().resetUser();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("memposisikan index pada 0 di awal", () => {
    const { result } = renderHook(() => useSRSReview(mockCards));
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current.currentIndex).toBe(0);
    expect(result.current.isFlipped).toBe(false);
    expect(result.current.isFinished).toBe(false);
  });

  it("toggleFlip membalikkan status isFlipped", () => {
    const { result } = renderHook(() => useSRSReview(mockCards));
    act(() => {
      vi.advanceTimersByTime(100);
    });

    act(() => {
      result.current.toggleFlip();
    });
    expect(result.current.isFlipped).toBe(true);

    act(() => {
      result.current.toggleFlip();
    });
    expect(result.current.isFlipped).toBe(false);
  });

  it("handleAnswer memicu update progress dan berpindah ke kartu berikutnya", () => {
    const { result } = renderHook(() => useSRSReview(mockCards));
    act(() => {
      vi.advanceTimersByTime(100);
    });

    const initialCard = result.current.currentCard;
    expect(initialCard).toBeDefined();

    // Beri jawaban benar (grade 2)
    act(() => {
      result.current.handleAnswer(2);
    });

    expect(result.current.flash).toBe("correct");
    expect(result.current.earnedXP).toBe(10);

    // Majukan timer untuk timeout srs transition (300ms)
    act(() => {
      vi.advanceTimersByTime(350);
    });

    // Indeks bertambah ke ulasan berikutnya
    expect(result.current.currentIndex).toBe(1);
    expect(result.current.flash).toBe(null);
  });

  it("menyelesaikan ulasan saat kartu terakhir dijawab", () => {
    const { result } = renderHook(() => useSRSReview([mockCards[0]]));
    act(() => {
      vi.advanceTimersByTime(100);
    });

    act(() => {
      result.current.handleAnswer(0); // Salah
    });

    act(() => {
      vi.advanceTimersByTime(350);
    });

    expect(result.current.isFinished).toBe(true);
  });
});
